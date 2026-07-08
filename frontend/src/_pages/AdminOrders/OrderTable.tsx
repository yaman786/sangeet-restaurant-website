"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomDropdown from '../../components/CustomDropdown';
import { hasMultipleSessions } from '../../utils/itemUtils';

const OrderTable = ({
  orders,
  completedOrders,
  viewMode,
  selectedOrders,
  handleSelectAll,
  handleOrderSelection,
  handleStatusUpdate,
  canCompleteOrder,
  showActiveOrdersModalDetails,
  handleViewOrderDetails,
  handleDeleteOrderClick,
  handleBulkStatusUpdate
}: any) => {
  const currentOrders = viewMode === 'completed' ? completedOrders : orders;
  const selectableOrders = currentOrders.filter((order: any) =>
    order.status !== 'completed' && order.status !== 'cancelled'
  );
  
  const isAllSelected = selectedOrders.length === selectableOrders.length && selectableOrders.length > 0;

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

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <>
      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-xl p-4 mb-6 border border-sangeet-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sangeet-neutral-400">
                {selectedOrders.length} order(s) selected
              </p>
              <p className="text-xs text-sangeet-neutral-500 mt-1">
                💡 Completed and cancelled orders cannot be modified
              </p>
            </div>
            <div className="flex space-x-2">
              {['preparing', 'ready', 'completed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleBulkStatusUpdate(status)}
                  className="px-3 py-1 bg-sangeet-400 text-sangeet-neutral-950 rounded text-sm font-medium hover:bg-sangeet-300 transition-colors"
                >
                  Mark {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-xl border border-sangeet-neutral-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-sangeet-neutral-800">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="rounded border-sangeet-neutral-600 bg-sangeet-neutral-800 text-sangeet-400 focus:ring-sangeet-400"
                  />
                </th>
                <th className="px-6 py-4 text-left text-sangeet-neutral-400 font-medium">Order #</th>
                <th className="px-6 py-4 text-left text-sangeet-neutral-400 font-medium">Customer</th>
                <th className="px-6 py-4 text-left text-sangeet-neutral-400 font-medium">Table</th>
                <th className="px-6 py-4 text-left text-sangeet-neutral-400 font-medium">Amount</th>
                <th className="px-6 py-4 text-left text-sangeet-neutral-400 font-medium">Status</th>
                <th className="px-6 py-4 text-left text-sangeet-neutral-400 font-medium">Date</th>
                <th className="px-6 py-4 text-left text-sangeet-neutral-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sangeet-neutral-700">
              <AnimatePresence mode="wait">
                {currentOrders.map((order: any) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    layout
                    transition={{ duration: 0.2 }}
                    className="hover:bg-sangeet-neutral-800 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => handleOrderSelection(order.id)}
                        disabled={order.status === 'completed' || order.status === 'cancelled'}
                        className={`rounded border-sangeet-neutral-600 focus:ring-sangeet-400 ${order.status === 'completed' || order.status === 'cancelled'
                            ? 'bg-sangeet-neutral-700 text-sangeet-neutral-500 cursor-not-allowed'
                            : 'bg-sangeet-neutral-800 text-sangeet-400'
                          }`}
                        title={order.status === 'completed' || order.status === 'cancelled'
                          ? `Cannot select ${order.status} orders for bulk actions`
                          : 'Select for bulk actions'
                        }
                      />
                    </td>
                    <td className="px-6 py-4 text-sangeet-400 font-medium">
                      <div className="flex items-center space-x-2">
                        <span>{order.order_number}</span>
                        {order.items && hasMultipleSessions(order.items) && (
                          <span className="bg-blue-500 text-white px-1 py-0.5 rounded text-xs font-medium" title="Merged Order">
                            🔄
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sangeet-neutral-300">{order.customer_name}</td>
                    <td className="px-6 py-4 text-sangeet-neutral-300">Table {order.table_number}</td>
                    <td className="px-6 py-4 text-sangeet-400 font-medium">${order.total_amount}</td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(order.status)} transition-all duration-300`}>
                          {(order.status || 'unknown').charAt(0).toUpperCase() + (order.status || 'unknown').slice(1)}
                        </span>
                        {order.updated_at && order.updated_at !== order.created_at && (
                          <div className="text-xs text-sangeet-neutral-500 mt-1">
                            Updated: {formatDate(order.updated_at)}
                          </div>
                        )}
                        {order.updated_at && order.updated_at !== order.created_at && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                        )}
                        {(order.status === 'completed' || order.status === 'cancelled') && (
                          <div className="absolute -top-1 -left-1 w-3 h-3 bg-sangeet-neutral-600 rounded-full flex items-center justify-center">
                            <span className="text-xs">🔒</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sangeet-neutral-400 text-sm">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <div className="relative">
                          <CustomDropdown
                            value={order.status}
                            onChange={(newStatus: any) => handleStatusUpdate(order.id, newStatus)}
                            options={statusOptions}
                            className={`text-xs ${order.status === 'completed' || order.status === 'cancelled' ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={order.status === 'completed' || order.status === 'cancelled'}
                          />
                          {(order.status === 'completed' || order.status === 'cancelled') && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-sangeet-neutral-600 rounded-full flex items-center justify-center">
                              <span className="text-xs">🔒</span>
                            </div>
                          )}
                          {!canCompleteOrder(order) && order.status !== 'completed' && order.status !== 'cancelled' && (
                            <button
                              onClick={() => showActiveOrdersModalDetails(order)}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
                              title="Cannot complete - customer has other active orders. Click to view details."
                            >
                              <span className="text-xs">⚠️</span>
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => handleViewOrderDetails(order.id)}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteOrderClick(order.id)}
                          className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {currentOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sangeet-neutral-400">No orders found</p>
          </div>
        )}
      </div>
    </>
  );
};

export default OrderTable;
