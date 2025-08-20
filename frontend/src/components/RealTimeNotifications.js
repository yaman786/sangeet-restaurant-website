import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, AlertCircle, Clock, Package } from 'lucide-react';
import socketService from '../services/socketService';
import toast from 'react-hot-toast';

const RealTimeNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(true); // Start as connected to avoid immediate warnings
  const [showNotifications, setShowNotifications] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    // Connect to WebSocket for real-time notifications
    try {
      socketService.connect();
      socketService.joinAdmin();
      
      // Check connection status after a longer delay to allow for connection
      setTimeout(() => {
        setIsConnected(socketService.isConnected);
        if (!socketService.isConnected) {
          setConnectionError('Socket connection failed');
        } else {
          setConnectionError(null);
        }
      }, 5000); // Increased delay to 5 seconds
    } catch (error) {
      console.error('Real-time notifications connection error:', error);
      setConnectionError(error.message);
    }



    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Initialize audio context on first user interaction
    const initializeAudio = () => {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('🔊 Audio context initialized');
        return audioContext;
      } catch (error) {
        console.log('🔊 Could not initialize audio context:', error);
        return null;
      }
    };

    // Add click listener to initialize audio
    const handleClick = () => {
      initializeAudio();
      document.removeEventListener('click', handleClick);
    };
    document.addEventListener('click', handleClick);

    // Listen for new orders
    console.log('🔔 RealTimeNotifications: Setting up new-order listener');
    socketService.onNewOrder((data) => {
      console.log('🔔 RealTimeNotifications: New order received:', data);
      const notification = {
        id: Date.now(),
        type: 'new-order',
        title: 'New Order Received!',
        message: `Order #${data.orderNumber} from Table ${data.tableNumber}`,
        data: data,
        timestamp: new Date(),
        read: false
      };

      addNotification(notification);
      playNotificationSound('notification');
      showBrowserNotification(notification.title, notification.message);
      toast.success(`New order from Table ${data.tableNumber}!`);
    });

    // Listen for order status updates
    socketService.onOrderStatusUpdate((data) => {
      const statusMessages = {
        'confirmed': 'Order confirmed',
        'preparing': 'Order is being prepared',
        'ready': 'Order is ready for pickup',
        'completed': 'Order completed',
        'cancelled': 'Order cancelled'
      };

      const notification = {
        id: Date.now(),
        type: 'status-update',
        title: 'Order Status Updated',
        message: `Order #${data.orderId}: ${statusMessages[data.status] || data.status}`,
        data: data,
        timestamp: new Date(),
        read: false
      };

      addNotification(notification);
      
      if (data.status === 'ready') {
        playNotificationSound('completion');
        showBrowserNotification(notification.title, notification.message);
        toast.success(`Order #${data.orderId} is ready!`);
      }
    });

    // Listen for order completion
    socketService.onOrderCompleted((data) => {
      const notification = {
        id: Date.now(),
        type: 'completed',
        title: 'Order Completed!',
        message: `Order #${data.orderId} has been completed`,
        data: data,
        timestamp: new Date(),
        read: false
      };

      addNotification(notification);
      playNotificationSound('completion');
      showBrowserNotification(notification.title, notification.message);
      toast.success(`Order #${data.orderId} completed!`);
    });

    // Listen for order cancellation
    socketService.onOrderCancelled((data) => {
      const notification = {
        id: Date.now(),
        type: 'cancelled',
        title: 'Order Cancelled',
        message: `Order #${data.orderId} has been cancelled`,
        data: data,
        timestamp: new Date(),
        read: false
      };

      addNotification(notification);
      showBrowserNotification(notification.title, notification.message);
      toast.error(`Order #${data.orderId} cancelled`);
    });

    return () => {
      socketService.removeAllListeners();
      socketService.disconnect();
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10 notifications
  };



  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const playNotificationSound = (type) => {
    socketService.playNotificationSound(type);
  };

  const showBrowserNotification = (title, body) => {
    socketService.showBrowserNotification(title, body);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new-order':
        return <Bell className="h-5 w-5 text-blue-500" />;
      case 'status-update':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Debug: Log component state
  console.log('🔔 RealTimeNotifications render:', { isConnected, unreadCount, notificationsCount: notifications.length });

  return (
    <div className="relative">
      {/* Professional connection status indicator */}
      {!isConnected && (
        <div className="absolute -top-8 right-0 text-xs text-amber-400 bg-amber-900/20 px-2 py-1 rounded border border-amber-500/30 whitespace-nowrap">
          ⚠️ Real-time updates unavailable
        </div>
      )}
      
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-sangeet-neutral-400 hover:text-sangeet-400 transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
      </button>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-12 w-80 bg-sangeet-neutral-900 border border-sangeet-neutral-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
          >
            <div className="p-4 border-b border-sangeet-neutral-700">
              <h3 className="text-lg font-semibold text-sangeet-neutral-100">
                Notifications
              </h3>
              <p className="text-sm text-sangeet-neutral-400">
                {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="p-2">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-sangeet-neutral-600 mx-auto mb-2" />
                  <p className="text-sangeet-neutral-400">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 rounded-lg border ${
                        notification.read 
                          ? 'bg-sangeet-neutral-800 border-sangeet-neutral-700' 
                          : 'bg-sangeet-neutral-800/50 border-sangeet-400/30'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-sangeet-neutral-100">
                              {notification.title}
                            </p>
                            <p className="text-xs text-sangeet-neutral-400 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-sangeet-neutral-500 mt-1">
                              {new Date(notification.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className="text-sangeet-neutral-500 hover:text-sangeet-neutral-300"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RealTimeNotifications; 