"use client";
import React from 'react';
import { motion } from 'framer-motion';
import AdminHeader from '../../components/AdminHeader';
import OrderFilters from './OrderFilters';
import OrderTable from './OrderTable';
import OrderDetailModal from './OrderDetailModal';
import { useOrderManagement } from './hooks/useOrderManagement';

const AdminOrders = () => {
  const {
    orders,
    completedOrders,
    loading,
    selectedOrders,
    filters,
    setFilters,
    tables,
    viewMode,
    setViewMode,
    selectedOrderDetails,
    setSelectedOrderDetails,
    showOrderModal,
    setShowOrderModal,
    deleteModal,
    activeOrdersModal,
    handleStatusUpdate,
    handleDeleteOrderClick,
    confirmDeleteOrder,
    cancelDeleteOrder,
    handleViewOrderDetails,
    handleBulkStatusUpdate,
    handleClearCompletedOrdersClick,
    confirmClearCompletedOrders,
    cancelClearCompletedOrders,
    clearModal,
    handleOrderSelection,
    handleSelectAll,
    canCompleteOrder,
    showActiveOrdersModalDetails,
    closeActiveOrdersModal
  } = useOrderManagement();

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

  if (loading) {
    return (
      <div className="min-h-screen bg-sangeet-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-sangeet-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sangeet-neutral-950">
      <AdminHeader title="Admin Orders" subtitle="Manage kitchen orders" />

      <div className="max-w-7xl mx-auto p-6">
        <OrderFilters 
          viewMode={viewMode}
          setViewMode={setViewMode}
          completedOrders={completedOrders}
          handleClearCompletedOrders={handleClearCompletedOrdersClick}
          filters={filters}
          setFilters={setFilters}
          tables={tables}
        />

        <OrderTable 
          orders={orders}
          completedOrders={completedOrders}
          viewMode={viewMode}
          selectedOrders={selectedOrders}
          handleSelectAll={handleSelectAll}
          handleOrderSelection={handleOrderSelection}
          handleStatusUpdate={handleStatusUpdate}
          canCompleteOrder={canCompleteOrder}
          showActiveOrdersModalDetails={showActiveOrdersModalDetails}
          handleViewOrderDetails={handleViewOrderDetails}
          handleDeleteOrderClick={handleDeleteOrderClick}
          handleBulkStatusUpdate={handleBulkStatusUpdate}
        />

        {showOrderModal && selectedOrderDetails && (
          <OrderDetailModal 
            selectedOrderDetails={selectedOrderDetails}
            setShowOrderModal={setShowOrderModal}
          />
        )}

        {/* Active Orders Modal */}
        {activeOrdersModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-2xl p-8 border border-sangeet-neutral-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-red-400 mb-2">
                  Cannot Complete Order
                </h2>
                <p className="text-sangeet-neutral-300">
                  {activeOrdersModal.customerName} has other active orders that must be completed first.
                </p>
              </div>

              {/* Active Orders List */}
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6">
                <h3 className="text-red-300 font-medium mb-3">Active Orders:</h3>
                <div className="space-y-3">
                  {activeOrdersModal.activeOrders.map((order: any) => (
                    <div key={order.id} className="bg-sangeet-neutral-800/50 rounded-lg p-3 border border-sangeet-neutral-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sangeet-400 font-semibold">
                            Order #{order.order_number}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(order.status)}`}>
                            {{
                              'pending': 'New Order',
                              'preparing': 'In Kitchen',
                              'ready': 'Ready / Served',
                              'completed': 'Paid & Completed',
                              'cancelled': 'Cancelled'
                            }[order.status as string] || (order.status || 'unknown').charAt(0).toUpperCase() + (order.status || 'unknown').slice(1)}
                          </span>
                        </div>
                        <span className="text-sangeet-neutral-400 text-sm">
                          Table {order.table_number}
                        </span>
                      </div>
                      <div className="text-sangeet-neutral-300 text-sm">
                        Created: {formatDate(order.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <span className="text-yellow-400 text-xl">💡</span>
                  <div>
                    <p className="text-yellow-300 font-medium mb-1">Instructions:</p>
                    <ul className="text-yellow-200 text-sm space-y-1">
                      <li>• Complete all active orders for this customer first</li>
                      <li>• Then you can complete the current order</li>
                      <li>• This prevents orphaned orders and ensures proper payment flow</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-center">
                <button
                  onClick={closeActiveOrdersModal}
                  className="bg-sangeet-neutral-700 hover:bg-sangeet-neutral-600 text-sangeet-neutral-200 font-medium py-3 px-8 rounded-xl transition-colors duration-200"
                >
                  Got It
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={closeActiveOrdersModal}
                className="absolute top-4 right-4 text-sangeet-neutral-400 hover:text-sangeet-neutral-200 text-2xl transition-colors duration-200"
              >
                ×
              </button>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-2xl p-8 border border-sangeet-neutral-700 max-w-md w-full"
            >
              {/* Header */}
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🗑️</div>
                <h2 className="text-2xl font-bold text-red-400 mb-2">
                  Delete Order
                </h2>
                <p className="text-sangeet-neutral-300">
                  Are you sure you want to delete this order? This action cannot be undone.
                </p>
              </div>

              {/* Order Info */}
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-red-300 font-medium">
                    Order #{deleteModal.orderNumber}
                  </p>
                  <span className="text-red-400 text-sm">⚠️</span>
                </div>
                <p className="text-sangeet-neutral-300 text-sm">
                  {deleteModal.customerName} • Table {deleteModal.tableNumber}
                </p>
              </div>

              {/* Warning */}
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <span className="text-yellow-400 text-xl">⚠️</span>
                  <div>
                    <p className="text-yellow-300 font-medium mb-1">Important:</p>
                    <ul className="text-yellow-200 text-sm space-y-1">
                      <li>• Order will be permanently deleted</li>
                      <li>• Customer will be notified automatically</li>
                      <li>• All order data will be cleared</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={cancelDeleteOrder}
                  className="flex-1 bg-sangeet-neutral-700 hover:bg-sangeet-neutral-600 text-sangeet-neutral-200 font-medium py-3 px-4 rounded-xl transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteOrder}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200"
                >
                  Delete Order
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={cancelDeleteOrder}
                className="absolute top-4 right-4 text-sangeet-neutral-400 hover:text-sangeet-neutral-200 text-2xl transition-colors duration-200"
              >
                ×
              </button>
            </motion.div>
          </div>
        )}

        {/* Clear Completed Orders Modal */}
        {clearModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-2xl p-8 border border-sangeet-neutral-700 max-w-md w-full"
            >
              {/* Header */}
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🧹</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Clear Completed Orders?
                </h2>
                <p className="text-sangeet-neutral-300">
                  Are you sure you want to clear all completed orders from the screen? 
                  <br/><br/>
                  <span className="text-sangeet-400 text-sm">Note: Data will be safely kept for analytics and history.</span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex space-x-4">
                <button
                  onClick={cancelClearCompletedOrders}
                  className="flex-1 bg-sangeet-neutral-800 hover:bg-sangeet-neutral-700 text-sangeet-neutral-200 font-medium py-3 px-4 rounded-xl transition-colors duration-200 border border-sangeet-neutral-700"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClearCompletedOrders}
                  className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-medium py-3 px-4 rounded-xl transition-colors duration-200 border border-red-500/30"
                >
                  Clear Screen
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
