import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get order details from URL params or state
  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get('orderId');
  const tableNumber = searchParams.get('table');
  const customerName = searchParams.get('customerName');
  const orderNumber = searchParams.get('orderNumber');
  const totalAmount = searchParams.get('totalAmount');
  




  const handleBackToMenu = () => {
    // Extract QR code from current URL or go to home
    const qrCode = location.pathname.split('/qr/')[1]?.split('/')[0];
    if (qrCode) {
      navigate(`/qr/${qrCode}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-sangeet-neutral-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
        className="max-w-2xl w-full space-y-8"
      >
        {/* Success Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto h-24 w-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-2xl"
          >
            <span className="text-4xl">✅</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-bold text-green-400 mb-4"
          >
            Order Placed Successfully!
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-sangeet-neutral-300 mb-8"
          >
            Thank you for your order, {customerName || 'Valued Customer'}! 
            Our kitchen is preparing your delicious meal.
          </motion.p>
        </div>

        {/* Order Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-2xl p-8 shadow-2xl border border-sangeet-neutral-700"
        >
          <h2 className="text-2xl font-bold text-sangeet-400 mb-6 flex items-center">
            <span className="mr-3">📋</span>
            Order Details
          </h2>
          
          <div className="space-y-4">
            {orderNumber && (
              <div className="flex justify-between items-center py-3 border-b border-sangeet-neutral-700">
                <span className="text-sangeet-neutral-300 font-medium">Order Number:</span>
                <span className="text-sangeet-400 font-bold text-lg">{orderNumber}</span>
              </div>
            )}
            
            {tableNumber && (
              <div className="flex justify-between items-center py-3 border-b border-sangeet-neutral-700">
                <span className="text-sangeet-neutral-300 font-medium">Table:</span>
                <span className="text-sangeet-400 font-bold">Table {tableNumber}</span>
              </div>
            )}
            
            {customerName && (
              <div className="flex justify-between items-center py-3 border-b border-sangeet-neutral-700">
                <span className="text-sangeet-neutral-300 font-medium">Customer:</span>
                <span className="text-sangeet-400 font-bold">{customerName}</span>
              </div>
            )}
            
            {totalAmount && (
              <div className="flex justify-between items-center py-3">
                <span className="text-sangeet-neutral-300 font-medium">Total Amount:</span>
                <span className="text-green-400 font-bold text-xl">${parseFloat(totalAmount).toFixed(2)}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Status Updates */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl p-6 border border-blue-500/30"
        >
          <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center">
            <span className="mr-2">⏱️</span>
            What's Next?
          </h3>
          
          <div className="space-y-3 text-sangeet-neutral-300">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
              <p>Your order has been received and is being prepared</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
              <p>Our kitchen staff will start cooking your meal shortly</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <p>You'll be notified when your order is ready</p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={handleBackToMenu}
            className="flex-1 bg-sangeet-neutral-700 hover:bg-sangeet-neutral-600 text-sangeet-neutral-200 py-4 px-6 rounded-xl font-semibold transition-colors duration-300 flex items-center justify-center space-x-2"
          >
            <span>🍽️</span>
            <span>Continue Ordering</span>
          </button>
          
                           <button
                   onClick={() => window.open(`/track?orderId=${orderId}`, '_blank')}
                   className="flex-1 bg-gradient-to-r from-sangeet-400 to-sangeet-500 hover:from-sangeet-300 hover:to-sangeet-400 text-sangeet-neutral-950 py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                 >
                   <span>📱</span>
                   <span>Track Your Order</span>
                 </button>
        </motion.div>

        

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-sangeet-neutral-500 text-sm"
        >
          <p>Thank you for choosing Sangeet Restaurant! 🍛</p>
          <p className="mt-1">For any questions, please contact our staff</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OrderSuccessPage;
