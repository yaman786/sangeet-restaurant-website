"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle, Timer } from 'lucide-react';
import { pusherClient as socketService } from '@/lib/services/pusherClient';
import { fetchAllOrders, updateOrderStatus, cancelOrderItemApi } from '../services/api';
import toast from 'react-hot-toast';
import CustomDropdown from './CustomDropdown';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const OrderQueue = ({ onStatsUpdate, soundEnabled = true, kitchenMode = false, activeFilter = 'all', sortBy = 'priority', searchQuery = '' }: any) => {
  const queryClient = useQueryClient();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const getElapsedMinutes = (createdAt: any) => {
    if (!createdAt) return 0;
    const createdTime = new Date(createdAt).getTime();
    if (isNaN(createdTime)) return 0;
    return Math.floor((now - createdTime) / 60000);
  };
  
  const getTicketColorClasses = (status: string, elapsedMin: number) => {
    if (status === 'ready') return 'border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20';
    if (status === 'completed') return 'border-sangeet-neutral-700 opacity-60';
    if (status === 'cancelled') return 'border-red-900 opacity-60';
    
    if (elapsedMin >= 20) return 'border-red-500 bg-red-500/10 shadow-md shadow-red-500/10';
    if (elapsedMin >= 10) return 'border-yellow-500 bg-yellow-500/10 shadow-md shadow-yellow-500/10';
    return 'border-green-500 bg-green-500/5 shadow-sm shadow-green-500/5';
  };

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

  const updateStatusMutation = useMutation({
    mutationFn: (data: { id: string; status: string }) => updateOrderStatus(data.id, data.status),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['orders'] });
      const previousOrders = queryClient.getQueryData(['orders']);
      queryClient.setQueryData(['orders'], (old: any) => {
        return old.map((order: any) => 
          order.id.toString() === variables.id 
            ? { ...order, status: variables.status }
            : order
        );
      });
      return { previousOrders };
    },
    onError: (err, variables, context: any) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(['orders'], context.previousOrders);
      }
      toast.error('Failed to update order status');
    }
  });

  const cancelItemMutation = useMutation({
    mutationFn: (data: { orderId: string; itemId: string }) => cancelOrderItemApi(data.orderId, data.itemId),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['orders'] });
      const previousOrders = queryClient.getQueryData(['orders']);
      queryClient.setQueryData(['orders'], (old: any) => {
        return old.map((order: any) => {
          if (order.id.toString() === variables.orderId) {
            return {
              ...order,
              items: order.items.map((item: any) => 
                item.id.toString() === variables.itemId
                  ? { ...item, status: 'cancelled' }
                  : item
              )
            };
          }
          return order;
        });
      });
      return { previousOrders };
    },
    onError: (err, variables, context: any) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(['orders'], context.previousOrders);
      }
      toast.error('Failed to cancel item');
    },
    onSuccess: () => {
      toast.success('Item cancelled successfully');
    }
  });

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    const currentOrder = allOrders.find((order: any) => order.id === orderId);
    if (!currentOrder) {
      toast.error('Order not found');
      return;
    }
    
    // Validate status transitions
    const statusFlow = {
      'pending': ['preparing', 'cancelled'],
      'preparing': ['ready', 'cancelled'],
      'ready': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': []
    };
    
    if (!(statusFlow as any)[currentOrder.status]?.includes(newStatus)) {
      toast.error(`Cannot change status from "${currentOrder.status}" to "${newStatus}". Invalid transition.`);
      return;
    }
    
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  const handleItemCancel = (orderId: string, itemId: string, itemName: string) => {
    if (window.confirm(`Are you sure you want to cancel the item: ${itemName}?`)) {
      cancelItemMutation.mutate({ orderId, itemId });
    }
  };

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
        // Update in-place instead of invalidating to avoid clobbering optimistic updates
        queryClient.setQueryData(['orders'], (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.map((order: any) =>
            order.id === data.orderId
              ? { ...order, status: data.status, updated_at: new Date().toISOString() }
              : order
          );
        });
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
              className={`bg-sangeet-neutral-800 rounded-lg p-4 border ${getTicketColorClasses(order.status, getElapsedMinutes(order.created_at))} flex flex-col h-full min-h-[320px]`}
            >
              {/* Order Header - Compact */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-base font-bold text-sangeet-neutral-100">
                    {order.status === 'ready' && <span className="text-green-400 mr-1">🍽️</span>}
                    #{order.order_number}
                  </h3>
                  <p className="text-xs text-sangeet-neutral-400 flex items-center gap-1 mt-1">
                    <span>Table {order.table_number}</span>
                    <span className="text-sangeet-neutral-600">•</span>
                    <Clock size={12} className={getElapsedMinutes(order.created_at) >= 20 ? 'text-red-400 animate-pulse' : 'text-sangeet-neutral-500'} />
                    <span className={`font-medium ${getElapsedMinutes(order.created_at) >= 20 ? 'text-red-400' : getElapsedMinutes(order.created_at) >= 10 ? 'text-yellow-400' : 'text-sangeet-neutral-400'}`}>
                      {getElapsedMinutes(order.created_at)} min ago
                    </span>
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
                
                <div className="space-y-1">
                  {order.items && order.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-xs py-1 group">
                      <div className="flex items-center space-x-2 flex-grow">
                        <span className={`transition-all ${item.status === 'cancelled' ? 'text-red-500/70 line-through' : 'text-sangeet-neutral-300'}`}>
                          {item.quantity}x {item.menu_item_name || item.name}
                        </span>
                        {item.status === 'cancelled' && (
                          <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded uppercase font-bold">Cancelled</span>
                        )}
                        {item.special_instructions && item.status !== 'cancelled' && (
                          <span className="text-orange-400 text-[11px] bg-orange-400/10 px-1 rounded truncate max-w-[120px]">
                            {item.special_instructions}
                          </span>
                        )}
                      </div>
                      
                      {/* Cancel Item Button for Kitchen */}
                      {kitchenMode && item.status !== 'cancelled' && order.status !== 'completed' && order.status !== 'cancelled' && (
                        <button 
                          onClick={() => handleItemCancel(order.id, item.id, item.menu_item_name || item.name)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-1 text-sangeet-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded"
                          title="Cancel this item"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
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