import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getOrderById } from '../services/api';
import socketService from '../services/socketService';
import toast from 'react-hot-toast';

const UnifiedOrderPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const orderId = searchParams.get('orderId');
  const tableNumber = searchParams.get('table');
  const customerName = searchParams.get('customerName');
  const orderNumber = searchParams.get('orderNumber');
  const totalAmount = searchParams.get('totalAmount');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(true);


  // Order status configuration
  const orderStatuses = {
    'pending': {
      label: 'Order Received',
      description: 'Your order has been received and is being processed',
      icon: '📋',
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      borderColor: 'border-blue-400/30'
    },
    'preparing': {
      label: 'Preparing',
      description: 'Our kitchen is preparing your delicious meal',
      icon: '👨‍🍳',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      borderColor: 'border-yellow-400/30'
    },
    'ready': {
      label: 'Ready for Pickup',
      description: 'Your order is ready! Please collect from the counter',
      icon: '✅',
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      borderColor: 'border-green-400/30'
    },
    'completed': {
      label: 'Completed',
      description: 'Thank you for dining with us!',
      icon: '🎉',
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
      borderColor: 'border-purple-400/30'
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
      
      // Connect to WebSocket for real-time updates
      socketService.connect();
      socketService.joinCustomer(orderId);
      
      // Listen for real-time order status updates
      socketService.onOrderStatusUpdate((updateData) => {
        console.log('🔔 Real-time order update received:', updateData);
        
        // Update order status immediately
        setOrder(prevOrder => {
          if (prevOrder && prevOrder.id === updateData.orderId) {
            return {
              ...prevOrder,
              status: updateData.status,
              updated_at: updateData.timestamp
            };
          }
          return prevOrder;
        });
        
        // Show notification for status changes
        const statusConfig = orderStatuses[updateData.status];
        if (statusConfig) {
          toast.success(`Order ${statusConfig.label.toLowerCase()}!`, {
            duration: 4000,
            icon: statusConfig.icon
          });
          
          // Play notification sound
          socketService.playNotificationSound('notification');
        }
      });
      
      // Listen for order completion
      socketService.onOrderCompleted((data) => {
        if (data.orderId === orderId) {
          console.log('🎉 Order completed via WebSocket');
          toast.success('🎉 Your order is completed! Thank you for dining with us!', {
            duration: 6000
          });
          socketService.playNotificationSound('completion');
        }
      });

      // Listen for order deletion
      socketService.onOrderDeleted((data) => {
        console.log('🗑️ Order deleted event received:', data);
        
        // Check if this deletion affects our order
        if (data.orderId && orderId && 
            data.orderId.toString() === orderId.toString()) {
          
          console.log('🗑️ Order was deleted:', orderId);
          
          // Clear order state
          setOrder(null);
          setError('This order has been cancelled by the restaurant.');
          
          toast.error('This order has been cancelled by the restaurant.');
        }
      });
      
      // Cleanup function
      return () => {
        socketService.removeListener('order-status-update');
        socketService.removeListener('order-completed');
        socketService.removeListener('order-deleted');
      };
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const orderData = await getOrderById(orderId);
      setOrder(orderData);
    } catch (err) {
      setError('Unable to load order details');
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status) => {
    const statusOrder = ['pending', 'preparing', 'ready', 'completed'];
    return statusOrder.indexOf(status) + 1;
  };

  const getTotalAmount = () => {
    if (!order?.items) return parseFloat(totalAmount || 0);
    return order.items.reduce((total, item) => total + parseFloat(item.total_price), 0);
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleBackToMenu = () => {
    if (tableNumber) {
      window.location.href = `/qr/table-${tableNumber}`;
    } else {
      window.location.href = '/menu';
    }
  };



  // Transition from success to tracking after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  const currentStatus = order ? (orderStatuses[order.status] || orderStatuses.pending) : null;
  const statusStep = order ? getStatusStep(order.status) : 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sangeet-neutral-950 via-sangeet-neutral-900 to-sangeet-neutral-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-sangeet-neutral-900/80 to-sangeet-neutral-800/80 backdrop-blur-xl border-b border-sangeet-neutral-700/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-sangeet-400 rounded-lg flex items-center justify-center">
                <span className="text-xl">🍽️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-sangeet-400">Sangeet Restaurant</h1>
                <p className="text-sm text-sangeet-neutral-400">
                  Order Management
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-sangeet-neutral-400">
                Order #{orderNumber || orderId}
              </p>
              <p className="text-xs text-sangeet-neutral-500">
                {formatDate(new Date())}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sangeet-400 mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-sangeet-400 mb-2">Loading order details...</h2>
            <p className="text-sangeet-neutral-300">Please wait while we fetch your order information</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-6">⚠️</div>
            <h2 className="text-2xl font-bold text-sangeet-400 mb-4">Unable to Load Order</h2>
            <p className="text-sangeet-neutral-300 mb-6">{error}</p>
            <button
              onClick={handleBackToMenu}
              className="bg-sangeet-400 text-sangeet-neutral-950 px-6 py-3 rounded-lg font-semibold hover:bg-sangeet-300 transition-colors"
            >
              Back to Menu
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Order Success/Tracking Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-sangeet-neutral-900/80 to-sangeet-neutral-800/80 rounded-3xl p-8 shadow-2xl border border-sangeet-neutral-700/50 backdrop-blur-xl"
            >
              {showSuccess ? (
                // Success State (First 5 seconds)
                <>
                  {/* Success Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6"
                  >
                    <span className="text-4xl">✅</span>
                  </motion.div>

                  {/* Success Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center mb-8"
                  >
                    <h1 className="text-3xl md:text-4xl font-bold text-sangeet-400 mb-4">
                      Order Placed Successfully!
                    </h1>
                    <p className="text-sangeet-neutral-300 text-lg">
                      Thank you for your order. We're preparing your delicious meal!
                    </p>
                  </motion.div>

                  {/* Order Details */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-sangeet-neutral-800/50 rounded-2xl p-6 mb-8"
                  >
                    <h2 className="text-xl font-semibold text-sangeet-400 mb-4 flex items-center">
                      <span className="mr-2">📋</span>
                      Order Details
                    </h2>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-sangeet-neutral-700/50">
                        <span className="text-sangeet-neutral-400">Order Number:</span>
                        <span className="text-sangeet-neutral-200 font-semibold">
                          #{orderNumber || orderId}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-b border-sangeet-neutral-700/50">
                        <span className="text-sangeet-neutral-400">Customer:</span>
                        <span className="text-sangeet-neutral-200 font-semibold">
                          {customerName || 'Guest'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-b border-sangeet-neutral-700/50">
                        <span className="text-sangeet-neutral-400">Table:</span>
                        <span className="text-sangeet-neutral-200 font-semibold">
                          {tableNumber || 'N/A'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-b border-sangeet-neutral-700/50">
                        <span className="text-sangeet-neutral-400">Order Time:</span>
                        <span className="text-sangeet-neutral-200 font-semibold">
                          {formatTime(new Date())}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sangeet-neutral-400">Total Amount:</span>
                        <span className="text-sangeet-neutral-200 font-bold text-lg">
                          ${totalAmount || '0.00'}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Next Steps */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6"
                  >
                    <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center">
                      <span className="mr-2">⏱️</span>
                      What's Next?
                    </h3>
                    <div className="space-y-2 text-sangeet-neutral-300">
                      <p>• Your order is being prepared in our kitchen</p>
                      <p>• Estimated preparation time: 15-20 minutes</p>
                      <p>• We'll notify you when your order is ready</p>
                      <p>• Please collect your order from the counter when ready</p>
                    </div>
                  </motion.div>
                </>
              ) : (
                // Tracking State (After 5 seconds)
                <>
                  {/* Current Status */}
                  <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${currentStatus?.bgColor || 'bg-blue-400/10'} ${currentStatus?.borderColor || 'border-blue-400/30'} border-4 mb-6`}>
                      <span className="text-4xl">{currentStatus?.icon || '📋'}</span>
                    </div>
                    <h2 className={`text-3xl font-bold ${currentStatus?.color || 'text-blue-400'} mb-3`}>
                      {currentStatus?.label || 'Order Received'}
                    </h2>
                    <p className="text-sangeet-neutral-300 text-lg">
                      {currentStatus?.description || 'Your order has been received and is being processed'}
                    </p>
                  </div>

                  {/* Progress Steps */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-sangeet-neutral-200">Order Progress</h3>
                      <span className="text-sm text-sangeet-neutral-400 bg-sangeet-neutral-800 px-3 py-1 rounded-full">
                        Step {statusStep} of 4
                      </span>
                    </div>

                    <div className="relative">
                      {/* Progress Bar */}
                      <div className="absolute top-5 left-0 right-0 h-2 bg-sangeet-neutral-700 rounded-full">
                        <div
                          className="h-2 bg-gradient-to-r from-sangeet-400 to-sangeet-500 rounded-full transition-all duration-1000"
                          style={{ width: `${(statusStep / 4) * 100}%` }}
                        ></div>
                      </div>

                      {/* Status Steps */}
                      <div className="relative flex justify-between">
                        {Object.entries(orderStatuses).map(([status, config], index) => {
                          const isCompleted = getStatusStep(status) <= statusStep;
                          const isCurrent = status === (order?.status || 'pending');

                          return (
                            <div key={status} className="flex flex-col items-center">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                                isCompleted
                                  ? 'bg-sangeet-400 text-sangeet-neutral-950'
                                  : 'bg-sangeet-neutral-700 text-sangeet-neutral-400'
                              }`}>
                                {isCompleted ? '✓' : index + 1}
                              </div>
                              <div className="mt-3 text-center">
                                <p className={`text-sm font-medium ${isCurrent ? (currentStatus?.color || 'text-blue-400') : 'text-sangeet-neutral-400'}`}>
                                  {config.label}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Estimated Time */}
                  <div className="bg-sangeet-neutral-800/50 rounded-2xl p-6 text-center">
                    <p className="text-sangeet-neutral-300 mb-2 text-lg">Estimated Completion</p>
                    <p className="text-2xl font-semibold text-sangeet-400">
                      {order?.status === 'completed' ? 'Order Completed' : '15-20 minutes'}
                    </p>
                  </div>
                </>
              )}
            </motion.div>



            {/* Order Details Grid */}
            {order && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                {/* Order Information */}
                <div className="bg-gradient-to-r from-sangeet-neutral-900/80 to-sangeet-neutral-800/80 rounded-2xl p-6 shadow-2xl border border-sangeet-neutral-700/50 backdrop-blur-xl">
                  <h3 className="text-xl font-bold text-sangeet-400 mb-6 flex items-center">
                    <span className="mr-3 text-2xl">📋</span>
                    Order Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-sangeet-neutral-700/50">
                      <span className="text-sangeet-neutral-400">Order Number:</span>
                      <span className="text-sangeet-neutral-200 font-semibold text-lg">
                        #{order.order_number || order.id}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3 border-b border-sangeet-neutral-700/50">
                      <span className="text-sangeet-neutral-400">Customer:</span>
                      <span className="text-sangeet-neutral-200 font-semibold text-lg">
                        {order.customer_name}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3 border-b border-sangeet-neutral-700/50">
                      <span className="text-sangeet-neutral-400">Table:</span>
                      <span className="text-sangeet-neutral-200 font-semibold text-lg">
                        {order.table_number || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3 border-b border-sangeet-neutral-700/50">
                      <span className="text-sangeet-neutral-400">Order Time:</span>
                      <span className="text-sangeet-neutral-200 font-semibold text-lg">
                        {formatTime(order.created_at)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3">
                      <span className="text-sangeet-neutral-400">Date:</span>
                      <span className="text-sangeet-neutral-200 font-semibold text-lg">
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-gradient-to-r from-sangeet-neutral-900/80 to-sangeet-neutral-800/80 rounded-2xl p-6 shadow-2xl border border-sangeet-neutral-700/50 backdrop-blur-xl">
                  <h3 className="text-xl font-bold text-sangeet-400 mb-6 flex items-center">
                    <span className="mr-3 text-2xl">🍽️</span>
                    Order Items
                  </h3>
                  
                  <div className="space-y-4">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-3 border-b border-sangeet-neutral-700/50 last:border-b-0">
                        <div className="flex-1">
                          <p className="text-sangeet-neutral-200 font-semibold text-lg">{item.name}</p>
                          <p className="text-sangeet-neutral-400">
                            Qty: {item.quantity} × ${parseFloat(item.unit_price).toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sangeet-neutral-200 font-bold text-lg">
                            ${parseFloat(item.total_price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}

                    <div className="pt-4 border-t border-sangeet-neutral-600/50">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-semibold text-sangeet-neutral-200">Total</span>
                        <span className="text-2xl font-bold text-sangeet-400">
                          ${getTotalAmount().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Review Section - Show when order is ready or completed */}
            {order && (order.status === 'ready' || order.status === 'completed') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-2xl p-8 border border-yellow-500/30 backdrop-blur-xl"
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">⭐</div>
                  <h3 className="text-2xl font-semibold text-yellow-400 mb-3">
                    How was your dining experience?
                  </h3>
                  <p className="text-sangeet-neutral-300 mb-6 text-lg">
                    We'd love to hear about your meal! Your feedback helps us improve and serve you better.
                  </p>
                  <button
                    onClick={() => window.location.href = `/review?orderId=${orderId}&table=${order.table_number}&customerName=${encodeURIComponent(order.customer_name)}`}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-sangeet-neutral-950 py-4 px-8 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
                  >
                    Share Your Experience
                  </button>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button
                onClick={handleBackToMenu}
                className="bg-sangeet-neutral-700 hover:bg-sangeet-neutral-600 text-sangeet-neutral-200 px-8 py-4 rounded-xl font-semibold transition-colors text-lg"
              >
                Continue Ordering
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="bg-sangeet-400 hover:bg-sangeet-300 text-sangeet-neutral-950 px-8 py-4 rounded-xl font-semibold transition-colors text-lg"
              >
                Visit Our Website
              </button>
            </motion.div>

            {/* Auto-refresh notice */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
              className="text-center"
            >
              <p className="text-sangeet-neutral-400">
                🔄 This page automatically updates every 30 seconds
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedOrderPage;
