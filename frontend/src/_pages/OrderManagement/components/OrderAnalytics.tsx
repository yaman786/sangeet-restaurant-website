"use client";
import React from 'react';
import { motion } from 'framer-motion';

interface Order {
  status: string;
  total_amount: number | string;
}

interface Stats {
  total_orders: number;
}

interface OrderAnalyticsProps {
  stats: Stats;
  orders: Order[];
}

const OrderAnalytics = ({ stats, orders }: OrderAnalyticsProps) => {
  const calculateRevenue = (): number => {
    return orders.filter((o) => o.status === 'completed').reduce((total: number, o: Order) => {
      return total + parseFloat(o.total_amount?.toString() || '0');
    }, 0);
  };

  return (
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
  );
};

export default OrderAnalytics;
