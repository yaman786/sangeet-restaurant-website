import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { createOrder, getTableByQRCode } from '../services/api';
import socketService from '../services/socketService';
import toast from 'react-hot-toast';
import { clearCartData } from '../utils/cartUtils';

const QRCartPage = () => {
  const { qrCode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [tableInfo, setTableInfo] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartInitialized, setCartInitialized] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get table information from QR code
        const tableData = await getTableByQRCode(qrCode);
        if (!tableData) {
          toast.error('Invalid QR code. Please scan a valid table QR code.');
          navigate('/');
          return;
        }
        setTableInfo(tableData);

        // Add a small delay to ensure component is ready
        await new Promise(resolve => setTimeout(resolve, 100));

        // Load cart from localStorage
        
        
        const savedCart = localStorage.getItem(`cart_${qrCode}`);

        
        if (savedCart) {
          try {
            const parsedCart = JSON.parse(savedCart);
            // Validate cart data structure
            if (Array.isArray(parsedCart) && parsedCart.length > 0) {
              setCart(parsedCart);
            } else {
              setCart([]);
            }
          } catch (error) {
            console.error('❌ Error parsing cart data:', error);
            setCart([]);
          }
        } else {
          setCart([]);
        }

        // Mark cart as initialized
        setCartInitialized(true);

        // Cart loading is complete

        // Load customer info from localStorage
        const savedCustomerName = localStorage.getItem(`customer_${qrCode}`);
        if (savedCustomerName) {
          setCustomerName(savedCustomerName);
        }

        const savedInstructions = localStorage.getItem(`instructions_${qrCode}`);
        if (savedInstructions) {
          setSpecialInstructions(savedInstructions);
        }

      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load cart. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [qrCode, navigate]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    // Only run after cart has been initialized
    if (!cartInitialized) {
      return;
    }
    
    // Only save/remove if cart has been loaded (not initial empty state)
    if (cart.length > 0) {
      localStorage.setItem(`cart_${qrCode}`, JSON.stringify(cart));
    } else {
      // Only remove if there was previously saved cart data
      const savedCart = localStorage.getItem(`cart_${qrCode}`);
      if (savedCart) {
        localStorage.removeItem(`cart_${qrCode}`);
      }
    }
  }, [cart, qrCode, cartInitialized]);

  // Save customer info to localStorage
  useEffect(() => {
    if (customerName) {
      localStorage.setItem(`customer_${qrCode}`, customerName);
    }
    if (specialInstructions) {
      localStorage.setItem(`instructions_${qrCode}`, specialInstructions);
    }
  }, [customerName, specialInstructions, qrCode]);

  // Socket connection and order deletion listener
  useEffect(() => {
    // Connect to socket service
    socketService.connect();
    
    // Join table room for order notifications
    if (tableInfo?.table_number) {
      socketService.joinTable(tableInfo.table_number);
    }

    // Listen for order deletion events
    const handleOrderDeleted = (data) => {
      
      
      // Check if this deletion affects our table
      if (data.tableNumber && tableInfo?.table_number && 
          data.tableNumber.toString() === tableInfo.table_number.toString()) {
        
        
        
        // Clear cart state
        setCart([]);
        
        // Use the cart utility function for comprehensive clearing
        const success = clearCartData(qrCode, tableInfo.table_number);
        
        if (success) {

          toast.success('Previous order has been cancelled. Your cart has been cleared.');
          
          // Redirect back to menu
          navigate(`/qr/${qrCode}`);
        } else {
          console.error('❌ Failed to clear cart data');
        }
      }
    };

    socketService.onOrderDeleted(handleOrderDeleted);

    // Cleanup function
    return () => {
      socketService.removeListener('order-deleted');
    };
  }, [tableInfo, qrCode, navigate]);

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.menu_item_id !== itemId));
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.menu_item_id === itemId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.menu_item_id !== itemId));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
  };

  const handleSubmitOrder = async () => {
    if (!customerName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const orderData = {
        table_id: tableInfo.id,
        customer_name: customerName.trim(),
        special_instructions: specialInstructions.trim(),
        items: cart.map(item => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          special_requests: item.special_requests || ''
        }))
      };

      console.log('=== ORDER SUBMISSION DEBUG ===');
      console.log('Order data being sent:', orderData);
      console.log('Cart data:', cart);
      console.log('Table info:', tableInfo);

      const orderResponse = await createOrder(orderData);
      console.log('✅ Order response received:', orderResponse);
      console.log('📋 Full order response structure:', JSON.stringify(orderResponse, null, 2));
      
      const orderId = orderResponse?.order?.id;
      const orderNumber = orderResponse?.order?.order_number;
      const isMerged = orderResponse?.merged || false;
      
      console.log('📋 Extracted order details:', { orderId, orderNumber, isMerged });
      
      if (!orderId) {
        console.error('❌ No order ID found in response');
        throw new Error('Order ID not found in response');
      }
      
      // Clear cart and customer info after successful order
      setCart([]);
      setCustomerName('');
      setSpecialInstructions('');
      localStorage.removeItem(`cart_${qrCode}`);
      localStorage.removeItem(`customer_${qrCode}`);
      localStorage.removeItem(`instructions_${qrCode}`);
      
      // Show appropriate success message based on whether items were merged
      if (isMerged) {
        toast.success('Items added to your existing order successfully!');
      } else {
        toast.success('Order placed successfully!');
      }
      
      // Navigate to unified dashboard page
      const dashboardUrl = `/dashboard?orderId=${orderId}&table=${tableInfo?.table_number}&customerName=${encodeURIComponent(customerName)}&orderNumber=${orderNumber || ''}&totalAmount=${getTotalAmount().toFixed(2)}`;
      console.log('🚀 Navigating to:', dashboardUrl);
      window.location.href = dashboardUrl;
      
    } catch (error) {
      console.error('Error placing order:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      toast.error(error.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueShopping = () => {
    navigate(`/qr/${qrCode}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sangeet-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-sangeet-400">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sangeet-neutral-950">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-sangeet-neutral-900 to-sangeet-neutral-800 border-b border-sangeet-neutral-700 p-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleContinueShopping}
                className="w-10 h-10 bg-sangeet-neutral-700 rounded-full flex items-center justify-center hover:bg-sangeet-neutral-600 transition-colors"
              >
                <span className="text-sangeet-400 text-lg">←</span>
              </button>
              <div>
                <h1 className="text-xl font-bold text-sangeet-400">Your Cart</h1>
                <p className="text-sangeet-neutral-400 text-sm">
                  Table {tableInfo?.table_number} • {cart.length} item{cart.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sangeet-400 font-bold text-lg">
                ${getTotalAmount().toFixed(2)}
              </div>
              <div className="text-sangeet-neutral-400 text-sm">
                Total Amount
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Customer Information */}
        <div className="bg-gradient-to-r from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-xl p-6 mb-6 border border-sangeet-neutral-700">
          <h2 className="text-lg font-semibold text-sangeet-400 mb-4 flex items-center">
            <span className="mr-2">👤</span>
            Your Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sangeet-neutral-300 text-sm mb-2 font-medium">Name *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-300 focus:outline-none focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400/20 transition-all"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-sangeet-neutral-300 text-sm mb-2 font-medium">Special Instructions</label>
              <input
                type="text"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-300 focus:outline-none focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400/20 transition-all"
                placeholder="Any special requests?"
              />
            </div>
          </div>
        </div>

        {/* Cart Items */}
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-sangeet-400 mb-2">Your cart is empty</h3>
            <p className="text-sangeet-neutral-400 mb-6">Add some delicious items to get started!</p>
            <button
              onClick={handleContinueShopping}
              className="bg-sangeet-400 text-sangeet-neutral-950 px-8 py-3 rounded-lg font-semibold hover:bg-sangeet-300 transition-colors shadow-lg hover:shadow-xl"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-xl p-6 mb-6 border border-sangeet-neutral-700">
              <h2 className="text-lg font-semibold text-sangeet-400 mb-4 flex items-center">
                <span className="mr-2">🍽️</span>
                Your Order Items
              </h2>
              <div className="space-y-4">
                {cart.map((item) => (
                  <motion.div
                    key={item.menu_item_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between bg-sangeet-neutral-800 rounded-lg p-4"
                  >
                    <div className="flex-1">
                      <h3 className="text-sangeet-400 font-semibold">{item.name}</h3>
                      <p className="text-sangeet-neutral-400 text-sm">${item.price} each</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.menu_item_id, item.quantity - 1)}
                          className="w-8 h-8 bg-sangeet-neutral-700 text-sangeet-400 rounded-full flex items-center justify-center hover:bg-sangeet-neutral-600 transition-colors"
                        >
                          -
                        </button>
                        <span className="text-sangeet-400 font-medium w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1)}
                          className="w-8 h-8 bg-sangeet-neutral-700 text-sangeet-400 rounded-full flex items-center justify-center hover:bg-sangeet-neutral-600 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="text-sangeet-400 font-semibold">
                          ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.menu_item_id)}
                        className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gradient-to-r from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-xl p-6 mb-6 border border-sangeet-neutral-700">
              <h2 className="text-lg font-semibold text-sangeet-400 mb-4 flex items-center">
                <span className="mr-2">📋</span>
                Order Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sangeet-neutral-400">Items ({cart.length})</span>
                  <span className="text-sangeet-400">{cart.reduce((total, item) => total + item.quantity, 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sangeet-neutral-400">Subtotal</span>
                  <span className="text-sangeet-400">${getTotalAmount().toFixed(2)}</span>
                </div>
                <div className="border-t border-sangeet-neutral-700 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sangeet-400 font-semibold">Total</span>
                    <span className="text-sangeet-400 font-bold text-xl">${getTotalAmount().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleContinueShopping}
                className="flex-1 bg-sangeet-neutral-700 text-sangeet-400 px-8 py-4 rounded-lg font-semibold hover:bg-sangeet-neutral-600 transition-colors"
              >
                Continue Shopping
              </button>
              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting || cart.length === 0}
                className="flex-1 bg-sangeet-400 text-sangeet-neutral-950 px-8 py-4 rounded-lg font-semibold hover:bg-sangeet-300 transition-colors disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QRCartPage; 