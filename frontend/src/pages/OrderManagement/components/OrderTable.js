import React from 'react';
import { motion } from 'framer-motion';

const OrderTable = ({
  userRole, filteredOrders, viewMode, updatingOrder, handleStatusUpdate, setSelectedOrder, setShowDeleteModal, tables
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTableNumber = (tableId) => {
    const table = tables.find(t => t.id === tableId);
    return table ? table.table_number : 'N/A';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-sangeet-neutral-200">
        <h2 className="text-lg font-semibold text-sangeet-neutral-900">
          {userRole === 'admin' ? 'Orders' : 'Kitchen Orders'} ({filteredOrders.length})
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-sangeet-neutral-200">
          <thead className="bg-sangeet-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-sangeet-neutral-500 uppercase tracking-wider">
                Order Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-sangeet-neutral-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-sangeet-neutral-500 uppercase tracking-wider">
                Table
              </th>
              {userRole === 'admin' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-sangeet-neutral-500 uppercase tracking-wider">
                  Amount
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-sangeet-neutral-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-sangeet-neutral-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-sangeet-neutral-200">
            {filteredOrders.map((order) => (
              <motion.tr
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="hover:bg-sangeet-neutral-50 transition-all duration-200 border-l-4 border-transparent hover:border-l-sangeet-400"
              >
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-sangeet-neutral-900">
                      Order #{order.order_number}
                    </div>
                    <div className="text-sm text-sangeet-neutral-500">
                      {formatDate(order.created_at)}
                    </div>
                    {viewMode === 'detailed' && order.items && userRole === 'admin' && (
                      <div className="mt-2 text-xs text-sangeet-neutral-600">
                        {order.items.map(item => (
                          <div key={item.id}>
                            {item.quantity}x {item.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-sangeet-neutral-900">
                    {order.customer_name}
                  </div>
                  {order.special_instructions && (
                    <div className="text-sm text-sangeet-neutral-500">
                      "{order.special_instructions}"
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-sangeet-neutral-900">
                  Table {getTableNumber(order.table_id)}
                </td>
                {userRole === 'admin' && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-sangeet-neutral-900">
                    ${order.total_amount}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm transition-all duration-200 ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                    order.status === 'confirmed' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                    order.status === 'preparing' ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                    order.status === 'ready' ? 'bg-green-100 text-green-800 border border-green-300' :
                    order.status === 'completed' ? 'bg-gray-100 text-gray-800 border border-gray-300' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800 border border-red-300' :
                    'bg-gray-100 text-gray-800 border border-gray-300'
                  }`}>
                    {order.status === 'pending' && '⏳ '}
                    {order.status === 'confirmed' && '✅ '}
                    {order.status === 'preparing' && '👨‍🍳 '}
                    {order.status === 'ready' && '🎉 '}
                    {order.status === 'completed' && '✅ '}
                    {order.status === 'cancelled' && '❌ '}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex flex-wrap gap-2">
                    {/* Status Update Buttons */}
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'pending')}
                        disabled={updatingOrder === order.id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                          order.status === 'pending'
                            ? 'bg-yellow-500 text-white shadow-lg'
                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-300'
                        }`}
                      >
                        ⏳ {updatingOrder === order.id ? 'Updating...' : 'Pending'}
                      </button>
                      
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                        disabled={updatingOrder === order.id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                          order.status === 'confirmed'
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300'
                        }`}
                      >
                        ✅ {updatingOrder === order.id ? 'Updating...' : 'Confirmed'}
                      </button>
                      
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'preparing')}
                        disabled={updatingOrder === order.id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                          order.status === 'preparing'
                            ? 'bg-orange-500 text-white shadow-lg'
                            : 'bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-300'
                        }`}
                      >
                        👨‍🍳 {updatingOrder === order.id ? 'Updating...' : 'Preparing'}
                      </button>
                      
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'ready')}
                        disabled={updatingOrder === order.id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                          order.status === 'ready'
                            ? 'bg-green-500 text-white shadow-lg'
                            : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                        }`}
                      >
                        🎉 {updatingOrder === order.id ? 'Updating...' : 'Ready'}
                      </button>
                      
                      {userRole === 'admin' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'completed')}
                            disabled={updatingOrder === order.id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                              order.status === 'completed'
                                ? 'bg-gray-500 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                            }`}
                          >
                            ✅ {updatingOrder === order.id ? 'Updating...' : 'Completed'}
                          </button>
                          
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                            disabled={updatingOrder === order.id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                              order.status === 'cancelled'
                                ? 'bg-red-500 text-white shadow-lg'
                                : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
                            }`}
                          >
                            ❌ {updatingOrder === order.id ? 'Updating...' : 'Cancelled'}
                          </button>
                        </>
                      )}
                    </div>
                    
                    {userRole === 'admin' && (
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDeleteModal(true);
                        }}
                        className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 border border-red-300 transition-all duration-200 transform hover:scale-105"
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sangeet-neutral-500">
              {userRole === 'admin' ? 'No orders found' : 'No active orders'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTable;
