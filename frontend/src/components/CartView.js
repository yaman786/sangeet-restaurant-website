import React from 'react';
import { motion } from 'framer-motion';

const CartView = ({ 
  cart, 
  onUpdateQuantity, 
  onRemoveFromCart, 
  onPlaceOrder, 
  onContinueOrdering, 
  getCartTotal, 
  loading 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-sangeet-400 mb-4">Your Cart</h1>
        <p className="text-sangeet-neutral-300 text-lg">
          Review your order before placing it
        </p>
      </div>

      {/* Cart Items */}
      <div className="bg-gradient-to-r from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-xl p-6 border border-sangeet-neutral-700">
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-sangeet-400 mb-2">Your cart is empty</h3>
            <p className="text-sangeet-neutral-400 mb-6">Add some delicious items to get started!</p>
            <button
              onClick={onContinueOrdering}
              className="bg-sangeet-400 text-sangeet-neutral-950 px-6 py-3 rounded-lg font-semibold hover:bg-sangeet-300 transition-colors"
            >
              🍽️ Browse Menu
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cart Items List */}
            <div className="space-y-4">
              {cart.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center space-x-4 p-4 bg-sangeet-neutral-800/50 rounded-lg border border-sangeet-neutral-700"
                >
                  {/* Item Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.image_url || '/placeholder-food.jpg'}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder-food.jpg';
                      }}
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-sangeet-neutral-200 truncate">
                      {item.name}
                    </h3>
                    <p className="text-sangeet-neutral-400 text-sm">
                      ${parseFloat(item.price).toFixed(2)} each
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 bg-sangeet-neutral-700 hover:bg-sangeet-neutral-600 text-sangeet-neutral-300 rounded-full flex items-center justify-center transition-colors"
                    >
                      -
                    </button>
                    <span className="text-lg font-semibold text-sangeet-neutral-200 min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 bg-sangeet-neutral-700 hover:bg-sangeet-neutral-600 text-sangeet-neutral-300 rounded-full flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-sangeet-400">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveFromCart(item.id)}
                    className="text-red-400 hover:text-red-300 transition-colors p-2"
                  >
                    🗑️
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="border-t border-sangeet-neutral-700 pt-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold text-sangeet-neutral-200">Total:</span>
                  <span className="text-2xl font-bold text-sangeet-400">
                    ${getCartTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                onClick={onContinueOrdering}
                className="flex-1 bg-sangeet-neutral-700 hover:bg-sangeet-neutral-600 text-sangeet-neutral-200 py-4 px-6 rounded-xl font-semibold transition-colors duration-300 flex items-center justify-center space-x-2"
              >
                <span>🍽️</span>
                <span>Continue Ordering</span>
              </button>
              
              <button
                onClick={onPlaceOrder}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-sangeet-400 to-sangeet-500 hover:from-sangeet-300 hover:to-sangeet-400 text-sangeet-neutral-950 py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sangeet-neutral-950"></div>
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <span>✅</span>
                    <span>Place Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Info */}
      {cart.length > 0 && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center">
            <span className="mr-2">ℹ️</span>
            Order Information
          </h3>
          <div className="space-y-2 text-sangeet-neutral-300 text-sm">
            <p>• Your order will be prepared fresh in our kitchen</p>
            <p>• Estimated preparation time: 15-20 minutes</p>
            <p>• You'll receive real-time updates on your order status</p>
            <p>• Please collect your order from the counter when ready</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CartView;
