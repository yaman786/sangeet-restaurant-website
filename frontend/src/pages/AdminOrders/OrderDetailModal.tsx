import React from 'react';
import { motion } from 'framer-motion';
import { sortItemsByNewness, isNewItem, getTimeSinceAdded } from '../../utils/itemUtils';

const OrderDetailModal = ({ selectedOrderDetails, setShowOrderModal }: any) => {
  if (!selectedOrderDetails) return null;

  const getStatusColor = (status: any) => {
    const colors = {
      pending: 'bg-yellow-500',
      confirmed: 'bg-blue-500',
      preparing: 'bg-orange-500',
      ready: 'bg-green-500',
      completed: 'bg-gray-500',
      cancelled: 'bg-red-500'
    };
    return (colors as any)[status] || 'bg-gray-500';
  };

  const formatDate = (dateString: any) => {
    return new Date(dateString).toLocaleString();
  };

  return (
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
            {(selectedOrderDetails.status || 'unknown').charAt(0).toUpperCase() + (selectedOrderDetails.status || 'unknown').slice(1)}
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
                    {(item as any).quantity}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sangeet-neutral-200 font-medium">{(item as any).name}</p>
                      {isNewItem(item.created_at) && (
                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium animate-pulse">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-sangeet-neutral-400">
                      ${parseFloat((item as any).unit_price).toFixed(2)} each
                    </p>
                    <p className="text-xs text-sangeet-neutral-500">
                      {getTimeSinceAdded(item.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sangeet-neutral-200 font-semibold">
                      ${parseFloat((item as any).total_price).toFixed(2)}
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
  );
};

export default OrderDetailModal;
