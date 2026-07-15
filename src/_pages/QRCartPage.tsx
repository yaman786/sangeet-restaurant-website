"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useNavigate } from '@/utils/router-mock';
import { toast } from 'react-hot-toast';
import { createOrder, getTableByQRCode } from '../services/api';
import { pusherClient as socketService } from '@/lib/services/pusherClient';
import { clearCartData } from '../utils/cartUtils';
import { ChevronLeft, User, MessageSquare, Utensils, Minus, Plus, X, Receipt, ShoppingBag } from 'lucide-react';

const QRCartPage = () => {
  const { qrCode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<any[]>([]);
  const [tableInfo, setTableInfo] = useState<any>(null);
  const [customerName, setCustomerName] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartInitialized, setCartInitialized] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get table information from QR code
        const tableData = await getTableByQRCode(qrCode as string);
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

        setCartInitialized(true);

        // Cart loading is complete

        // Load customer info from localStorage
        const savedCustomer = localStorage.getItem(`customer_${qrCode as string}`);
        if (savedCustomer) setCustomerName(savedCustomer);
        const savedInstructions = localStorage.getItem(`instructions_${qrCode as string}`);
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
      localStorage.setItem(`cart_${qrCode as string}`, JSON.stringify(cart));
    } else {
      // Only remove if there was previously saved cart data
      const savedCart = localStorage.getItem(`cart_${qrCode || ''}`);
      if (savedCart) {
        localStorage.removeItem(`cart_${qrCode as string}`);
      }
    }
  }, [cart, qrCode, cartInitialized]);

  // Save customer info to localStorage
  useEffect(() => {
    if (customerName) {
      localStorage.setItem(`customer_${qrCode as string}`, customerName);
    }
    if (specialInstructions) {
      localStorage.setItem(`instructions_${qrCode as string}`, specialInstructions);
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
    const handleOrderUpdated = (data: any) => {
      
      
      // Check if this deletion affects our table
      if (data.tableNumber && tableInfo?.table_number && 
          data.tableNumber.toString() === tableInfo.table_number.toString()) {
        
        
        
        // Clear cart state
        setCart([]);
        
        // Use the cart utility function for comprehensive clearing
        const success = clearCartData(qrCode as string, tableInfo.table_number);
        
        if (success) {

          toast.success('Previous order has been cancelled. Your cart has been cleared.');
          
          // Redirect back to menu
          navigate(`/qr/${qrCode}`);
        } else {
          console.error('❌ Failed to clear cart data');
        }
      }
    };

    socketService.onOrderDeleted(handleOrderUpdated);

    // Cleanup function
    return () => {
      socketService.removeListener('order-deleted');
    };
  }, [tableInfo, qrCode, navigate]);

  const updateQuantity = (itemId: any, quantity: any) => {
    if (quantity <= 0) {
      setCart((prevCart: any[]) => prevCart.filter((item: any) => item.menu_item_id !== itemId));
      return;
    }
    setCart((prevCart: any[]) =>
      prevCart.map((item: any) =>
        item.menu_item_id === itemId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (itemId: any) => {
    setCart((prevCart: any[]) => prevCart.filter((item: any) => item.menu_item_id !== itemId));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item: any) => total + (parseFloat(item.price) * item.quantity), 0);
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

    setIsSubmitting(true);

    try {
      const orderData = {
        table_id: (tableInfo as any).id,
        customer_name: customerName.trim(),
        special_instructions: specialInstructions.trim(),
        items: cart.map((item: any) => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          special_requests: item.special_requests || ''
        }))
      };

      // Order submission debug info

      // Use direct fetch instead of API service
      const orderResponse = await createOrder(orderData);
      
      const orderId = (orderResponse as any)?.order?.id;
      const orderNumber = (orderResponse as any)?.order?.order_number;
      const isMerged = (orderResponse as any)?.merged || false;
      
      if (!orderId) {
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
      
      // Navigate to unified dashboard page using React Router instead of window.location.href
      const dashboardUrl = `/dashboard?orderId=${orderId}&table=${(tableInfo as any)?.table_number}&customerName=${encodeURIComponent(customerName)}&orderNumber=${orderNumber || ''}&totalAmount=${getTotalAmount().toFixed(2)}`;
      navigate(dashboardUrl, { replace: true });
      
    } catch (error: any) {
      console.error('Error placing order:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Check if it's a validation error about missing fields
      if (error.response?.data?.error?.includes('Missing required fields')) {
        toast.error('Order data is incomplete. Please try again.');
      } else {
        toast.error(error.response?.data?.error || 'Failed to place order. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueOrdering = () => {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-[#131210] text-sangeet-neutral-100 selection:bg-sangeet-400 selection:text-[#131210] pb-24">
      {/* Liquid Glass Header */}
      <div className="bg-[#1C1917]/80 backdrop-blur-xl border-b border-white/10 p-4 sticky top-0 z-50 shadow-glass">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleContinueOrdering}
                className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors shadow-glass"
              >
                <ChevronLeft className="w-5 h-5 text-sangeet-400" />
              </button>
              <div>
                <h1 className="font-display text-2xl font-bold text-white tracking-tight">Your Order</h1>
                <p className="text-sangeet-400 text-sm font-medium">
                  Table {tableInfo?.table_number} • {cart.length} item{cart.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-2xl font-bold text-sangeet-400">
                ${getTotalAmount().toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8 mt-4">
        {cart.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 px-4 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-glass"
          >
            <ShoppingBag className="w-16 h-16 text-sangeet-neutral-500 mx-auto mb-6 opacity-50" />
            <h3 className="font-display text-3xl font-semibold text-sangeet-400 mb-3">Your order is empty</h3>
            <p className="text-sangeet-neutral-400 mb-8 text-lg">Add some culinary delights to get started.</p>
            <button
              onClick={handleContinueOrdering}
              className="bg-sangeet-400 text-sangeet-neutral-950 px-8 py-3.5 rounded-xl font-semibold hover:bg-sangeet-300 transition-colors shadow-gold-glow"
            >
              Explore Menu
            </button>
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
            
            {/* Customer Information (Liquid Glass Panel) */}
            <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10 shadow-glass">
              <h2 className="font-display text-2xl text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-sangeet-400/20 rounded-full flex items-center justify-center mr-3 border border-sangeet-400/30">
                  <User className="w-4 h-4 text-sangeet-400" />
                </div>
                Guest Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sangeet-neutral-400 text-sm mb-2 ml-1 font-medium">Name *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-5 py-4 bg-[#131210]/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-sangeet-400 focus:bg-[#131210] transition-all duration-300 shadow-inner"
                    placeholder="E.g., Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-sangeet-neutral-400 text-sm mb-2 ml-1 font-medium">Special Requests</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="w-full px-5 py-4 bg-[#131210]/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-sangeet-400 focus:bg-[#131210] transition-all duration-300 shadow-inner pl-12"
                      placeholder="Allergies, preferences..."
                    />
                    <MessageSquare className="w-5 h-5 text-sangeet-neutral-500 absolute left-4 top-1/2 transform -translate-y-1/2" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Cart Items List */}
            <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10 shadow-glass">
              <h2 className="font-display text-2xl text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-sangeet-400/20 rounded-full flex items-center justify-center mr-3 border border-sangeet-400/30">
                  <Utensils className="w-4 h-4 text-sangeet-400" />
                </div>
                Selected Items
              </h2>
              <div className="space-y-4">
                {cart.map((item: any) => (
                  <div
                    key={item.menu_item_id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#131210]/30 rounded-2xl p-4 border border-white/5"
                  >
                    <div className="flex-1 mb-4 sm:mb-0">
                      <h3 className="font-display text-xl text-white mb-1">{item.name}</h3>
                      <p className="text-sangeet-400 text-sm font-medium">${parseFloat(item.price).toFixed(2)} each</p>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      <div className="flex items-center gap-4 bg-[#1C1917] rounded-full p-1 border border-white/10 shadow-inner">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQuantity(item.menu_item_id, item.quantity - 1)}
                          className="w-8 h-8 bg-white/5 text-sangeet-400 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </motion.button>
                        <span className="text-white font-medium w-4 text-center">{item.quantity}</span>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1)}
                          className="w-8 h-8 bg-sangeet-400 text-[#131210] rounded-full flex items-center justify-center hover:bg-sangeet-300 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </motion.button>
                      </div>
                      
                      <div className="text-right min-w-[80px]">
                        <div className="font-display text-xl font-bold text-white">
                          ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                      
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeFromCart(item.menu_item_id)}
                        className="w-10 h-10 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-300 ml-2"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Order Summary & Actions */}
            <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10 shadow-glass">
              <h2 className="font-display text-2xl text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-sangeet-400/20 rounded-full flex items-center justify-center mr-3 border border-sangeet-400/30">
                  <Receipt className="w-4 h-4 text-sangeet-400" />
                </div>
                Summary
              </h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sangeet-neutral-300 text-lg">
                  <span>Subtotal ({cart.reduce((total, item: any) => total + item.quantity, 0)} items)</span>
                  <span className="font-medium">${getTotalAmount().toFixed(2)}</span>
                </div>
                <div className="border-t border-white/10 pt-4 flex justify-between items-end">
                  <span className="text-white text-lg">Total</span>
                  <span className="font-display text-4xl font-bold text-sangeet-400 drop-shadow-md">
                    ${getTotalAmount().toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleContinueOrdering}
                  className="flex-1 bg-transparent border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/5 transition-all duration-300 text-lg"
                >
                  Add More Items
                </button>
                <button
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting || cart.length === 0}
                  className="flex-1 bg-sangeet-400 text-sangeet-neutral-950 px-8 py-4 rounded-xl font-bold hover:bg-sangeet-300 transition-all duration-300 disabled:opacity-50 shadow-gold-glow text-lg relative overflow-hidden group"
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <span className="relative z-10">{isSubmitting ? 'Confirming...' : 'Place Order'}</span>
                </button>
              </div>
            </motion.div>

          </motion.div>
        )}
      </div>
    </div>
  );
};

export default QRCartPage; 