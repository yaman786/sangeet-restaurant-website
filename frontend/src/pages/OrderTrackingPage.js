import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getOrderById } from '../services/api';
import socketService from '../services/socketService';
import toast from 'react-hot-toast';

const OrderTrackingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get('orderId');
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    },
    'cancelled': {
      label: 'Order Cancelled',
      description: 'Your order has been cancelled by the restaurant',
      icon: '❌',
      color: 'text-red-400',
      bgColor: 'bg-red-400/10',
      borderColor: 'border-red-400/30'
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('No order ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const orderData = await getOrderById(orderId);
        setOrder(orderData);
      } catch (err) {
        setError('Order not found or unable to load order details');
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Socket connection for real-time order updates
  useEffect(() => {
    // Connect to socket service
    socketService.connect();
    
    // Join customer room for order tracking
    if (orderId) {
      socketService.joinCustomer(orderId);
    }

    // Listen for order status updates
    const handleStatusUpdate = (data) => {
      // Check if this update affects our order
      if (data.orderId && orderId && 
          data.orderId.toString() === orderId.toString()) {
        
        // Update the order status in real-time
        setOrder(prevOrder => {
          if (prevOrder) {
            return {
              ...prevOrder,
              status: data.status,
              updated_at: data.timestamp || new Date().toISOString()
            };
          }
          return prevOrder;
        });
        
        // Show toast notification for status changes
        const statusMessages = {
          'preparing': 'Your order is now being prepared! 👨‍🍳',
          'ready': 'Your order is ready for pickup! ✅',
          'completed': 'Thank you for dining with us! 🎉',
          'cancelled': 'Your order has been cancelled. Redirecting to menu for fresh start...'
        };
        
        if (statusMessages[data.status]) {
          if (data.status === 'cancelled') {
            toast.error(statusMessages[data.status], {
              duration: 5000,
              icon: '❌'
            });
            
            // The 5-minute timeout will handle the fresh start automatically
            // Customer can see cancelled status and choose to wait or reset manually
          } else {
            toast.success(statusMessages[data.status]);
          }
        }
      }
    };

    // Listen for order deletion events
    const handleOrderDeleted = (data) => {
      // Check if this deletion affects our order
      if (data.orderId && orderId && 
          data.orderId.toString() === orderId.toString()) {
        
        // Clear order state
        setOrder(null);
        setError('This order has been cancelled by the restaurant.');
        
        toast.error('This order has been cancelled by the restaurant.');
      }
    };

    socketService.onOrderStatusUpdate(handleStatusUpdate);
    socketService.onOrderDeleted(handleOrderDeleted);

    // Cleanup function
    return () => {
      socketService.removeListener('order-status-update');
      socketService.removeListener('order-deleted');
    };
  }, [orderId]);

  const getStatusStep = (status) => {
    const statusOrder = ['pending', 'preparing', 'ready', 'completed'];
    if (status === 'cancelled') {
      return 0; // Special case for cancelled orders
    }
    return statusOrder.indexOf(status) + 1;
  };

  const getTotalAmount = () => {
    if (!order?.items) return 0;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-sangeet-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sangeet-400 mx-auto mb-4"></div>
          <p className="text-sangeet-neutral-300">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-sangeet-neutral-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-sangeet-400 mb-4">Order Not Found</h1>
          <p className="text-sangeet-neutral-300 mb-6">
            {error || 'Unable to find the order you\'re looking for. Please check your order ID and try again.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-sangeet-400 text-sangeet-neutral-950 px-6 py-3 rounded-lg font-semibold hover:bg-sangeet-300 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const currentStatus = orderStatuses[order.status] || orderStatuses.pending;
  const statusStep = getStatusStep(order.status);

  return (
    <div className="min-h-screen bg-sangeet-neutral-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-sangeet-400 mb-4">
            Track Your Order
          </h1>
          <p className="text-sangeet-neutral-300 text-lg">
            Order #{order.order_number || order.id}
          </p>
        </motion.div>

        {/* Order Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-2xl p-6 md:p-8 shadow-2xl border border-sangeet-neutral-700 mb-8"
        >
          {/* Current Status */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${currentStatus.bgColor} ${currentStatus.borderColor} border-2 mb-4`}>
              <span className="text-3xl">{currentStatus.icon}</span>
            </div>
            <h2 className={`text-2xl font-bold ${currentStatus.color} mb-2`}>
              {currentStatus.label}
            </h2>
            <p className="text-sangeet-neutral-300">
              {currentStatus.description}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-sangeet-neutral-200">Order Progress</h3>
              <span className="text-sm text-sangeet-neutral-400">
                {order.status === 'cancelled' ? 'Order Cancelled' : `Step ${statusStep} of 4`}
              </span>
            </div>
            
            {order.status === 'cancelled' ? (
              /* Cancelled Order Display */
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500/30 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">❌</span>
                </div>
                <h3 className="text-xl font-bold text-red-400 mb-2">Order Cancelled</h3>
                <p className="text-sangeet-neutral-300 mb-4">
                  Your order has been cancelled by the restaurant
                </p>
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-300 text-sm mb-3">
                💬 Please contact restaurant staff for refund assistance
              </p>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <p className="text-red-300 text-xs">
                  Auto fresh start in 5 minutes or click Start Fresh
                </p>
              </div>
              <button
                onClick={() => {
                  // Clear any stored cart data
                  localStorage.removeItem('cart');
                  localStorage.removeItem('customerSession');
                  localStorage.removeItem('sessionTimestamp');
                  
                  // Redirect to QR menu page for fresh start
                  navigate('/');
                  
                  // Show fresh start message
                  toast.success('Fresh start! Scan QR code to begin new order 🍽️', {
                    duration: 4000,
                    icon: '🔄'
                  });
                }}
                className="w-full bg-sangeet-400 text-sangeet-neutral-950 px-4 py-2 rounded-lg font-semibold hover:bg-sangeet-300 transition-colors text-sm"
              >
                🔄 Start Fresh
              </button>
            </div>
              </div>
            ) : (
              /* Normal Progress Bar */
              <div className="relative">
                {/* Progress Bar */}
                <div className="absolute top-4 left-0 right-0 h-1 bg-sangeet-neutral-700 rounded-full">
                  <div 
                    className="h-1 bg-gradient-to-r from-sangeet-400 to-sangeet-500 rounded-full transition-all duration-1000"
                    style={{ width: `${(statusStep / 4) * 100}%` }}
                  ></div>
                </div>
                
                {/* Status Steps */}
                <div className="relative flex justify-between">
                  {Object.entries(orderStatuses).filter(([status]) => status !== 'cancelled').map(([status, config], index) => {
                    const isCompleted = getStatusStep(status) <= statusStep;
                    const isCurrent = status === order.status;
                    
                    return (
                      <div key={status} className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                          isCompleted 
                            ? 'bg-sangeet-400 text-sangeet-neutral-950' 
                            : 'bg-sangeet-neutral-700 text-sangeet-neutral-400'
                        }`}>
                          {isCompleted ? '✓' : index + 1}
                        </div>
                        <div className="mt-2 text-center">
                          <p className={`text-xs font-medium ${isCurrent ? currentStatus.color : 'text-sangeet-neutral-400'}`}>
                            {config.label}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Estimated Time */}
          <div className="bg-sangeet-neutral-800/50 rounded-xl p-4 text-center">
            <p className="text-sangeet-neutral-300 mb-1">Estimated Completion</p>
            <p className="text-lg font-semibold text-sangeet-400">
              {order.status === 'completed' ? 'Order Completed' : '15-20 minutes'}
            </p>
          </div>
        </motion.div>

        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Order Information */}
          <div className="bg-gradient-to-r from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-2xl p-6 shadow-2xl border border-sangeet-neutral-700">
            <h3 className="text-xl font-bold text-sangeet-400 mb-4 flex items-center">
              <span className="mr-2">📋</span>
              Order Information
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sangeet-neutral-400">Order Number:</span>
                <span className="text-sangeet-neutral-200 font-semibold">
                  #{order.order_number || order.id}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sangeet-neutral-400">Customer:</span>
                <span className="text-sangeet-neutral-200 font-semibold">
                  {order.customer_name}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sangeet-neutral-400">Table:</span>
                <span className="text-sangeet-neutral-200 font-semibold">
                  {order.table_number || 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sangeet-neutral-400">Order Time:</span>
                <span className="text-sangeet-neutral-200 font-semibold">
                  {formatTime(order.created_at)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sangeet-neutral-400">Date:</span>
                <span className="text-sangeet-neutral-200 font-semibold">
                  {formatDate(order.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-gradient-to-r from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-2xl p-6 shadow-2xl border border-sangeet-neutral-700">
            <h3 className="text-xl font-bold text-sangeet-400 mb-4 flex items-center">
              <span className="mr-2">🍽️</span>
              Order Items
            </h3>
            
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-sangeet-neutral-700 last:border-b-0">
                  <div className="flex-1">
                    <p className="text-sangeet-neutral-200 font-medium">{item.name}</p>
                    <p className="text-sm text-sangeet-neutral-400">
                      Qty: {item.quantity} × ${parseFloat(item.unit_price).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sangeet-neutral-200 font-semibold">
                      ${parseFloat(item.total_price).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              
              <div className="pt-3 border-t border-sangeet-neutral-600">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-sangeet-neutral-200">Total</span>
                  <span className="text-xl font-bold text-sangeet-400">
                    ${getTotalAmount().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
        >
          <button
            onClick={() => navigate('/')}
            className="bg-sangeet-neutral-700 hover:bg-sangeet-neutral-600 text-sangeet-neutral-200 px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Back to Home
          </button>
          
          <button
            onClick={() => navigate('/menu')}
            className="bg-sangeet-400 hover:bg-sangeet-300 text-sangeet-neutral-950 px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Order More Food
          </button>
        </motion.div>

        {/* Review Section - Show when order is ready or completed */}
        {(order.status === 'ready' || order.status === 'completed') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-2xl p-6 border border-yellow-500/30"
          >
            <div className="text-center">
              <div className="text-3xl mb-3">⭐</div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                How was your dining experience?
              </h3>
              <p className="text-sangeet-neutral-300 mb-4">
                We'd love to hear about your meal! Your feedback helps us improve and serve you better.
              </p>
                             <button
                 onClick={() => window.location.href = `/review?orderId=${orderId}&table=${order.table_number}&customerName=${encodeURIComponent(order.customer_name)}`}
                 className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-sangeet-neutral-950 py-3 px-6 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
               >
                 Share Your Experience
               </button>
            </div>
          </motion.div>
        )}

        {/* Auto-refresh notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-6"
        >
          <p className="text-sm text-sangeet-neutral-400">
            🔄 This page automatically updates every 30 seconds
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
