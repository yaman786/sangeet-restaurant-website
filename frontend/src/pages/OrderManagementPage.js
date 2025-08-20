import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AdminHeader from '../components/AdminHeader';
import socketService from '../services/socketService';
import {
  fetchAllOrders,
  updateOrderStatus,
  deleteOrder,
  fetchOrderStats,
  fetchTables
} from '../services/api';

const OrderManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    table_id: '',
    date: ''
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detailed'
  const [updatingOrder, setUpdatingOrder] = useState(null); // Track which order is being updated
  const [completedOrders, setCompletedOrders] = useState([]); // Track completed orders separately

  useEffect(() => {
    // Get user role from localStorage
    const adminUser = localStorage.getItem('adminUser');
    const kitchenUser = localStorage.getItem('kitchenUser');
    
    if (adminUser) {
      const user = JSON.parse(adminUser);
      setUserRole(user.role);
    } else if (kitchenUser) {
      const user = JSON.parse(kitchenUser);
      setUserRole(user.role);
    }
    
    loadData();
  }, [filters]);

  // Setup real-time socket listeners - using a different approach since RealTimeNotifications already handles socket
  const setupSocketListeners = useCallback(() => {
    try {
      console.log('🔌 OrderManagement: Setting up socket listeners...');
      
      // Ensure socket is connected first
      if (!socketService.isConnected) {
        console.log('🔌 OrderManagement: Socket not connected, connecting...');
        socketService.connect();
      }
      
      // Join admin room
      socketService.joinAdmin();
      
      // Listen for new orders
      socketService.onNewOrder((data) => {
        console.log('📦 OrderManagement: New order received:', data);
        console.log('📦 OrderManagement: Reloading data...');
        // Reload data to get the latest orders
        loadData();
      });

      // Listen for order status updates
      socketService.onOrderStatusUpdate((data) => {
        console.log('📦 OrderManagement: Status update received:', data);
        // Reload data to get the latest status
        loadData();
      });

      // Listen for order deletions
      socketService.onOrderDeleted((data) => {
        console.log('📦 OrderManagement: Order deleted:', data);
        // Reload data to remove deleted order
        loadData();
      });

    } catch (error) {
      console.error('Error setting up socket listeners:', error);
    }
  }, []); // Empty dependency array to prevent recreation

  useEffect(() => {
    console.log('🔌 OrderManagement: useEffect triggered - setting up socket listeners');
    // Setup socket listeners immediately
    setupSocketListeners();

    return () => {
      console.log('🔌 OrderManagement: Cleanup - removing socket listeners');
      socketService.removeListener('new-order');
      socketService.removeListener('order-status-update');
      socketService.removeListener('order-deleted');
    };
  }, []); // Empty dependency array to run only once

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, tablesData, statsData] = await Promise.all([
        fetchAllOrders(filters),
        fetchTables(),
        fetchOrderStats()
      ]);
      
      // Separate completed orders from active orders
      const activeOrders = (ordersData || []).filter(order => order.status !== 'completed');
      const completedOrders = (ordersData || []).filter(order => order.status === 'completed');
      
      setOrders(activeOrders);
      setCompletedOrders(completedOrders);
      setTables(tablesData || []);
      setStats(statsData || {});
    } catch (error) {
      console.error('Error loading data:', error);
      console.log('Using fallback data - API may not be available');
      
      // Fallback data if API fails
      const fallbackActiveOrders = [
        {
          id: 1,
          order_number: 'ORD-001',
          customer_name: 'John Doe',
          table_id: 1,
          status: 'pending',
          total_amount: 45.99,
          created_at: new Date().toISOString(),
          items: [
            { name: 'Butter Chicken', quantity: 2, price: 18.99 },
            { name: 'Naan', quantity: 2, price: 4.00 }
          ]
        },
        {
          id: 2,
          order_number: 'ORD-002',
          customer_name: 'Jane Smith',
          table_id: 3,
          status: 'preparing',
          total_amount: 32.50,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          items: [
            { name: 'Paneer Tikka', quantity: 1, price: 16.99 },
            { name: 'Biryani', quantity: 1, price: 22.99 }
          ]
        }
      ];
      
      const fallbackCompletedOrders = [
        {
          id: 3,
          order_number: 'ORD-003',
          customer_name: 'Mike Wilson',
          table_id: 2,
          status: 'completed',
          total_amount: 28.50,
          created_at: new Date(Date.now() - 7200000).toISOString(),
          items: [
            { name: 'Chicken Tikka', quantity: 1, price: 12.00 },
            { name: 'Momo Dumplings', quantity: 1, price: 18.00 }
          ]
        }
      ];
      
      setOrders(fallbackActiveOrders);
      setCompletedOrders(fallbackCompletedOrders);
      
      // Show error message instead of demo data
      toast.error('Failed to load data. Please check your connection and try again.');
      
      // Set empty arrays instead of demo data
      setTables([]);
      setStats({
        total_orders: 0,
        pending_orders: 0,
        preparing_orders: 0,
        completed_orders: 0,
        total_revenue: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(orderId);
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      loadData();
    } catch (error) {
      toast.error('Failed to update order status');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleDelete = async (orderId) => {
    try {
      await deleteOrder(orderId);
      toast.success('Order deleted successfully');
      setShowDeleteModal(false);
      setSelectedOrder(null);
      loadData();
    } catch (error) {
      toast.error('Failed to delete order');
    }
  };

  const clearCompletedOrders = () => {
    setCompletedOrders([]);
    toast.success('Completed orders cleared');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTableNumber = (tableId) => {
    const table = tables.find(t => t.id === tableId);
    return table ? table.table_number : 'N/A';
  };

  const calculateRevenue = () => {
    return orders.reduce((total, order) => {
      return total + parseFloat(order.total_amount || 0);
    }, 0);
  };

  // Filter orders based on user role
  const getFilteredOrders = () => {
    let filtered = orders;

    // Apply role-based filtering
    if (userRole !== 'admin') {
      // Staff only sees active orders (not completed/cancelled)
      filtered = filtered.filter(order => 
        ['pending', 'preparing', 'ready'].includes(order.status)
      );
    }

    // Apply status filter
    if (filters.status === 'completed') {
      // Show completed orders
      filtered = completedOrders;
    } else if (filters.status) {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    // Apply table filter
    if (filters.table_id) {
      filtered = filtered.filter(order => order.table_id === parseInt(filters.table_id));
    }

    // Apply date filter
    if (filters.date) {
      const filterDate = new Date(filters.date).toDateString();
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.created_at).toDateString();
        return orderDate === filterDate;
      });
    }

    return filtered;
  };

  const filteredOrders = getFilteredOrders();

  // Always render the main component to ensure socket setup runs
  return (
    <div className="min-h-screen bg-sangeet-neutral-50">
      <AdminHeader />
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sangeet-400"></div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

  return (
    <div className="min-h-screen bg-sangeet-neutral-50">
      <AdminHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Role-based Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-sangeet-neutral-900 mb-2">
            {userRole === 'admin' ? 'Order Management' : 'Kitchen Orders'}
          </h1>
          <p className="text-sangeet-neutral-600">
            {userRole === 'admin' 
              ? 'Manage all orders, track business analytics, and handle customer inquiries'
              : 'View and update current orders for kitchen operations'
            }
          </p>
        </div>

        {/* Business Analytics - Admin Only */}
        {userRole === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h3 className="text-sm font-medium text-sangeet-neutral-600">Total Orders</h3>
              <p className="text-2xl font-bold text-sangeet-neutral-900">{stats.total_orders || 0}</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h3 className="text-sm font-medium text-sangeet-neutral-600">Total Revenue</h3>
              <p className="text-2xl font-bold text-green-600">${calculateRevenue().toFixed(2)}</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h3 className="text-sm font-medium text-sangeet-neutral-600">Active Orders</h3>
              <p className="text-2xl font-bold text-blue-600">
                {orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status)).length}
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h3 className="text-sm font-medium text-sangeet-neutral-600">Avg Order Value</h3>
              <p className="text-2xl font-bold text-sangeet-neutral-900">
                ${orders.length > 0 ? (calculateRevenue() / orders.length).toFixed(2) : '0.00'}
              </p>
            </motion.div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <h2 className="text-lg font-semibold text-sangeet-neutral-900">
              {userRole === 'admin' ? 'Order Management' : 'Kitchen Orders'}
            </h2>
            
            {userRole === 'admin' && (
              <div className="flex space-x-4">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    viewMode === 'list' 
                      ? 'bg-sangeet-400 text-sangeet-neutral-950' 
                      : 'bg-sangeet-neutral-200 text-sangeet-neutral-700'
                  }`}
                >
                  List View
                </button>
                <button
                  onClick={() => setViewMode('detailed')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    viewMode === 'detailed' 
                      ? 'bg-sangeet-400 text-sangeet-neutral-950' 
                      : 'bg-sangeet-neutral-200 text-sangeet-neutral-700'
                  }`}
                >
                  Detailed View
                </button>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="space-y-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-sangeet-neutral-700 mb-3">
                Filter by Status
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilters({ ...filters, status: '' })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                    filters.status === ''
                      ? 'bg-sangeet-400 text-sangeet-neutral-950 shadow-lg'
                      : 'bg-sangeet-neutral-100 text-sangeet-neutral-700 hover:bg-sangeet-neutral-200 border border-sangeet-neutral-300'
                  }`}
                >
                  📋 All Statuses
                </button>
                <button
                  onClick={() => setFilters({ ...filters, status: 'pending' })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                    filters.status === 'pending'
                      ? 'bg-yellow-500 text-white shadow-lg'
                      : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-300'
                  }`}
                >
                  ⏳ Pending
                </button>

                <button
                  onClick={() => setFilters({ ...filters, status: 'preparing' })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                    filters.status === 'preparing'
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-300'
                  }`}
                >
                  👨‍🍳 Preparing
                </button>
                <button
                  onClick={() => setFilters({ ...filters, status: 'ready' })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                    filters.status === 'ready'
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                  }`}
                >
                  🎉 Ready
                </button>
                <button
                  onClick={() => setFilters({ ...filters, status: 'completed' })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                    filters.status === 'completed'
                      ? 'bg-gray-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  ✅ Completed
                  {completedOrders.length > 0 && (
                    <span className="ml-1 bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded-full text-xs">
                      {completedOrders.length}
                    </span>
                  )}
                </button>
                {userRole === 'admin' && (
                  <button
                    onClick={() => setFilters({ ...filters, status: 'cancelled' })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                      filters.status === 'cancelled'
                        ? 'bg-red-500 text-white shadow-lg'
                        : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
                    }`}
                  >
                    ❌ Cancelled
                  </button>
                )}
                {filters.status === 'completed' && completedOrders.length > 0 && (
                  <button
                    onClick={clearCompletedOrders}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-sangeet-neutral-700 mb-3">
                Filter by Table
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilters({ ...filters, table_id: '' })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                    filters.table_id === ''
                      ? 'bg-sangeet-400 text-sangeet-neutral-950 shadow-lg'
                      : 'bg-sangeet-neutral-100 text-sangeet-neutral-700 hover:bg-sangeet-neutral-200 border border-sangeet-neutral-300'
                  }`}
                >
                  🏢 All Tables
                </button>
                {tables.map(table => (
                  <button
                    key={table.id}
                    onClick={() => setFilters({ ...filters, table_id: table.id })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                      filters.table_id === table.id
                        ? 'bg-sangeet-400 text-sangeet-neutral-950 shadow-lg'
                        : 'bg-sangeet-neutral-100 text-sangeet-neutral-700 hover:bg-sangeet-neutral-200 border border-sangeet-neutral-300'
                    }`}
                  >
                    🍽️ Table {table.table_number}
                  </button>
                ))}
              </div>
            </div>
            
            {userRole === 'admin' && (
              <div>
                <label className="block text-sm font-medium text-sangeet-neutral-700 mb-3">
                  Filter by Date
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilters({ ...filters, date: '' })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                      filters.date === ''
                        ? 'bg-sangeet-400 text-sangeet-neutral-950 shadow-lg'
                        : 'bg-sangeet-neutral-100 text-sangeet-neutral-700 hover:bg-sangeet-neutral-200 border border-sangeet-neutral-300'
                    }`}
                  >
                    📅 All Dates
                  </button>
                  <button
                    onClick={() => setFilters({ ...filters, date: new Date().toISOString().split('T')[0] })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                      filters.date === new Date().toISOString().split('T')[0]
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300'
                    }`}
                  >
                    📅 Today
                  </button>
                  <div className="relative">
                    <input
                      type="date"
                      value={filters.date}
                      onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                      className="px-4 py-2 rounded-lg text-sm font-medium border border-sangeet-neutral-300 focus:outline-none focus:ring-2 focus:ring-sangeet-400 bg-white hover:bg-sangeet-neutral-50 transition-all duration-200"
                      placeholder="Select Date"
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ status: '', table_id: '', date: '' })}
                className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 border border-red-300 transition-all duration-200 transform hover:scale-105"
              >
                🗑️ Clear All Filters
              </button>
            </div>
          </div>
        </div>

        {/* Order Status Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="px-6 py-4 border-b border-sangeet-neutral-200">
            <h2 className="text-lg font-semibold text-sangeet-neutral-900 mb-4">
              Order Status Tabs
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilters({ ...filters, status: '' })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                  filters.status === ''
                    ? 'bg-sangeet-400 text-sangeet-neutral-950 shadow-lg'
                    : 'bg-sangeet-neutral-100 text-sangeet-neutral-700 hover:bg-sangeet-neutral-200 border border-sangeet-neutral-300'
                }`}
              >
                📋 All ({orders.length})
              </button>
              <button
                onClick={() => setFilters({ ...filters, status: 'pending' })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                  filters.status === 'pending'
                    ? 'bg-yellow-500 text-white shadow-lg'
                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-300'
                }`}
              >
                ⏳ Pending ({orders.filter(o => o.status === 'pending').length})
              </button>
              <button
                onClick={() => setFilters({ ...filters, status: 'preparing' })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                  filters.status === 'preparing'
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-300'
                }`}
              >
                👨‍🍳 Preparing ({orders.filter(o => o.status === 'preparing').length})
              </button>
              <button
                onClick={() => setFilters({ ...filters, status: 'ready' })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                  filters.status === 'ready'
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                }`}
              >
                🎉 Ready ({orders.filter(o => o.status === 'ready').length})
              </button>
              <button
                onClick={() => setFilters({ ...filters, status: 'completed' })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                  filters.status === 'completed'
                    ? 'bg-gray-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                ✅ Completed ({orders.filter(o => o.status === 'completed').length})
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-sangeet-neutral-200">
            <h2 className="text-lg font-semibold text-sangeet-neutral-900">
              {userRole === 'admin' ? 'Orders' : 'Kitchen Orders'} ({filteredOrders.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-sangeet-neutral-200">
              <thead className="bg-sangeet-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-sangeet-neutral-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-sangeet-neutral-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-sangeet-neutral-500 uppercase tracking-wider">
                    Table
                  </th>
                  {userRole === 'admin' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-sangeet-neutral-500 uppercase tracking-wider">
                      Amount
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-sangeet-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-sangeet-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-sangeet-neutral-200">
                {filteredOrders.map((order) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="hover:bg-sangeet-neutral-50 transition-all duration-200 border-l-4 border-transparent hover:border-l-sangeet-400"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-sangeet-neutral-900">
                          Order #{order.order_number}
                        </div>
                        <div className="text-sm text-sangeet-neutral-500">
                          {formatDate(order.created_at)}
                        </div>
                        {viewMode === 'detailed' && order.items && userRole === 'admin' && (
                          <div className="mt-2 text-xs text-sangeet-neutral-600">
                            {order.items.map(item => (
                              <div key={item.id}>
                                {item.quantity}x {item.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-sangeet-neutral-900">
                        {order.customer_name}
                      </div>
                      {order.special_instructions && (
                        <div className="text-sm text-sangeet-neutral-500">
                          "{order.special_instructions}"
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-sangeet-neutral-900">
                      Table {getTableNumber(order.table_id)}
                    </td>
                    {userRole === 'admin' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-sangeet-neutral-900">
                        ${order.total_amount}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm transition-all duration-200 ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                        order.status === 'preparing' ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                        order.status === 'ready' ? 'bg-green-100 text-green-800 border border-green-300' :
                        order.status === 'completed' ? 'bg-gray-100 text-gray-800 border border-gray-300' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800 border border-red-300' :
                        'bg-gray-100 text-gray-800 border border-gray-300'
                      }`}>
                        {order.status === 'pending' && '⏳ '}
                        {order.status === 'confirmed' && '✅ '}
                        {order.status === 'preparing' && '👨‍🍳 '}
                        {order.status === 'ready' && '🎉 '}
                        {order.status === 'completed' && '✅ '}
                        {order.status === 'cancelled' && '❌ '}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-wrap gap-2">
                        {/* Status Update Buttons */}
                        <div className="flex flex-wrap gap-1">
                          {/* Pending Button */}
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'pending')}
                            disabled={updatingOrder === order.id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                              order.status === 'pending'
                                ? 'bg-yellow-500 text-white shadow-lg'
                                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-300'
                            }`}
                          >
                            {updatingOrder === order.id ? '⏳' : '⏳'} {updatingOrder === order.id ? 'Updating...' : 'Pending'}
                          </button>
                          
                          {/* Confirmed Button */}
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                            disabled={updatingOrder === order.id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                              order.status === 'confirmed'
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300'
                            }`}
                          >
                            ✅ {updatingOrder === order.id ? 'Updating...' : 'Confirmed'}
                          </button>
                          
                          {/* Preparing Button */}
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'preparing')}
                            disabled={updatingOrder === order.id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                              order.status === 'preparing'
                                ? 'bg-orange-500 text-white shadow-lg'
                                : 'bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-300'
                            }`}
                          >
                            👨‍🍳 {updatingOrder === order.id ? 'Updating...' : 'Preparing'}
                          </button>
                          
                          {/* Ready Button */}
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'ready')}
                            disabled={updatingOrder === order.id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                              order.status === 'ready'
                                ? 'bg-green-500 text-white shadow-lg'
                                : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                            }`}
                          >
                            🎉 {updatingOrder === order.id ? 'Updating...' : 'Ready'}
                          </button>
                          
                          {/* Admin Only Buttons */}
                          {userRole === 'admin' && (
                            <>
                              {/* Completed Button */}
                              <button
                                onClick={() => handleStatusUpdate(order.id, 'completed')}
                                disabled={updatingOrder === order.id}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                                  order.status === 'completed'
                                    ? 'bg-gray-500 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                                }`}
                              >
                                ✅ {updatingOrder === order.id ? 'Updating...' : 'Completed'}
                              </button>
                              
                              {/* Cancelled Button */}
                              <button
                                onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                                disabled={updatingOrder === order.id}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                                  order.status === 'cancelled'
                                    ? 'bg-red-500 text-white shadow-lg'
                                    : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
                                }`}
                              >
                                ❌ {updatingOrder === order.id ? 'Updating...' : 'Cancelled'}
                              </button>
                            </>
                          )}
                        </div>
                        
                        {/* Delete Button - Admin Only */}
                        {userRole === 'admin' && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDeleteModal(true);
                            }}
                            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 border border-red-300 transition-all duration-200 transform hover:scale-105"
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            
            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sangeet-neutral-500">
                  {userRole === 'admin' ? 'No orders found' : 'No active orders'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>

      {/* Delete Confirmation Modal - Admin Only */}
      {userRole === 'admin' && showDeleteModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-sangeet-neutral-900 mb-4">
              Delete Order
            </h3>
            <p className="text-sangeet-neutral-600 mb-6">
              Are you sure you want to delete Order #{selectedOrder.order_number} for {selectedOrder.customer_name}?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 text-sangeet-neutral-600 border border-sangeet-neutral-300 rounded-md hover:bg-sangeet-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(selectedOrder.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagementPage;
