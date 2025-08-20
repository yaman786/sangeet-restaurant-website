import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMenuItems, fetchMenuCategories, getTableByQRCode, getOrdersByTable } from '../services/api';
import socketService from '../services/socketService';
import toast from 'react-hot-toast';
import { clearCartData } from '../utils/cartUtils';

const QRMenuPage = () => {
  const { qrCode } = useParams();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [tableInfo, setTableInfo] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartInitialized, setCartInitialized] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const hasRedirected = useRef(false);

  // Check for active orders automatically
  useEffect(() => {
    const checkForActiveOrders = async () => {
      try {
        const tableData = await getTableByQRCode(qrCode);
        if (tableData) {
          const ordersResponse = await getOrdersByTable(tableData.table_number);
          const orders = ordersResponse || [];
          const activeOrders = orders.filter(order => 
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
        const tableData = await getTableByQRCode(qrCode);
        
        if (!tableData) {
          toast.error('Invalid QR code');
          navigate('/');
          return;
        }
        setTableInfo(tableData);

        // Check for active orders for this table
        try {
          const ordersResponse = await getOrdersByTable(tableData.table_number);
          const orders = ordersResponse.data || [];
          
          // Filter for active orders (not completed or cancelled)
          const activeOrders = orders.filter(order => 
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
    const handleOrderDeleted = (data) => {
      console.log('🗑️ Order deleted event received:', data);
      
      // Check if this deletion affects our table
      if (data.tableNumber && tableInfo?.table_number && 
          data.tableNumber.toString() === tableInfo.table_number.toString()) {
        
        console.log('🗑️ Clearing cart for deleted order on table', tableInfo.table_number);
        
        // Clear cart state
        setCart([]);
        
        // Use the cart utility function for comprehensive clearing
        const success = clearCartData(qrCode, tableInfo.table_number);
        
        if (success) {
          console.log('✅ Cart data cleared successfully');
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

  const addToCart = (item) => {
    setCart(prevCart => {
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
        const itemCategory = item.category_name || item.category;
        const selectedCat = typeof selectedCategory === 'object' ? selectedCategory.name : selectedCategory;
        return itemCategory === selectedCat;
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
    <div className="min-h-screen bg-sangeet-neutral-950">
      {/* Professional Header - Fixed Sticky Navigation */}
      <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-sangeet-neutral-900 to-sangeet-neutral-800 border-b border-sangeet-neutral-700 p-4 z-50 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-sangeet-400 rounded-full flex items-center justify-center">
                <span className="text-sangeet-neutral-950 font-bold text-lg">🍽️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-sangeet-400">Sangeet Restaurant</h1>
                <p className="text-sangeet-neutral-400 text-sm">
                  Table {tableInfo?.table_number} • Digital Menu
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sangeet-400 font-bold text-lg">
                  ${cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0).toFixed(2)}
                </div>
                <div className="text-sangeet-neutral-400 text-sm">
                  {cart.length} item{cart.length !== 1 ? 's' : ''} in cart
                </div>
              </div>
              <button
                onClick={handleViewCart}
                disabled={cart.length === 0}
                className="bg-sangeet-400 text-sangeet-neutral-950 px-4 py-2 rounded-lg font-semibold hover:bg-sangeet-300 transition-colors disabled:opacity-50 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <span>🛒</span>
                <span>View Cart</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Top Padding for Fixed Header */}
      <div className="max-w-4xl mx-auto p-4 pt-24">
        
        {/* Category Filter - Enhanced */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-sangeet-400 mb-3 flex items-center">
            <span className="mr-2">📋</span>
            Menu Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-sangeet-400 text-sangeet-neutral-950 shadow-lg'
                  : 'bg-sangeet-neutral-800 text-sangeet-neutral-400 hover:bg-sangeet-neutral-700'
              }`}
            >
              All Items
            </button>
            {categories.map((category) => (
              <button
                key={category.id || category.name}
                onClick={() => setSelectedCategory(category.name || category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === (category.name || category)
                    ? 'bg-sangeet-400 text-sangeet-neutral-950 shadow-lg'
                    : 'bg-sangeet-neutral-800 text-sangeet-neutral-400 hover:bg-sangeet-neutral-700'
                }`}
              >
                {category.name || category}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items - Enhanced Grid with Consistent Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
          {filteredMenuItems.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-xl overflow-hidden border border-sangeet-neutral-700 hover:border-sangeet-neutral-600 transition-all flex flex-col h-full"
            >
              {/* Image Section - Fixed Height */}
              <div className="h-48 md:h-52 overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Content Section - Flex Column with Space Between */}
              <div className="p-4 md:p-5 flex flex-col flex-grow">
                {/* Header with Name and Price */}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base md:text-lg font-semibold text-sangeet-400 flex-1 mr-2">{item.name}</h3>
                  <span className="text-sangeet-400 font-bold text-lg whitespace-nowrap">${item.price}</span>
                </div>
                
                {/* Description - Fixed Height */}
                <p className="text-sm text-sangeet-neutral-400 mb-3 line-clamp-2 min-h-[2.5rem]">{item.description}</p>
                
                {/* Tags Section - Fixed Height */}
                <div className="flex flex-wrap gap-1 mb-4 min-h-[1.5rem]">
                  {item.is_vegetarian && (
                    <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">🌱 Veg</span>
                  )}
                  {item.is_spicy && (
                    <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">🔥 Spicy</span>
                  )}
                  {item.is_popular && (
                    <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full">⭐ Popular</span>
                  )}
                </div>
                
                {/* Button Section - Always at Bottom */}
                <div className="mt-auto">
                  <button
                    onClick={() => addToCart(item)}
                    className="w-full bg-sangeet-400 text-sangeet-neutral-950 py-2 md:py-3 rounded-lg font-semibold hover:bg-sangeet-300 transition-colors shadow-lg hover:shadow-xl text-sm md:text-base"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QRMenuPage; 