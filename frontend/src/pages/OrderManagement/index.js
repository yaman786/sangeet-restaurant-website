import React from 'react';
import AdminHeader from '../../components/AdminHeader';
import { useOrderManagement } from './hooks/useOrderManagement';
import OrderAnalytics from './components/OrderAnalytics';
import OrderControls from './components/OrderControls';
import OrderTable from './components/OrderTable';
import OrderModals from './components/OrderModals';

const OrderManagement = () => {
  const {
    orders, tables, stats, loading, userRole, filters, setFilters,
    selectedOrder, setSelectedOrder, showDeleteModal, setShowDeleteModal,
    viewMode, setViewMode, updatingOrder, completedOrders,
    handleStatusUpdate, handleDelete, clearCompletedOrders, getFilteredOrders
  } = useOrderManagement();

  const filteredOrders = getFilteredOrders();

  return (
    <div className="min-h-screen bg-sangeet-neutral-50">
      <AdminHeader />
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sangeet-400"></div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-sangeet-neutral-900 mb-2">
              {userRole === 'admin' ? 'Order Management' : 'Kitchen Orders'}
            </h1>
            <p className="text-sangeet-neutral-600">
              {userRole === 'admin' 
                ? 'Manage all orders, track business analytics, and handle customer inquiries'
                : 'View and update current orders for kitchen operations'
              }
            </p>
          </div>

          {userRole === 'admin' && (
            <OrderAnalytics stats={stats} orders={orders} />
          )}

          <OrderControls 
            userRole={userRole}
            viewMode={viewMode} setViewMode={setViewMode}
            filters={filters} setFilters={setFilters}
            tables={tables}
            completedOrders={completedOrders}
            clearCompletedOrders={clearCompletedOrders}
            orders={orders}
          />

          <OrderTable 
            userRole={userRole}
            filteredOrders={filteredOrders}
            viewMode={viewMode}
            updatingOrder={updatingOrder}
            handleStatusUpdate={handleStatusUpdate}
            setSelectedOrder={setSelectedOrder}
            setShowDeleteModal={setShowDeleteModal}
            tables={tables}
          />

          <OrderModals 
            userRole={userRole}
            showDeleteModal={showDeleteModal}
            selectedOrder={selectedOrder}
            setShowDeleteModal={setShowDeleteModal}
            setSelectedOrder={setSelectedOrder}
            handleDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
