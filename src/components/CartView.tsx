"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ShoppingCart, UtensilsCrossed, Trash2, Info } from 'lucide-react';
const CartView = ({ 
  cart, 
  onUpdateQuantity, 
  onRemoveFromCart, 
  onPlaceOrder, 
  onContinueOrdering, 
  getCartTotal, 
  loading 
}: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 pb-36"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-sangeet-400 mb-4">Your Cart</h1>
        <p className="text-sangeet-neutral-300 text-lg">
          Review your order before placing it
        </p>
      </div>

      {/* Cart Items */}
      <div className="bg-linear-to-r from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-xl p-6 border border-sangeet-neutral-700">
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-sangeet-400 opacity-50" />
            <h3 className="text-xl font-semibold text-sangeet-400 mb-2">Your cart is empty</h3>
            <p className="text-sangeet-neutral-400 mb-6">Add some delicious items to get started!</p>
            <button
              onClick={onContinueOrdering}
              className="bg-sangeet-400 text-sangeet-neutral-950 px-6 py-3 rounded-lg font-semibold hover:bg-sangeet-300 transition-colors"
            >
              <span className="flex items-center justify-center gap-2"><UtensilsCrossed className="w-5 h-5" /> Browse Menu</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cart Items List */}
            <div className="space-y-4">
              {cart.map((item: any) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center space-x-4 p-4 bg-sangeet-neutral-800/50 rounded-lg border border-sangeet-neutral-700"
                >
                  {/* Item Image */}
                  <div className="relative flex-shrink-0 w-16 h-16">
                    <Image
                      src={item.image_url || '/placeholder-food.jpg'}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="rounded-lg object-cover"
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
                    <span className="text-lg font-semibold text-sangeet-neutral-200 min-w-8 text-center">
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
                    <Trash2 className="w-5 h-5" />
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

          </div>
        )}
      </div>

      {/* Sticky Bottom Checkout Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-[#1C1917]/95 backdrop-blur-xl border-t border-white/10 z-50 shadow-[0_-16px_48px_rgba(0,0,0,0.5)]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4">
          <button
            onClick={onContinueOrdering}
            className="flex-1 bg-transparent border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/5 transition-all duration-300 text-lg"
          >
            Add More Items
          </button>
          
          <button
            onClick={onPlaceOrder}
            disabled={loading}
            className="flex-1 bg-sangeet-400 text-sangeet-neutral-950 px-8 py-4 rounded-xl font-bold hover:bg-sangeet-300 transition-all duration-300 disabled:opacity-50 shadow-gold-glow text-lg relative overflow-hidden group"
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <span className="relative z-10 flex items-center justify-center space-x-2">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sangeet-neutral-950"></div>
                  <span>Placing Order...</span>
                </>
              ) : (
                <span>Place Order</span>
              )}
            </span>
          </button>
        </div>
      </div>

      {/* Order Info */}
      {cart.length > 0 && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center">
            <Info className="w-5 h-5 mr-2" />
            Order Information
          </h3>
          <div className="space-y-2 text-sangeet-neutral-300 text-sm">
            <p>• Your order will be prepared fresh in our kitchen</p>
            <p>• Estimated preparation time: 15-20 minutes</p>
            <p>• You&apos;ll receive real-time updates on your order status</p>
            <p>• Please collect your order from the counter when ready</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CartView;
