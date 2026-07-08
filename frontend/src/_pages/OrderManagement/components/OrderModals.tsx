"use client";
import React from 'react';

const OrderModals = ({
  userRole, showDeleteModal, selectedOrder, setShowDeleteModal, setSelectedOrder, handleDelete
}: any) => {
  return (
    <>
      {userRole === 'admin' && showDeleteModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-sangeet-neutral-900 mb-4">
              Delete Order
            </h3>
            <p className="text-sangeet-neutral-600 mb-6">
              Are you sure you want to delete Order #{selectedOrder.order_number} for {selectedOrder.customer_name}?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 text-sangeet-neutral-600 border border-sangeet-neutral-300 rounded-md hover:bg-sangeet-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(selectedOrder.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderModals;
