import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { isNewItem, getTimeSinceAdded, sortItemsByNewness, hasMultipleSessions } from '../utils/itemUtils';
import { 
  updateOrderStatus, 
  deleteOrder, 
  bulkUpdateOrderStatus,
  searchOrders,
  fetchTables,
  getOrderById
} from '../services/api';
import toast from 'react-hot-toast';
import AdminHeader from '../components/AdminHeader';
import socketService from '../services/socketService';
import CustomDropdown from '../components/CustomDropdown';

const AdminOrdersPage = () => {

  
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    table_id: '',
    date_from: '',
    date_to: '',
    query: ''
  });
  const [tables, setTables] = useState([]);
  const [viewMode, setViewMode] = useState('all'); // all, pending, preparing, ready, completed
  const [completedOrders, setCompletedOrders] = useState([]); // Track completed orders separately
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    orderId: null,
    orderNumber: null,
    customerName: null,
    tableNumber: null
  });

  const [activeOrdersModal, setActiveOrdersModal] = useState({
    isOpen: false,
    customerName: null,
    activeOrders: [],
    blockedOrderId: null
  });

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Load orders based on filters and view mode
      let searchParams = { ...filters };
      if (viewMode !== 'all') {
        searchParams.status = viewMode;
      }
      
      const [ordersData, tablesData] = await Promise.all([
        searchOrders(searchParams),
        fetchTables()
      ]);
      
      // Separate completed orders from active orders
      const activeOrders = (ordersData || []).filter(order => order.status !== 'completed');
      const completedOrders = (ordersData || []).filter(order => order.status === 'completed');
      
      setOrders(activeOrders);
      setCompletedOrders(completedOrders);
      setTables(tablesData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };


  
  // Data loading useEffect - ALWAYS RUN
  useEffect(() => {
    loadDashboardData(); // eslint-disable-line react-hooks/exhaustive-deps
  }, [filters, viewMode]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Socket setup for realtime updates - minimal: reload on any event
  useEffect(() => {
    try {
      if (!socketService.isConnected) {
        socketService.connect();
      }
      socketService.joinAdminRoom();

      const handleNewOrder = () => {
        toast.success('New order received');
        loadDashboardData();
      };

      const handleStatusUpdate = (data) => {
        loadDashboardData();
      };

      const handleOrderDeleted = (data) => {
        loadDashboardData();
      };

      socketService.onNewOrder(handleNewOrder);
      socketService.onOrderStatusUpdate(handleStatusUpdate);
      socketService.onOrderDeleted(handleOrderDeleted);

      return () => {
        socketService.removeListener('new-order');
        socketService.removeListener('order-status-update');
        socketService.removeListener('order-deleted');
      };
    } catch (error) {
      console.error('Error setting up socket:', error);
    }
  }, []);


  // Validate status transitions to prevent backward movement
  const isValidStatusTransition = (currentStatus, newStatus) => {
    const statusFlow = {
      'pending': ['preparing', 'cancelled'],
      'preparing': ['ready', 'cancelled'],
      'ready': ['completed', 'cancelled'],
      'completed': [], // No further transitions allowed
      'cancelled': [] // No further transitions allowed
    };
    
    return statusFlow[currentStatus]?.includes(newStatus) || false;
  };

  // Check if order can be completed (no other active orders for same customer)
  const canCompleteOrder = (order) => {
    // Check if customer has other active orders
    const otherActiveOrders = orders.filter(o => 
      o.id !== order.id && 
      o.customer_name === order.customer_name &&
      o.status !== 'completed' && 
      o.status !== 'cancelled'
    );
    
    return otherActiveOrders.length === 0;
  };

  // Get other active orders for a customer
  const getOtherActiveOrders = (order) => {
    return orders.filter(o => 
      o.id !== order.id && 
      o.customer_name === order.customer_name &&
      o.status !== 'completed' && 
      o.status !== 'cancelled'
    );
  };

  // Show active orders modal
  const showActiveOrdersModal = (order) => {
    const otherActiveOrders = getOtherActiveOrders(order);
    setActiveOrdersModal({
      isOpen: true,
      customerName: order.customer_name,
      activeOrders: otherActiveOrders,
      blockedOrderId: order.id
    });
  };

  // Close active orders modal
  const closeActiveOrdersModal = () => {
    setActiveOrdersModal({
      isOpen: false,
      customerName: null,
      activeOrders: [],
      blockedOrderId: null
    });
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      // Find the current order to get its status
      const currentOrder = orders.find(order => order.id === orderId) || 
                          completedOrders.find(order => order.id === orderId);
      
      if (!currentOrder) {
        toast.error('Order not found');
        return;
      }

      // Validate status transition
      if (!isValidStatusTransition(currentOrder.status, newStatus)) {
        toast.error(`Cannot change status from "${currentOrder.status}" to "${newStatus}". Invalid transition.`);
        return;
      }

      await updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated successfully');
      // Don't reload data since socket will handle the update
    } catch (error) {
      console.error('Error updating order status:', error);
      
      // Handle specific error for active orders
      if (error.response?.data?.error?.includes('other active orders')) {
        const activeOrders = error.response.data.activeOrders;
        const customerName = error.response.data.customerName;
        
        // Show detailed error with active orders list
        toast.error(`Cannot complete order. ${customerName} has other active orders.`, {
          duration: 8000
        });
        
        // Show active orders details
        const activeOrdersList = activeOrders.map(order => 
          `Order #${order.order_number} (${order.status})`
        ).join(', ');
        
        toast.success(`Active orders: ${activeOrdersList}`, {
          duration: 10000
        });
      } else {
        toast.error('Failed to update order status');
      }
    }
  };

  const handleDeleteOrder = async (orderId) => {
    // Find the order details to show in modal
    const orderToDelete = orders.find(order => order.id === orderId) || 
                         completedOrders.find(order => order.id === orderId);
    
    if (orderToDelete) {
      setDeleteModal({
        isOpen: true,
        orderId: orderId,
        orderNumber: orderToDelete.order_number || orderId,
        customerName: orderToDelete.customer_name,
        tableNumber: orderToDelete.table_number
      });
    }
  };

  const confirmDeleteOrder = async () => {
    try {
      await deleteOrder(deleteModal.orderId);
      toast.success('Order deleted successfully');
      setDeleteModal({ isOpen: false, orderId: null, orderNumber: null, customerName: null, tableNumber: null });
      
      // Fallback: reload data after a short delay if socket doesn't work
      setTimeout(() => {
        loadDashboardData();
      }, 1000);
    } catch (error) {
      toast.error('Failed to delete order');
    }
  };

  const cancelDeleteOrder = () => {
    setDeleteModal({ isOpen: false, orderId: null, orderNumber: null, customerName: null, tableNumber: null });
  };

  const handleViewOrderDetails = async (orderId) => {
    try {
      const orderDetails = await getOrderById(orderId);
      setSelectedOrderDetails(orderDetails);
      setShowOrderModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    if (selectedOrders.length === 0) {
      toast.error('Please select orders to update');
      return;
    }

    try {
      await bulkUpdateOrderStatus(selectedOrders, status);
      toast.success(`${selectedOrders.length} orders updated successfully`);
      setSelectedOrders([]);
      // Don't reload data since socket will handle the updates
    } catch (error) {
      toast.error('Failed to bulk update orders');
    }
  };

  const handleClearCompletedOrders = () => {
    // Show confirmation dialog
    const confirmed = window.confirm('Clear completed orders from screen? (Data will be kept for analytics)');
    
    if (!confirmed) {
      return;
    }

    // Clear completed orders from local state only (keep in database)
    setCompletedOrders([]);
    
    toast.success('Completed orders cleared from screen');
  };

    const handleOrderSelection = (orderId) => {
    // Find the order to check its status
    const order = orders.find(o => o.id === orderId) || completedOrders.find(o => o.id === orderId);
    
    // Prevent selection of completed or cancelled orders
    if (order && (order.status === 'completed' || order.status === 'cancelled')) {
      toast.error('Cannot select completed or cancelled orders for bulk actions');
      return;
    }
    
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    const currentOrders = viewMode === 'completed' ? completedOrders : orders;
    // Filter out completed and cancelled orders from bulk selection
    const selectableOrders = currentOrders.filter(order => 
      order.status !== 'completed' && order.status !== 'cancelled'
    );
    
    if (selectedOrders.length === selectableOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(selectableOrders.map(order => order.id));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500',
      confirmed: 'bg-blue-500',
      preparing: 'bg-orange-500',
      ready: 'bg-green-500',
      completed: 'bg-gray-500',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };


  
  if (loading) {
    return (
      <div className="min-h-screen bg-sangeet-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-sangeet-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }


  
  return (
    <div className="min-h-screen bg-sangeet-neutral-950">
      <AdminHeader />

      <div className="max-w-7xl mx-auto p-6">
        {/* Live Updates Indicator */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 mb-6 text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <p className="text-blue-300 text-sm">
              🔄 Order list updates automatically in real-time
            </p>
          </div>
        </div>



        {/* Filters and Controls */}
        <div className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-xl p-6 mb-6 border border-sangeet-neutral-700">
          {/* Status Filter Buttons Row */}
          <div className="flex flex-wrap gap-2 mb-4">
            {['all', 'pending', 'preparing', 'ready', 'completed'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === mode
                    ? 'bg-sangeet-400 text-sangeet-neutral-950'
                    : 'bg-sangeet-neutral-800 text-sangeet-neutral-400 hover:bg-sangeet-neutral-700'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                {mode === 'completed' && completedOrders.length > 0 && (
                  <span className="ml-1 bg-sangeet-neutral-700 text-sangeet-neutral-300 px-1.5 py-0.5 rounded-full text-xs">
                    {completedOrders.length}
                  </span>
                )}
              </button>
            ))}
                          {viewMode === 'completed' && completedOrders.length > 0 && (
                <button
                  onClick={handleClearCompletedOrders}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Clear
                </button>
              )}
          </div>

          {/* Search and Table Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search by customer name or order number..."
                value={filters.query}
                onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                className="w-full px-4 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-lg text-sangeet-neutral-300 focus:outline-none focus:border-sangeet-400"
              />
            </div>

            {/* Table Filter */}
            <div>
              <CustomDropdown
                value={filters.table_id}
                onChange={(tableId) => setFilters(prev => ({ ...prev, table_id: tableId }))}
                options={[
                  { value: '', label: 'All Tables' },
                  ...tables.map(table => ({ 
                    value: table.id, 
                    label: `Table ${table.table_number}` 
                  }))
                ]}
                className="w-full"
              />
            </div>
          </div>

          {/* Date Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sangeet-neutral-400 text-sm mb-2">From Date</label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
                className="w-full px-4 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-lg text-sangeet-neutral-300 focus:outline-none focus:border-sangeet-400 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:contrast-200"
              />
            </div>
            <div>
              <label className="block text-sangeet-neutral-400 text-sm mb-2">To Date</label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
                className="w-full px-4 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-lg text-sangeet-neutral-300 focus:outline-none focus:border-sangeet-400 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:contrast-200"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ status: '', table_id: '', date_from: '', date_to: '', query: '' })}
                className="w-full px-4 py-2 bg-sangeet-neutral-700 text-sangeet-neutral-300 rounded-lg hover:bg-sangeet-neutral-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <div className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-xl p-4 mb-6 border border-sangeet-neutral-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sangeet-neutral-400">
                  {selectedOrders.length} order(s) selected
                </p>
                <p className="text-xs text-sangeet-neutral-500 mt-1">
                  💡 Completed and cancelled orders cannot be modified
                </p>
              </div>
              <div className="flex space-x-2">
                {['preparing', 'ready', 'completed', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleBulkStatusUpdate(status)}
                    className="px-3 py-1 bg-sangeet-400 text-sangeet-neutral-950 rounded text-sm font-medium hover:bg-sangeet-300 transition-colors"
                  >
                    Mark {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-xl border border-sangeet-neutral-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-sangeet-neutral-800">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={(() => {
                        const currentOrders = viewMode === 'completed' ? completedOrders : orders;
                        const selectableOrders = currentOrders.filter(order => 
                          order.status !== 'completed' && order.status !== 'cancelled'
                        );
                        return selectedOrders.length === selectableOrders.length && selectableOrders.length > 0;
                      })()}
                      onChange={handleSelectAll}
                      className="rounded border-sangeet-neutral-600 bg-sangeet-neutral-800 text-sangeet-400 focus:ring-sangeet-400"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sangeet-neutral-400 font-medium">Order #</th>
                  <th className="px-6 py-4 text-left text-sangeet-neutral-400 font-medium">Customer</th>
                  <th className="px-6 py-4 text-left text-sangeet-neutral-400 font-medium">Table</th>
                  <th className="px-6 py-4 text-left text-sangeet-neutral-400 font-medium">Amount</th>
                  <th className="px-6 py-4 text-left text-sangeet-neutral-400 font-medium">Status</th>
                  <th className="px-6 py-4 text-left text-sangeet-neutral-400 font-medium">Date</th>
                  <th className="px-6 py-4 text-left text-sangeet-neutral-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sangeet-neutral-700">
                {(viewMode === 'completed' ? completedOrders : orders).map((order) => (
                  <motion.tr
                    key={`${order.id}-${order.status}-${order.updated_at || order.created_at}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-sangeet-neutral-800 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => handleOrderSelection(order.id)}
                        disabled={order.status === 'completed' || order.status === 'cancelled'}
                        className={`rounded border-sangeet-neutral-600 focus:ring-sangeet-400 ${
                          order.status === 'completed' || order.status === 'cancelled'
                            ? 'bg-sangeet-neutral-700 text-sangeet-neutral-500 cursor-not-allowed'
                            : 'bg-sangeet-neutral-800 text-sangeet-400'
                        }`}
                        title={order.status === 'completed' || order.status === 'cancelled' 
                          ? `Cannot select ${order.status} orders for bulk actions` 
                          : 'Select for bulk actions'
                        }
                      />
                    </td>
                    <td className="px-6 py-4 text-sangeet-400 font-medium">
                      <div className="flex items-center space-x-2">
                        <span>{order.order_number}</span>
                        {order.items && hasMultipleSessions(order.items) && (
                          <span className="bg-blue-500 text-white px-1 py-0.5 rounded text-xs font-medium" title="Merged Order">
                            🔄
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sangeet-neutral-300">{order.customer_name}</td>
                    <td className="px-6 py-4 text-sangeet-neutral-300">Table {order.table_number}</td>
                    <td className="px-6 py-4 text-sangeet-400 font-medium">${order.total_amount}</td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(order.status)} transition-all duration-300`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        {order.updated_at && order.updated_at !== order.created_at && (
                          <div className="text-xs text-sangeet-neutral-500 mt-1">
                            Updated: {formatDate(order.updated_at)}
                          </div>
                        )}
                        {/* Update indicator */}
                        {order.updated_at && order.updated_at !== order.created_at && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                        )}
                        {/* Lock indicator for completed/cancelled orders */}
                        {(order.status === 'completed' || order.status === 'cancelled') && (
                          <div className="absolute -top-1 -left-1 w-3 h-3 bg-sangeet-neutral-600 rounded-full flex items-center justify-center">
                            <span className="text-xs">🔒</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sangeet-neutral-400 text-sm">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <div className="relative">
                          <CustomDropdown
                            value={order.status}
                            onChange={(newStatus) => handleStatusUpdate(order.id, newStatus)}
                            options={statusOptions}
                            className={`text-xs ${order.status === 'completed' || order.status === 'cancelled' ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={order.status === 'completed' || order.status === 'cancelled'}
                          />
                          {(order.status === 'completed' || order.status === 'cancelled') && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-sangeet-neutral-600 rounded-full flex items-center justify-center">
                              <span className="text-xs">🔒</span>
                            </div>
                          )}
                          {!canCompleteOrder(order) && order.status !== 'completed' && order.status !== 'cancelled' && (
                            <button
                              onClick={() => showActiveOrdersModal(order)}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
                              title="Cannot complete - customer has other active orders. Click to view details."
                            >
                              <span className="text-xs">⚠️</span>
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => handleViewOrderDetails(order.id)}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {orders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sangeet-neutral-400">No orders found</p>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {showOrderModal && selectedOrderDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-2xl p-6 border border-sangeet-neutral-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-sangeet-400">
                    Order #{selectedOrderDetails.order_number}
                  </h2>
                  <p className="text-sangeet-neutral-400">
                    Table {selectedOrderDetails.table_number} • {selectedOrderDetails.customer_name}
                  </p>
                </div>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-sangeet-neutral-400 hover:text-sangeet-neutral-300 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Order Status */}
              <div className="mb-6">
                <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(selectedOrderDetails.status)}`}>
                  {selectedOrderDetails.status.charAt(0).toUpperCase() + selectedOrderDetails.status.slice(1)}
                </span>
              </div>

              {/* Order Items */}
              {selectedOrderDetails.items && selectedOrderDetails.items.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-sangeet-neutral-200 mb-4">Order Items</h3>
                  <div className="space-y-3">
                    {sortItemsByNewness(selectedOrderDetails.items).map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 py-2 border-b border-sangeet-neutral-700/50 last:border-b-0 relative">
                        <div className="w-8 h-8 bg-sangeet-neutral-700 rounded-full flex items-center justify-center text-xs font-semibold">
                          {item.quantity}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-sangeet-neutral-200 font-medium">{item.name}</p>
                            {isNewItem(item.created_at) && (
                              <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium animate-pulse">
                                NEW
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-sangeet-neutral-400">
                            ${parseFloat(item.unit_price).toFixed(2)} each
                          </p>
                          <p className="text-xs text-sangeet-neutral-500">
                            {getTimeSinceAdded(item.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sangeet-neutral-200 font-semibold">
                            ${parseFloat(item.total_price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sangeet-neutral-400 text-sm">Order Date</p>
                  <p className="text-sangeet-neutral-200 font-medium">
                    {formatDate(selectedOrderDetails.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sangeet-neutral-400 text-sm">Order Time</p>
                  <p className="text-sangeet-neutral-200 font-medium">
                    {new Date(selectedOrderDetails.created_at).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sangeet-neutral-400 text-sm">Customer</p>
                  <p className="text-sangeet-neutral-200 font-medium">
                    {selectedOrderDetails.customer_name}
                  </p>
                </div>
                <div>
                  <p className="text-sangeet-neutral-400 text-sm">Table</p>
                  <p className="text-sangeet-neutral-200 font-medium">
                    {selectedOrderDetails.table_number}
                  </p>
                </div>
              </div>

              {/* Special Instructions */}
              {selectedOrderDetails.special_instructions && (
                <div className="mb-6">
                  <p className="text-sangeet-neutral-400 text-sm mb-2">Special Instructions</p>
                  <p className="text-sangeet-neutral-200 bg-sangeet-neutral-800/50 rounded-lg p-3">
                    {selectedOrderDetails.special_instructions}
                  </p>
                </div>
              )}

              {/* Total */}
              <div className="border-t border-sangeet-neutral-700 pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold text-sangeet-neutral-200">Total Amount</p>
                  <p className="text-2xl font-bold text-sangeet-400">
                    ${parseFloat(selectedOrderDetails.total_amount).toFixed(2)}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Active Orders Modal */}
        {activeOrdersModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-2xl p-8 border border-sangeet-neutral-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-red-400 mb-2">
                  Cannot Complete Order
                </h2>
                <p className="text-sangeet-neutral-300">
                  {activeOrdersModal.customerName} has other active orders that must be completed first.
                </p>
              </div>

              {/* Active Orders List */}
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6">
                <h3 className="text-red-300 font-medium mb-3">Active Orders:</h3>
                <div className="space-y-3">
                  {activeOrdersModal.activeOrders.map((order) => (
                    <div key={order.id} className="bg-sangeet-neutral-800/50 rounded-lg p-3 border border-sangeet-neutral-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sangeet-400 font-semibold">
                            Order #{order.order_number}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <span className="text-sangeet-neutral-400 text-sm">
                          Table {order.table_number}
                        </span>
                      </div>
                      <div className="text-sangeet-neutral-300 text-sm">
                        Created: {formatDate(order.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <span className="text-yellow-400 text-xl">💡</span>
                  <div>
                    <p className="text-yellow-300 font-medium mb-1">Instructions:</p>
                    <ul className="text-yellow-200 text-sm space-y-1">
                      <li>• Complete all active orders for this customer first</li>
                      <li>• Then you can complete the current order</li>
                      <li>• This prevents orphaned orders and ensures proper payment flow</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-center">
                <button
                  onClick={closeActiveOrdersModal}
                  className="bg-sangeet-neutral-700 hover:bg-sangeet-neutral-600 text-sangeet-neutral-200 font-medium py-3 px-8 rounded-xl transition-colors duration-200"
                >
                  Got It
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={closeActiveOrdersModal}
                className="absolute top-4 right-4 text-sangeet-neutral-400 hover:text-sangeet-neutral-200 text-2xl transition-colors duration-200"
              >
                ×
              </button>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-2xl p-8 border border-sangeet-neutral-700 max-w-md w-full"
            >
              {/* Header */}
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🗑️</div>
                <h2 className="text-2xl font-bold text-red-400 mb-2">
                  Delete Order
                </h2>
                <p className="text-sangeet-neutral-300">
                  Are you sure you want to delete this order? This action cannot be undone.
                </p>
              </div>

              {/* Order Info */}
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-red-300 font-medium">
                    Order #{deleteModal.orderNumber}
                  </p>
                  <span className="text-red-400 text-sm">⚠️</span>
                </div>
                <p className="text-sangeet-neutral-300 text-sm">
                  {deleteModal.customerName} • Table {deleteModal.tableNumber}
                </p>
              </div>

              {/* Warning */}
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <span className="text-yellow-400 text-xl">⚠️</span>
                  <div>
                    <p className="text-yellow-300 font-medium mb-1">Important:</p>
                    <ul className="text-yellow-200 text-sm space-y-1">
                      <li>• Order will be permanently deleted</li>
                      <li>• Customer will be notified automatically</li>
                      <li>• All order data will be cleared</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={cancelDeleteOrder}
                  className="flex-1 bg-sangeet-neutral-700 hover:bg-sangeet-neutral-600 text-sangeet-neutral-200 font-medium py-3 px-4 rounded-xl transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteOrder}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200"
                >
                  Delete Order
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={cancelDeleteOrder}
                className="absolute top-4 right-4 text-sangeet-neutral-400 hover:text-sangeet-neutral-200 text-2xl transition-colors duration-200"
              >
                ×
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage; 