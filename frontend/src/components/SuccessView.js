import React from 'react';
import { motion } from 'framer-motion';

const SuccessView = ({
  orderId,
  orderNumber,
  customerName,
  tableNumber,
  totalAmount,
  orderItems,
  showSuccess,
  orderStatuses,
  getStatusStep,
  formatTime,
  formatDate
}) => {

  const currentStatus = orderStatuses['pending'];
  const statusStep = getStatusStep('pending');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Order Success/Tracking Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-sangeet-neutral-900/80 to-sangeet-neutral-800/80 rounded-3xl p-8 shadow-2xl border border-sangeet-neutral-700/50 backdrop-blur-xl"
      >
        {showSuccess ? (
          // Success State (First 5 seconds)
          <>
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6"
            >
              <span className="text-4xl">✅</span>
            </motion.div>

            {/* Success Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-sangeet-400 mb-4">
                Order Placed Successfully!
              </h1>
              <p className="text-sangeet-neutral-300 text-lg">
                Thank you for your order. We're preparing your delicious meal!
              </p>
            </motion.div>

            {/* Simple Order Confirmation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-sangeet-neutral-800/50 rounded-2xl p-6 mb-8 text-center"
            >
              <div className="flex items-center justify-center space-x-3 mb-4">
                <span className="text-2xl">📋</span>
                <h2 className="text-xl font-semibold text-sangeet-400">
                  Order #{orderNumber || orderId}
                </h2>
              </div>
              
              <div className="flex justify-center items-center space-x-6">
                <div className="text-center">
                  <p className="text-sangeet-neutral-400 text-sm">Total</p>
                  <p className="text-sangeet-neutral-200 font-bold text-lg">
                    ${totalAmount || '0.00'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sangeet-neutral-400 text-sm">Table</p>
                  <p className="text-sangeet-neutral-200 font-semibold">
                    {tableNumber || 'N/A'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Next Steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center">
                <span className="mr-2">⏱️</span>
                What's Next?
              </h3>
              <div className="space-y-2 text-sangeet-neutral-300">
                <p>• Your order is being prepared in our kitchen</p>
                <p>• Estimated preparation time: 15-20 minutes</p>
                <p>• We'll notify you when your order is ready</p>
                <p>• Please collect your order from the counter when ready</p>
              </div>
            </motion.div>
          </>
        ) : (
          // Tracking State (After 4 seconds)
          <>
            {/* Order Status Header */}
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${currentStatus?.bgColor || 'bg-blue-400/10'} ${currentStatus?.borderColor || 'border-blue-400/30'} border-4 mb-6`}>
                <span className="text-4xl">{currentStatus?.icon || '📋'}</span>
              </div>
              <h2 className={`text-3xl font-bold ${currentStatus?.color || 'text-blue-400'} mb-3`}>
                Order Being Processed
              </h2>
              <p className="text-sangeet-neutral-300 text-lg">
                Your order is being prepared in our kitchen
              </p>
            </div>

            {/* Enhanced Order Details */}
            <div className="bg-sangeet-neutral-800/50 rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-sangeet-400 mb-4 flex items-center">
                <span className="mr-2">📋</span>
                Order Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-sangeet-neutral-700/50">
                    <span className="text-sangeet-neutral-400">Order Number:</span>
                    <span className="text-sangeet-neutral-200 font-semibold">
                      #{orderNumber || orderId}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-sangeet-neutral-700/50">
                    <span className="text-sangeet-neutral-400">Customer:</span>
                    <span className="text-sangeet-neutral-200 font-semibold">
                      {customerName || 'Guest'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-sangeet-neutral-700/50">
                    <span className="text-sangeet-neutral-400">Table:</span>
                    <span className="text-sangeet-neutral-200 font-semibold">
                      {tableNumber || 'N/A'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-sangeet-neutral-700/50">
                    <span className="text-sangeet-neutral-400">Order Time:</span>
                    <span className="text-sangeet-neutral-200 font-semibold">
                      {formatTime(new Date())}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-sangeet-neutral-700/50">
                    <span className="text-sangeet-neutral-400">Order Date:</span>
                    <span className="text-sangeet-neutral-200 font-semibold">
                      {formatDate(new Date())}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sangeet-neutral-400">Total Amount:</span>
                    <span className="text-sangeet-neutral-200 font-bold text-lg">
                      ${totalAmount || '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items/Dishes */}
            {orderItems && orderItems.length > 0 && (
              <div className="bg-sangeet-neutral-800/50 rounded-2xl p-6 mb-8">
                <h3 className="text-xl font-semibold text-sangeet-400 mb-4 flex items-center">
                  <span className="mr-2">🍽️</span>
                  Your Order Items ({orderItems.length} items)
                </h3>
                
                <div className="space-y-3">
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-3 border-b border-sangeet-neutral-700/50 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-sangeet-neutral-700 rounded-full flex items-center justify-center text-xs font-semibold">
                          {item.quantity}
                        </div>
                        <div>
                          <p className="text-sangeet-neutral-200 font-medium">{item.name}</p>
                          <p className="text-sm text-sangeet-neutral-400">
                            ${parseFloat(item.unit_price || 0).toFixed(2)} each
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sangeet-neutral-200 font-semibold">
                          ${parseFloat(item.total_price || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Total Amount */}
                  <div className="flex justify-between items-center py-4 border-t-2 border-sangeet-neutral-600 mt-4">
                    <div>
                      <p className="text-lg font-semibold text-sangeet-400">Total Amount</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-sangeet-400">
                        ${parseFloat(totalAmount || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-sangeet-neutral-200">Order Progress</h3>
                <span className="text-sm text-sangeet-neutral-400 bg-sangeet-neutral-800 px-3 py-1 rounded-full">
                  Step {statusStep} of 4
                </span>
              </div>

              <div className="relative">
                {/* Progress Bar */}
                <div className="absolute top-5 left-0 right-0 h-2 bg-sangeet-neutral-700 rounded-full">
                  <div
                    className="h-2 bg-gradient-to-r from-sangeet-400 to-sangeet-500 rounded-full transition-all duration-1000"
                    style={{ width: `${(statusStep / 4) * 100}%` }}
                  ></div>
                </div>

                {/* Status Steps */}
                <div className="relative flex justify-between">
                  {Object.entries(orderStatuses).map(([status, config], index) => {
                    const isCompleted = getStatusStep(status) <= statusStep;
                    const isCurrent = status === 'pending';

                    return (
                      <div key={status} className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                          isCompleted
                            ? 'bg-sangeet-400 text-sangeet-neutral-950'
                            : 'bg-sangeet-neutral-700 text-sangeet-neutral-400'
                        }`}>
                          {isCompleted ? '✓' : index + 1}
                        </div>
                        <div className="mt-3 text-center">
                          <p className={`text-sm font-medium ${isCurrent ? (currentStatus?.color || 'text-blue-400') : 'text-sangeet-neutral-400'}`}>
                            {config.label}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>



            {/* Estimated Time */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6 text-center">
              <p className="text-blue-300 mb-2 text-lg">⏱️ Estimated Completion</p>
              <p className="text-2xl font-semibold text-blue-400">
                15-20 minutes
              </p>
              <p className="text-blue-300 text-sm mt-2">
                We'll notify you when your order is ready for pickup
              </p>
            </div>
          </>
        )}
      </motion.div>



      {/* Restaurant Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-center pt-6 border-t border-sangeet-neutral-700/50"
      >
        <div className="flex items-center justify-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-sangeet-400 rounded-lg flex items-center justify-center">
            <span className="text-sm">🍽️</span>
          </div>
          <h3 className="text-lg font-semibold text-sangeet-400">Sangeet Restaurant</h3>
        </div>
        <p className="text-sangeet-neutral-400 text-sm">
          Thank you for choosing us! We look forward to serving you.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default SuccessView;
