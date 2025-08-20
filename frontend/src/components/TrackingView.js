import React, { useState, useEffect } from 'react';
import ReviewModal from './ReviewModal';
import { groupItemsBySession, getSessionTitle, hasMultipleSessions } from '../utils/itemUtils';

// Helper function to check if item is new (added within last 5 minutes)
const isNewItem = (createdAt) => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return new Date(createdAt) > fiveMinutesAgo;
};

const TrackingView = ({ 
  orders, 
  orderStatuses, 
  getStatusStep, 
  formatTime, 
  formatDate,
  customerName,
  tableNumber
}) => {
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    order: null
  });
  const [reviewedOrders, setReviewedOrders] = useState(new Set());

  // Check for ready orders and show review modal
  useEffect(() => {
    const readyOrders = orders.filter(order => 
      order.status === 'ready' && 
      !reviewedOrders.has(order.id)
    );

    if (readyOrders.length > 0) {
      // Show review modal for the first ready order
      const orderToReview = readyOrders[0];
      setReviewModal({
        isOpen: true,
        order: orderToReview
      });
    }
  }, [orders, reviewedOrders]);

  const handleReviewClose = () => {
    setReviewModal({ isOpen: false, order: null });
  };

  const handleReviewSubmitted = () => {
    if (reviewModal.order) {
      setReviewedOrders(prev => new Set([...prev, reviewModal.order.id]));
    }
  };
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-sangeet-400 mb-2">📱 Order Tracking</h2>
        <p className="text-sangeet-neutral-300 text-sm sm:text-lg">
          Real-time updates on all your orders
        </p>
        {customerName && (
          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-sangeet-400/10 border border-sangeet-400/30 rounded-lg">
            <p className="text-sangeet-400 font-medium text-sm sm:text-base">
              Welcome back, <span className="text-sangeet-300">{customerName}</span>! 
              {tableNumber && <span className="text-sangeet-neutral-400"> (Table {tableNumber})</span>}
            </p>
          </div>
        )}
      </div>

      {/* Orders Summary - Mobile Optimized */}
      {orders.length > 0 && (
        <div className="bg-gradient-to-r from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-sangeet-neutral-700 mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-sangeet-neutral-200">Orders Summary</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-sangeet-neutral-400">Live Updates</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            <div>
              <p className="text-lg sm:text-2xl font-bold text-sangeet-400">{orders.length}</p>
              <p className="text-sangeet-neutral-400 text-xs sm:text-sm">Total Orders</p>
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold text-sangeet-400">
                {orders.reduce((total, order) => total + (order.items?.length || 0), 0)}
              </p>
              <p className="text-sangeet-neutral-400 text-xs sm:text-sm">Total Items</p>
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold text-sangeet-400">
                ${orders.reduce((total, order) => total + parseFloat(order.total_amount || 0), 0).toFixed(2)}
              </p>
              <p className="text-sangeet-neutral-400 text-xs sm:text-sm">Grand Total</p>
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📋</div>
          <h3 className="text-lg sm:text-xl font-semibold text-sangeet-400 mb-2">No active orders</h3>
          <p className="text-sangeet-neutral-400 text-sm sm:text-base">Start ordering to see your orders here!</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {orders.map(order => (
            <OrderCard
              key={`${order.id}-${order.status}-${order.updated_at}`}
              order={order}
              orderStatuses={orderStatuses}
              getStatusStep={getStatusStep}
              formatTime={formatTime}
              formatDate={formatDate}
              tableNumber={tableNumber}
            />
          ))}
        </div>
      )}

      {/* Auto-refresh Notice - Mobile Optimized */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <p className="text-blue-300 text-xs sm:text-sm">
            🔄 Orders update automatically in real-time
          </p>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={handleReviewClose}
        order={reviewModal.order}
        customerName={customerName}
        tableNumber={tableNumber}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
};

