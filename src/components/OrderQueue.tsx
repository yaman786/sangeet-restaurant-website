"use client";
import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle, Package, Timer } from 'lucide-react';
import { pusherClient as socketService } from '@/lib/services/pusherClient';
import { fetchAllOrders, updateOrderStatus } from '../services/api';
import toast from 'react-hot-toast';
import CustomDropdown from './CustomDropdown';
import { isNewItem, sortItemsByNewness, hasMultipleSessions } from '../utils/itemUtils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const OrderQueue = ({ onStatsUpdate, soundEnabled = true, kitchenMode = false, activeFilter = 'all', sortBy = 'priority', searchQuery = '' }: any) => {
  const queryClient = useQueryClient();

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const getStatusPriority = (status: any) => {
    const priorities = {
      'pending': 1,
      'preparing': 2,
      'ready': 3,
      'completed': 4
    };
    return (priorities as any)[status] || 0;
  };

  const sortOrders = useCallback((ordersList: any) => {
    return ordersList.sort((a: any, b: any) => {
      // If filtering by specific status, only sort by time
      if (activeFilter !== 'all') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }

      // For "All Orders" view, use the selected sort option
      switch (sortBy) {
        case 'priority':
          // First sort by status priority, then by time
          const statusDiff = getStatusPriority(a.status) - getStatusPriority(b.status);
          if (statusDiff !== 0) return statusDiff;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        
        case 'time':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        
        case 'time-oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        
        case 'table':
          // Sort by table number (numeric)
          const tableA = parseInt(a.table_number) || 0;
          const tableB = parseInt(b.table_number) || 0;
          if (tableA !== tableB) return tableA - tableB;
          // If same table, sort by time (newest first)
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        
        case 'customer':
          // Sort by customer name alphabetically
          const nameA = (a.customer_name || '').toLowerCase();
          const nameB = (b.customer_name || '').toLowerCase();
          if (nameA !== nameB) return nameA.localeCompare(nameB);
          // If same name, sort by time (newest first)
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        
        case 'amount':
          // Sort by total amount (high to low)
          const amountA = parseFloat(a.total_amount) || 0;
          const amountB = parseFloat(b.total_amount) || 0;
          if (amountA !== amountB) return amountB - amountA;
          // If same amount, sort by time (newest first)
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        
        case 'amount-low':
          // Sort by total amount (low to high)
          const amountLowA = parseFloat(a.total_amount) || 0;
          const amountLowB = parseFloat(b.total_amount) || 0;
          if (amountLowA !== amountLowB) return amountLowA - amountLowB;
          // If same amount, sort by time (newest first)
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        
        default:
          // Default to priority sorting
          const defaultStatusDiff = getStatusPriority(a.status) - getStatusPriority(b.status);
          if (defaultStatusDiff !== 0) return defaultStatusDiff;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [activeFilter, sortBy]);

  const { data: allOrders = [], isLoading: loading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => fetchAllOrders(),
    refetchInterval: 60000, // Background polling fallback
  });

  const orders = sortOrders(allOrders.filter((order: any) => 
    order.status !== 'completed' && order.status !== 'cancelled' && !(kitchenMode && order.status === 'pending')
  ));
  
  const completedOrders = sortOrders(allOrders.filter((order: any) => 
    order.status === 'completed' || order.status === 'cancelled'
  ));

  const statusMutation = useMutation({
    mutationFn: ({ orderId, newStatus }: { orderId: any, newStatus: any }) => updateOrderStatus(orderId, newStatus),
    onSuccess: (data, variables) => {
      toast.success(`Order #${variables.orderId} status updated to ${variables.newStatus}`);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: () => {
      toast.error('Failed to update order status');
    }
  });

  const setupSocketListeners = useCallback(() => {
    try {
      if (!socketService.isConnected) {
        socketService.connect();
      }
      socketService.joinKitchen();

      socketService.onNewOrder((orderData: any) => {
        if (soundEnabled) socketService.playNotificationSound('notification');
        toast.success(`New order received!`, { duration: 4000, icon: '🔔' });
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      });

      socketService.onOrderStatusUpdate((data: any) => {
        if (data.status === 'ready' && soundEnabled) socketService.playNotificationSound('completion');
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      });

      socketService.onOrderDeleted((data: any) => {
        queryClient.setQueryData(['orders'], (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.filter((order: any) => order.id !== data.orderId);
        });
        toast.success(`Order #${data.orderId} deleted`, { duration: 3000, icon: '🗑️' });
      });

      socketService.onNewItemsAdded((data: any) => {
        toast.success(`New items added to Order #${data.orderId}!`, { duration: 4000, icon: '➕' });
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      });

    } catch (error) {
      console.error('Error setting up socket listeners:', error);
    }
  }, [soundEnabled, queryClient]);

  useEffect(() => {
    setupSocketListeners();
    socketService.onConnectionStateChange((status: string) => {
      if (status === 'connected') {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      }
    });

    return () => {
      socketService.removeListener('new-order');
      socketService.removeListener('order-status-update');
      socketService.removeListener('order-deleted');
    };
  }, [setupSocketListeners, queryClient]);

  // Validate status transitions to prevent backward movement
  const isValidStatusTransition = (currentStatus: any, newStatus: any) => {
    const statusFlow = {
      'pending': ['preparing', 'cancelled'],
      'preparing': ['ready', 'cancelled'],
      'ready': ['completed', 'cancelled'],
      'completed': [], // No further transitions allowed
      'cancelled': [] // No further transitions allowed
    };
    
    return (statusFlow as any)[currentStatus]?.includes(newStatus) || false;
  };

  const handleStatusUpdate = async (orderId: any, newStatus: any) => {
    const currentOrder = allOrders.find((order: any) => order.id === orderId);
    if (!currentOrder) {
      toast.error('Order not found');
      return;
    }
    if (!isValidStatusTransition(currentOrder.status, newStatus)) {
      toast.error(`Cannot change status from "${currentOrder.status}" to "${newStatus}". Invalid transition.`);
      return;
    }
    
    // React Query Mutation triggers immediate optimistic updates & backend synchronization
    statusMutation.mutate({ orderId, newStatus });
  };

  const getStatusColor = (status: any) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';

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

  const getStatusIcon = (status: any) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5" />;

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

  let baseOrders = activeFilter === 'all' 
    ? [...orders] 
    : activeFilter === 'completed' 
      ? [...completedOrders]
      : orders.filter((order: any) => order.status === activeFilter);
      
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    baseOrders = baseOrders.filter((o: any) => 
      (o.customer_name && o.customer_name.toLowerCase().includes(query)) ||
      (o.order_number && o.order_number.toLowerCase().includes(query)) ||
      (o.table_number && String(o.table_number).includes(query))
    );
  }

  const filteredOrders = sortOrders(baseOrders);



  const calculateStats = useCallback(() => {
    const stats = {
      total: orders.length,
      pending: orders.filter((order: any) => order.status === 'pending').length,
      preparing: orders.filter((order: any) => order.status === 'preparing').length,
      ready: orders.filter((order: any) => order.status === 'ready').length,
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
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        layout
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          {filteredOrders.map((order: any) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              layout
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                layout: { duration: 0.3 }
              }}
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
                  {order.items && sortItemsByNewness(order.items).map((item: any) => (
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
                        onChange={(newStatus: any) => handleStatusUpdate((order as any).id, newStatus)}
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
      </motion.div>

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