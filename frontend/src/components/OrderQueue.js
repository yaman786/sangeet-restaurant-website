import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle, Package, Timer } from 'lucide-react';
import socketService from '../services/socketService';
import { fetchAllOrders, updateOrderStatus } from '../services/api';
import toast from 'react-hot-toast';
import CustomDropdown from './CustomDropdown';
import { isNewItem, sortItemsByNewness, hasMultipleSessions } from '../utils/itemUtils';

const OrderQueue = ({ onStatsUpdate, soundEnabled = true, kitchenMode = false, activeFilter = 'all', sortBy = 'priority' }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedOrders, setCompletedOrders] = useState([]);

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const getStatusPriority = (status) => {
    const priorities = {
      'pending': 1,
      'preparing': 2,
      'ready': 3,
      'completed': 4
    };
    return priorities[status] || 0;
  };

  const sortOrders = useCallback((ordersList) => {
    return ordersList.sort((a, b) => {
      // If filtering by specific status, only sort by time
      if (activeFilter !== 'all') {
        return new Date(b.created_at) - new Date(a.created_at);
      }

      // For "All Orders" view, use the selected sort option
      switch (sortBy) {
        case 'priority':
          // First sort by status priority, then by time
          const statusDiff = getStatusPriority(a.status) - getStatusPriority(b.status);
          if (statusDiff !== 0) return statusDiff;
          return new Date(b.created_at) - new Date(a.created_at);
        
        case 'time':
          return new Date(b.created_at) - new Date(a.created_at);
        
        case 'time-oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        
        case 'table':
          // Sort by table number (numeric)
          const tableA = parseInt(a.table_number) || 0;
          const tableB = parseInt(b.table_number) || 0;
          if (tableA !== tableB) return tableA - tableB;
          // If same table, sort by time (newest first)
          return new Date(b.created_at) - new Date(a.created_at);
        
        case 'customer':
          // Sort by customer name alphabetically
          const nameA = (a.customer_name || '').toLowerCase();
          const nameB = (b.customer_name || '').toLowerCase();
          if (nameA !== nameB) return nameA.localeCompare(nameB);
          // If same name, sort by time (newest first)
          return new Date(b.created_at) - new Date(a.created_at);
        
        case 'amount':
          // Sort by total amount (high to low)
          const amountA = parseFloat(a.total_amount) || 0;
          const amountB = parseFloat(b.total_amount) || 0;
          if (amountA !== amountB) return amountB - amountA;
          // If same amount, sort by time (newest first)
          return new Date(b.created_at) - new Date(a.created_at);
        
        case 'amount-low':
          // Sort by total amount (low to high)
          const amountLowA = parseFloat(a.total_amount) || 0;
          const amountLowB = parseFloat(b.total_amount) || 0;
          if (amountLowA !== amountLowB) return amountLowA - amountLowB;
          // If same amount, sort by time (newest first)
          return new Date(b.created_at) - new Date(a.created_at);
        
        default:
          // Default to priority sorting
          const defaultStatusDiff = getStatusPriority(a.status) - getStatusPriority(b.status);
          if (defaultStatusDiff !== 0) return defaultStatusDiff;
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });
  }, [activeFilter, sortBy]);

  const loadOrders = useCallback(async () => {
    try {
      const response = await fetchAllOrders();
      
      // Separate completed orders from active orders
      const activeOrders = response.filter(order => order.status !== 'completed');
      const completedOrders = response.filter(order => order.status === 'completed');
      
      setOrders(sortOrders(activeOrders));
      setCompletedOrders(sortOrders(completedOrders));
    } catch (error) {
      console.error('Error loading orders:', error);
      
      // Show error message instead of demo data
      toast.error('Failed to load orders. Please check your connection and try again.');
      
      // Set empty arrays instead of demo data
      setOrders([]);
      setCompletedOrders([]);
    } finally {
      setLoading(false);
    }
  }, [sortOrders]);

  const setupSocketListeners = useCallback(() => {
    try {
      // Ensure socket is connected before setting up listeners
      if (!socketService.isConnected) {
        socketService.connect();
      }
      
      // Join kitchen room to receive notifications
      socketService.joinKitchen();

      // Listen for new orders → minimal: reload
      socketService.onNewOrder(() => {
        if (soundEnabled) socketService.playNotificationSound('notification');
        loadOrders();
      });

      // Listen for status updates → minimal: reload
      socketService.onOrderStatusUpdate((data) => {
        if (data.status === 'ready' && soundEnabled) socketService.playNotificationSound('completion');
        loadOrders();
      });

      // Listen for order deletions → minimal: reload
      socketService.onOrderDeleted((data) => {
        loadOrders();
      });

      // Listen for new items added to existing orders
      socketService.onNewItemsAdded((data) => {
        // Show notification for kitchen
        toast.success(`New items added to Order #${data.orderId}!`, {
          duration: 4000,
          icon: '➕'
        });
        loadOrders();
      });

    } catch (error) {
      console.error('Error setting up socket listeners:', error);
    }
  }, [soundEnabled, sortOrders]);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    setupSocketListeners();

    return () => {
      socketService.removeListener('new-order');
      socketService.removeListener('order-status-update');
      socketService.removeListener('order-deleted');
    };
  }, [setupSocketListeners]);

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
      
      if (newStatus === 'completed') {
        // Move to completed orders and remove from active queue after delay
        const completedOrder = orders.find(order => order.id === orderId);
        if (completedOrder) {
          // Update the order status first
          const updatedOrder = { ...completedOrder, status: newStatus };
          setCompletedOrders(prev => sortOrders([updatedOrder, ...prev]));
          
          // Remove from active orders after 5 seconds
          setTimeout(() => {
            setOrders(prev => prev.filter(order => order.id !== orderId));
          }, 5000);
          
          toast.success(`Order #${orderId} completed! Will be removed in 5 seconds.`);
        }
      } else {
        // Update status normally
        setOrders(prev => {
          const updatedOrders = prev.map(order => 
            order.id === orderId 
              ? { ...order, status: newStatus }
              : order
          );
          return sortOrders(updatedOrders);
        });
        toast.success(`Order #${orderId} status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'confirmed':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'preparing':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'ready':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'completed':
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5" />;
      case 'confirmed':
        return <Package className="h-5 w-5" />;
      case 'preparing':
        return <Timer className="h-5 w-5" />;
      case 'ready':
        return <CheckCircle className="h-5 w-5" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const filteredOrders = activeFilter === 'all' 
    ? sortOrders([...orders]) 
    : activeFilter === 'completed' 
      ? sortOrders([...completedOrders])
      : sortOrders(orders.filter(order => order.status === activeFilter));

  // eslint-disable-next-line no-unused-vars
  const clearCompletedOrders = () => {
    setCompletedOrders([]);
    toast.success('Completed orders cleared');
  };

  const calculateStats = useCallback(() => {
    const stats = {
      total: orders.length,
      pending: orders.filter(order => order.status === 'pending').length,
      preparing: orders.filter(order => order.status === 'preparing').length,
      ready: orders.filter(order => order.status === 'ready').length,
      completed: completedOrders.length
    };
    
    if (onStatsUpdate) {
      onStatsUpdate(stats);
    }
  }, [orders, completedOrders, onStatsUpdate]);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sangeet-400"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Orders Grid - Optimized for Kitchen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {filteredOrders.map((order) => (
            <motion.div
              key={`${order.id}-${order.status}-${order.updated_at || order.created_at}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`bg-sangeet-neutral-800 rounded-lg p-4 border ${
                order.status === 'ready' 
                  ? 'border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20' 
                  : 'border-sangeet-neutral-700'
              } ${order.status === 'completed' ? 'opacity-60' : ''} flex flex-col h-full min-h-[320px]`}
            >
              {/* Order Header - Compact */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-base font-bold text-sangeet-neutral-100">
                    {order.status === 'ready' && <span className="text-green-400 mr-1">🍽️</span>}
                    #{order.order_number}
                  </h3>
                  <p className="text-xs text-sangeet-neutral-400">
                    Table {order.table_number} • {(() => {
                      try {
                        const date = new Date(order.created_at);
                        return isNaN(date.getTime()) ? 'Just now' : date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                      } catch (error) {
                        return 'Just now';
                      }
                    })()}
                    {order.updated_at && order.updated_at !== order.created_at && (
                      <span className="text-green-400 ml-1">
                        • Updated: {(() => {
                          try {
                            const date = new Date(order.updated_at);
                            return isNaN(date.getTime()) ? 'Just now' : date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                          } catch (error) {
                            return 'Just now';
                          }
                        })()}
                      </span>
                    )}
                  </p>
                </div>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full border text-xs ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="font-medium">{order.status}</span>
                  {/* Live update indicator */}
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Customer Info - Compact */}
              <div className="mb-3">
                <p className="text-sm text-sangeet-neutral-100 font-medium">{order.customer_name}</p>
                {order.special_instructions && (
                  <div className="mt-1 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs">
                    <p className="text-yellow-400">
                      <strong>Note:</strong> {order.special_instructions}
                    </p>
                  </div>
                )}
              </div>

              {/* Order Items - Compact */}
              <div className="mb-3 flex-grow">
                <h4 className="text-xs font-medium text-sangeet-neutral-400 mb-1">Items:</h4>
                
                {/* Merge Alert */}
                {hasMultipleSessions(order.items) && (
                  <div className="mb-2 p-1 bg-orange-900/20 border border-orange-500/30 rounded text-xs">
                    <span className="text-orange-400">⚠️ Merged Order</span>
                  </div>
                )}
                
                <div className="space-y-1">
                  {order.items && sortItemsByNewness(order.items).map((item) => (
                    <div key={item.id} className="flex justify-between text-xs py-0.5">
                      <div className="flex items-center space-x-1">
                        <span className="text-sangeet-neutral-300">
                          {item.quantity}x {item.menu_item_name || item.name}
                        </span>
                        {isNewItem(item.created_at) && (
                          <span className="bg-green-500 text-white px-1 py-0.5 rounded text-xs font-medium animate-pulse">
                            NEW
                          </span>
                        )}
                      </div>
                      {item.special_instructions && (
                        <span className="text-orange-400">
                          ({item.special_instructions})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Update Buttons - Smart Flow Logic */}
              {order.status !== 'completed' && order.status !== 'cancelled' && (
                <div className="flex flex-wrap gap-1 mt-auto pt-3">
                  {kitchenMode ? (
                    // Kitchen Mode: Smart touch-friendly buttons with logical flow
                    <>
                      {/* Forward Progress Buttons */}
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'preparing')}
                          className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md font-medium hover:bg-orange-700 transition-colors text-sm"
                        >
                          🍳 Start Cooking
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'ready')}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors text-sm shadow-lg"
                        >
                          🍽️ Ready to Serve
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'completed')}
                          className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md font-medium hover:bg-gray-700 transition-colors text-sm"
                        >
                          ✅ Mark Served
                        </button>
                      )}
                      
                      {/* Cancel Button - Available at any stage */}
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                        className="px-3 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors text-sm"
                      >
                        ❌ Cancel
                      </button>
                    </>
                  ) : (
                    // Admin Mode: Smart dropdown with logical restrictions
                    <div className="w-full space-y-2">
                      <CustomDropdown
                        value={order.status}
                        onChange={(newStatus) => handleStatusUpdate(order.id, newStatus)}
                        options={statusOptions}
                        className="w-full"
                      />
                      
                      {/* Cancel Button for Admin */}
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                        className="w-full px-2 py-1 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors text-sm"
                      >
                        ❌ Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Completed/Cancelled Order Actions */}
              {(order.status === 'completed' || order.status === 'cancelled') && (
                <div className="flex flex-wrap gap-1 mt-auto pt-3">
                  <div className="w-full text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'completed' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {order.status === 'completed' ? '✅ Order Completed' : '❌ Order Cancelled'}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sangeet-neutral-500 text-lg">
            {activeFilter === 'completed' ? 'No completed orders' : 'No orders found'}
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderQueue; 