const OrderCard = ({ order, orderStatuses, getStatusStep, formatTime, formatDate, tableNumber }) => {
  const currentStatus = orderStatuses[order.status] || orderStatuses.pending;
  const statusStep = getStatusStep(order.status);

  return (
    <div className="bg-gradient-to-r from-sangeet-neutral-900/80 to-sangeet-neutral-800/80 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl border border-sangeet-neutral-700/50 backdrop-blur-xl transition-all duration-500">
      {/* Order Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${currentStatus.bgColor} ${currentStatus.borderColor} border-2`}>
            <span className="text-lg sm:text-2xl">{currentStatus.icon}</span>
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-sangeet-neutral-200">
              Order #{order.order_number || order.id}
            </h3>
            <p className="text-sangeet-neutral-400 text-sm sm:text-base">
              {order.customer_name} • {formatTime(order.created_at)}
              {order.updated_at && order.updated_at !== order.created_at && (
                <span className="ml-2 text-xs text-sangeet-400">
                  • Updated: {formatTime(order.updated_at)}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-row sm:flex-col items-center sm:items-end space-x-3 sm:space-x-0 sm:space-y-2">
          {/* Status Badge */}
          <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${currentStatus.bgColor} ${currentStatus.borderColor} border transition-all duration-300`}>
            <span className={`${currentStatus.color}`}>{currentStatus.label}</span>
          </div>
          {/* Update Indicator */}
          {order.updated_at && order.updated_at !== order.created_at && (
            <div className="text-xs text-sangeet-neutral-400 bg-sangeet-neutral-800/50 px-2 py-1 rounded">
              Updated: {formatTime(order.updated_at)}
            </div>
          )}
          <div className="text-sangeet-neutral-400 text-base sm:text-lg">
            📱
          </div>
        </div>
      </div>

      {/* Status Progress - Mobile Optimized */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h4 className="text-base sm:text-lg font-semibold text-sangeet-neutral-200">Order Progress</h4>
          <span className="text-xs sm:text-sm text-sangeet-neutral-400 bg-sangeet-neutral-800 px-2 sm:px-3 py-1 rounded-full">
            {order.status === 'cancelled' ? 'Order Cancelled' : `Step ${statusStep} of 4`}
          </span>
        </div>

        {order.status === 'cancelled' ? (
          /* Cancelled Order Display */
          <div className="text-center py-6 sm:py-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-red-500/20 border-2 border-red-500/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl sm:text-3xl">❌</span>
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-red-400 mb-2">Order Cancelled</h4>
            <p className="text-sangeet-neutral-300 mb-4 text-sm sm:text-base">
              Your order has been cancelled by the restaurant
            </p>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 sm:p-4">
              <p className="text-red-300 text-xs sm:text-sm mb-2">
                💬 Please contact restaurant staff for refund assistance
              </p>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-400 rounded-full animate-pulse"></div>
                <p className="text-red-300 text-xs">
                  Auto fresh start in 2 minutes
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Normal Progress Bar */
          <div className="relative">
            {/* Progress Bar */}
            <div className="absolute top-4 sm:top-5 left-0 right-0 h-1.5 sm:h-2 bg-sangeet-neutral-700 rounded-full overflow-hidden">
              <div
                className="h-1.5 sm:h-2 bg-gradient-to-r from-sangeet-400 to-sangeet-500 rounded-full transition-all duration-1000 ease-out relative shadow-lg"
                style={{ width: `${(statusStep / 4) * 100}%` }}
              >
                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                {/* Glow effect on status change */}
                <div className="absolute inset-0 bg-sangeet-400/20 rounded-full animate-ping"></div>
              </div>
            </div>

            {/* Status Steps */}
            <div className="relative flex justify-between">
              {Object.entries(orderStatuses).filter(([status]) => status !== 'cancelled').map(([status, config], index) => {
                const isCompleted = getStatusStep(status) <= statusStep;
                const isCurrent = status === order.status;

                return (
                  <div key={status} className="flex flex-col items-center">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-500 ${
                      isCompleted
                        ? 'bg-sangeet-400 text-sangeet-neutral-950'
                        : isCurrent
                        ? 'bg-sangeet-500 text-sangeet-neutral-950 animate-pulse ring-2 ring-sangeet-400 ring-opacity-50'
                        : 'bg-sangeet-neutral-700 text-sangeet-neutral-400'
                    }`}>
                      {isCompleted ? '✓' : config.icon}
                    </div>
                    <div className="mt-2 sm:mt-3 text-center">
                      <p className={`text-xs sm:text-sm font-medium ${isCurrent ? currentStatus.color : 'text-sangeet-neutral-400'}`}>
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

      {/* Current Status - Mobile Optimized */}
      <div className="bg-sangeet-neutral-800/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 border-l-4 border-sangeet-400">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <span className="text-xl sm:text-2xl animate-bounce">{currentStatus.icon}</span>
          <div>
            <h4 className={`text-base sm:text-lg font-semibold ${currentStatus.color} transition-colors duration-500`}>
              {currentStatus.label}
            </h4>
            <p className="text-sangeet-neutral-300 text-xs sm:text-sm">
              {currentStatus.description}
            </p>
          </div>
        </div>
      </div>

      {/* Order Items - Mobile Optimized */}
      {order.items && order.items.length > 0 && (
        <div className="mb-4 sm:mb-6">
          <h4 className="text-base sm:text-lg font-semibold text-sangeet-neutral-200 mb-3 sm:mb-4">Order Items</h4>
          
          {/* Merge Info */}
          {hasMultipleSessions(order.items) && (
            <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-blue-400">➕</span>
                <span className="text-blue-300 text-xs sm:text-sm font-medium">
                  Items have been added to your order
                </span>
              </div>
            </div>
          )}
          
          {/* Order Sessions */}
          <div className="space-y-3 sm:space-y-4">
            {groupItemsBySession(order.items).map((session, sessionIndex) => (
              <div key={session.id} className="border border-sangeet-neutral-700/50 rounded-lg p-3 sm:p-4">
                <h5 className="text-xs sm:text-sm font-semibold text-sangeet-neutral-300 mb-2 sm:mb-3 flex items-center space-x-2">
                  <span>{sessionIndex === 0 ? '📋' : '➕'}</span>
                  <span>{getSessionTitle(session, sessionIndex === 0)}</span>
                </h5>
                <div className="space-y-2">
                  {session.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 sm:space-x-3 py-2 border-b border-sangeet-neutral-700/30 last:border-b-0">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-sangeet-neutral-700 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {item.quantity}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sangeet-neutral-200 font-medium text-sm sm:text-base truncate">{item.name}</p>
                          {isNewItem(item.created_at) && (
                            <span className="bg-green-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium animate-pulse flex-shrink-0">
                              NEW
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-sangeet-neutral-400">
                          ${parseFloat(item.unit_price).toFixed(2)} each
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sangeet-neutral-200 font-semibold text-sm sm:text-base">
                          ${parseFloat(item.total_price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Details - Mobile Optimized */}
      <div className="bg-sangeet-neutral-800/30 rounded-xl sm:rounded-2xl p-3 sm:p-4">
        <h4 className="text-base sm:text-lg font-semibold text-sangeet-neutral-200 mb-2 sm:mb-3">Order Details</h4>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
          <div>
            <p className="text-sangeet-neutral-400">Order Date:</p>
            <p className="text-sangeet-neutral-200 font-medium">
              {formatDate(order.created_at)}
            </p>
          </div>
          <div>
            <p className="text-sangeet-neutral-400">Order Time:</p>
            <p className="text-sangeet-neutral-200 font-medium">
              {formatTime(order.created_at)}
            </p>
          </div>
          <div>
            <p className="text-sangeet-neutral-400">Customer:</p>
            <p className="text-sangeet-neutral-200 font-medium">
              {order.customer_name}
            </p>
          </div>
          <div>
            <p className="text-sangeet-neutral-400">Table:</p>
            <p className="text-sangeet-neutral-200 font-medium">
              {order.table_number || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Estimated Time - Mobile Optimized */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
        <p className="text-blue-300 text-xs sm:text-sm mb-1">Estimated Completion</p>
        <p className="text-base sm:text-lg font-semibold text-blue-400">
          {order.status === 'completed' ? 'Order Completed' : '15-20 minutes'}
        </p>
      </div>
    </div>
  );
};

export default TrackingView;
