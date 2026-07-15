"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useNavigate } from '@/utils/router-mock';
import { fetchMenuItems, fetchMenuCategories, getTableByQRCode, getOrdersByTable } from '../services/api';
import { pusherClient as socketService } from '@/lib/services/pusherClient';
import toast from 'react-hot-toast';
import { clearCartData } from '../utils/cartUtils';
import MenuView from '../components/MenuView';
import { ShoppingBag, ChefHat, Sparkles } from 'lucide-react';

const QRMenuPage = () => {
  const params = useParams(); const qrCode = typeof params?.qrCode === "string" ? params.qrCode : (params?.qrCode ? params.qrCode[0] : "");
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [tableInfo, setTableInfo] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [cartInitialized, setCartInitialized] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const hasRedirected = useRef(false);

  // Check for active orders automatically
  useEffect(() => {
    const checkForActiveOrders = async () => {
      try {
        const tableData = await getTableByQRCode(qrCode as string);
        if (tableData) {
          const ordersResponse = await getOrdersByTable(tableData.table_number || '');
          const orders = ordersResponse || [];
          const activeOrders = orders.filter((order: any) => 
            order.status !== 'completed' && order.status !== 'cancelled'
          );
          
          if (activeOrders.length > 0) {
            const firstActiveOrder = activeOrders[0];
            const redirectUrl = `/dashboard?table=${tableData.table_number}&orderId=${firstActiveOrder.id}&orderNumber=${firstActiveOrder.order_number}`;
            toast.success(`Welcome back! Redirecting to your active order...`);
            navigate(redirectUrl, { replace: true });
          }
        }
      } catch (error) {
        console.error('Error in automatic redirect check:', error);
      }
    };
    
    // Small delay to ensure component is fully loaded
    const timer = setTimeout(checkForActiveOrders, 500);
    return () => clearTimeout(timer);
  }, [qrCode, navigate]);

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected.current) {
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);

        // Get table information from QR code
        const tableData = await getTableByQRCode(qrCode as string);
        
        if (!tableData) {
          toast.error('Invalid QR code');
          navigate('/');
          return;
        }
        setTableInfo(tableData);

        // Check for active orders for this table
        try {
          const ordersResponse = await getOrdersByTable(tableData.table_number || '');
          const orders = (ordersResponse as any)?.data || [];
          
          // Filter for active orders (not completed or cancelled)
          const activeOrders = orders.filter((order: any) => 
            order.status !== 'completed' && order.status !== 'cancelled'
          );
          
          if (activeOrders.length > 0) {
            // Set redirecting state to prevent menu rendering
            setIsRedirecting(true);
            hasRedirected.current = true;
            
            // Get the first active order for customer details
            const firstActiveOrder = activeOrders[0];
            
            // Store table info for tracking page
            localStorage.setItem('currentTable', JSON.stringify(tableData));
            
            // Store customer information from the active order
            localStorage.setItem(`customer_${tableData.table_number}`, JSON.stringify({
              name: firstActiveOrder.customer_name,
              orderId: firstActiveOrder.id,
              orderNumber: firstActiveOrder.order_number
            }));
            
            // Build redirect URL
            const redirectUrl = `/dashboard?table=${tableData.table_number}&customerName=${encodeURIComponent(firstActiveOrder.customer_name)}&orderId=${firstActiveOrder.id}&orderNumber=${firstActiveOrder.order_number}`;
            
            // Show toast and redirect immediately
            toast.success('You have an active order! Redirecting to tracking page...');
            
            // Redirect immediately
            navigate(redirectUrl, { replace: true });
            
            return; // Exit early - don't load menu data
          }
        } catch (error) {
          console.error('Error checking orders:', error);
          // Continue to menu page if there's an error checking orders
        }

        // Only load menu data if no active orders found
        const menuData = await fetchMenuItems();
        setMenuItems(menuData);

        const categoriesData = await fetchMenuCategories();
        setCategories(categoriesData);

      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load menu. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []); // Temporarily remove dependencies to test

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem(`cart_${qrCode}`);

    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        
        if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          setCart(parsedCart);
        } else {
          setCart([]);
        }
      } catch (error) {
        console.error('Error parsing cart data:', error);
        setCart([]);
      }
    } else {
      setCart([]);
    }
    
    setCartInitialized(true);
  }, [qrCode]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!cartInitialized) {
      return;
    }

    if (cart.length > 0) {
      try {
        const cartData = JSON.stringify(cart);
        localStorage.setItem(`cart_${qrCode}`, cartData);
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    } else {
      const existingCart = localStorage.getItem(`cart_${qrCode}`);
      if (existingCart) {
        try {
          localStorage.removeItem(`cart_${qrCode}`);
        } catch (error) {
          console.error('Error removing cart from localStorage:', error);
        }
      }
    }
  }, [cart, qrCode, cartInitialized]);

  // Socket connection and order deletion listener
  useEffect(() => {
    // Connect to socket service
    socketService.connect();
    
    // Join table room for order notifications
    if (tableInfo?.table_number) {
      socketService.joinTable(tableInfo.table_number);
    }

    // Listen for order deletion events
    const handleOrderDeleted = (data: any) => {
      // Check if this deletion affects our table
      if (data.tableNumber && tableInfo?.table_number && 
          data.tableNumber.toString() === tableInfo.table_number.toString()) {
        
        // Clear cart state
        setCart([]);
        
        // Use the cart utility function for comprehensive clearing
        const success = clearCartData(qrCode || '', tableInfo.table_number);
        
        if (success) {
          toast.success('Previous order has been cancelled. Your cart has been cleared.');
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
  }, [tableInfo, qrCode]);

  const handleAddToCart = (item: any) => {
    setCart((prevCart: any[]) => {
      const existingItem = prevCart.find(cartItem => cartItem.menu_item_id === item.id);
      
      let newCart;
      if (existingItem) {
        newCart = prevCart.map(cartItem =>
          cartItem.menu_item_id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        newCart = [...prevCart, { 
          menu_item_id: item.id, 
          quantity: 1, 
          name: item.name,
          price: item.price,
          special_requests: ''
        }];
      }
      
      // Immediately save to localStorage
      try {
        const cartData = JSON.stringify(newCart);
        localStorage.setItem(`cart_${qrCode}`, cartData);
      } catch (error) {
        console.error('Error saving cart immediately:', error);
      }
      
      return newCart;
    });
    toast.success(`${item.name} added to cart!`);
  };

  const handleViewCart = () => {
    navigate(`/qr/${qrCode}/cart`);
  };

  const filteredMenuItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => {
        // Handle both string categories and category objects
        const categoryName = item.category_name || item.category;
        const selectedCat = typeof selectedCategory === 'object' ? (selectedCategory as any).name : selectedCategory;
        return categoryName === selectedCat;
      });

  if (loading) {
    return (
      <div className="min-h-screen bg-sangeet-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-sangeet-400">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#131210] text-sangeet-neutral-100 selection:bg-sangeet-400 selection:text-[#131210]">
      {/* Liquid Glass Hero Header */}
      <div className="relative h-[40vh] min-h-[300px] w-full overflow-hidden flex items-center justify-center">
        {/* Parallax Background */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#131210] via-[#131210]/60 to-transparent"></div>
        
        {/* Hero Content */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 text-center px-4"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-6 shadow-glass">
            <ChefHat className="w-8 h-8 text-sangeet-400" />
          </div>
          <h1 className="font-display text-4xl md:text-6xl text-white font-bold mb-4 tracking-tight drop-shadow-2xl">
            Sangeet <span className="text-sangeet-400 italic font-light">Fine Dining</span>
          </h1>
          <div className="inline-flex items-center space-x-2 bg-sangeet-400/10 backdrop-blur-md border border-sangeet-400/20 px-6 py-2 rounded-full">
            <Sparkles className="w-4 h-4 text-sangeet-400" />
            <p className="text-sangeet-400 font-medium tracking-wide">
              Table {tableInfo?.table_number}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-12 relative z-20">
        <MenuView 
          menuItems={menuItems}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAddToCart={handleAddToCart}
          onViewCart={handleViewCart}
          cartLength={cart.length}
        />
      </div>

      {/* Floating Glassmorphism Cart Bar */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-6 left-0 right-0 px-4 z-50 pointer-events-none"
          >
            <div className="max-w-2xl mx-auto pointer-events-auto">
              <button
                onClick={handleViewCart}
                className="w-full bg-[#1C1917]/90 backdrop-blur-xl border border-white/10 text-white p-4 rounded-2xl shadow-glass-lg hover:shadow-gold-glow-lg transition-all duration-300 flex items-center justify-between group overflow-hidden relative"
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                
                <div className="flex items-center space-x-4 relative z-10">
                  <div className="w-12 h-12 bg-sangeet-400 rounded-xl flex items-center justify-center shadow-lg">
                    <ShoppingBag className="w-6 h-6 text-[#1C1917]" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-lg leading-tight">{cart.length} Item{cart.length !== 1 ? 's' : ''}</p>
                    <p className="text-sangeet-neutral-400 text-sm">View your order details</p>
                  </div>
                </div>
                
                <div className="text-right relative z-10">
                  <p className="text-xs text-sangeet-neutral-400 uppercase tracking-wider mb-0.5">Total Estimate</p>
                  <p className="font-display text-2xl font-bold text-sangeet-400">
                    ${cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0).toFixed(2)}
                  </p>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QRMenuPage;