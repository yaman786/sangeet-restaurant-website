"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api/client';
import toast from 'react-hot-toast';

const RealTimeNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastOrderSeen, setLastOrderSeen] = useState<number | null>(null);

  // Poll for latest orders every 10 seconds
  const { data: latestOrders } = useQuery({
    queryKey: ['latest-orders'],
    queryFn: async () => {
      return await api.get('/orders?limit=5&sort=created_at&order=desc');
    },
    refetchInterval: 10000, // Poll every 10s
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('adminToken')
  });

  useEffect(() => {
    if (latestOrders && Array.isArray(latestOrders.data) && latestOrders.data.length > 0) {
      const newestOrder = latestOrders.data[0];
      
      if (lastOrderSeen === null) {
        setLastOrderSeen(newestOrder.id);
        return;
      }

      if (newestOrder.id !== lastOrderSeen) {
        setLastOrderSeen(newestOrder.id);
        
        const notification = {
          id: Date.now(),
          type: 'new-order',
          title: 'New Order Received!',
          message: `Order #${newestOrder.id} from Table ${newestOrder.table_number || 'Unknown'}`,
          timestamp: new Date(),
          read: false
        };

        setNotifications(prev => [notification, ...prev.slice(0, 9)]);
        toast.success(`New order from Table ${newestOrder.table_number || 'Unknown'}!`);
      }
    }
  }, [latestOrders, lastOrderSeen]);

  const removeNotification = (id: any) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
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
      </button>

      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-12 w-80 bg-sangeet-neutral-900 border border-sangeet-neutral-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
          >
            <div className="p-4 border-b border-sangeet-neutral-700">
              <h3 className="text-lg font-semibold text-sangeet-neutral-100">Notifications</h3>
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
                    <div key={notification.id} className="p-3 rounded-lg border bg-sangeet-neutral-800 border-sangeet-neutral-700">
                      <div className="flex justify-between">
                        <div className="flex items-start space-x-3">
                          <Package className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium text-white">{notification.title}</p>
                            <p className="text-xs text-gray-400">{notification.message}</p>
                          </div>
                        </div>
                        <button onClick={() => removeNotification(notification.id)} className="text-gray-500 hover:text-gray-300">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
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