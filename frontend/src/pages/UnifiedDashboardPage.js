import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { getOrdersByTable, createOrder, fetchMenuItems, fetchMenuCategories, getOrderById } from '../services/api';
import socketService from '../services/socketService';
import toast from 'react-hot-toast';

import MenuView from '../components/MenuView';
import CartView from '../components/CartView';
import TrackingView from '../components/TrackingView';

const UnifiedDashboardPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  
  // URL parameters
  const initialOrderId = searchParams.get('orderId');
  const tableNumber = searchParams.get('table');
  const initialOrderNumber = searchParams.get('orderNumber');
  const initialTotalAmount = searchParams.get('totalAmount');
  
  // Customer name will be fetched from order data instead of URL
  const [customerName, setCustomerName] = useState(null);

  // State management
  const [currentView, setCurrentView] = useState(() => {
    // Determine initial view based on URL parameters and session data
    if (initialOrderId || initialOrderNumber) {
      return 'tracking';
    }
    
    // Check if there's cart data in localStorage
    try {
      const savedCart = localStorage.getItem(`cart_${tableNumber}`);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (parsedCart && parsedCart.length > 0) {
          return 'cart';
        }
      }
    } catch (error) {
      console.error('Error checking saved cart:', error);
    }
    
    return 'menu';
  }); // tracking, menu, cart
  const [orderId, setOrderId] = useState(initialOrderId);
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [totalAmount, setTotalAmount] = useState(initialTotalAmount);
  const [orderItems, setOrderItems] = useState([]); // Current order items
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [manualMenuNavigation, setManualMenuNavigation] = useState(false);
  const [forceMenuView, setForceMenuView] = useState(false);

  // Order status configuration
  const orderStatuses = useMemo(() => ({
    'pending': {
      label: 'Order Received',
      description: 'Your order has been received and is being processed',
      icon: '📋',
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      borderColor: 'border-blue-400/30'
    },
    'preparing': {
      label: 'Preparing',
      description: 'Our kitchen is preparing your delicious meal',
      icon: '👨‍🍳',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      borderColor: 'border-yellow-400/30'
    },
    'ready': {
      label: 'Ready for Pickup',
      description: 'Your order is ready! Please collect from the counter',
      icon: '✅',
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      borderColor: 'border-green-400/30'
    },
    'completed': {
      label: 'Completed',
      description: 'Thank you for dining with us!',
      icon: '🎉',
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
      borderColor: 'border-purple-400/30'
    },
    'cancelled': {
      label: 'Order Cancelled',
      description: 'Your order has been cancelled by the restaurant',
      icon: '❌',
      color: 'text-red-400',
      bgColor: 'bg-red-400/10',
      borderColor: 'border-red-400/30'
    }
  }), []);



  // Constants
  const CANCELLED_ORDER_TIMEOUT = 2 * 60 * 1000; // 2 minutes

  // Check if any order is cancelled (real-time)
  const hasCancelledOrder = useMemo(() => {
    return orders.some(order => order.status === 'cancelled');
  }, [orders]);

      // Check for cancelled order timeout on page load
    const checkCancelledOrderTimeout = useCallback(() => {
    
    try {
      const cancelledOrderData = localStorage.getItem(`cancelledOrder_${tableNumber}`);
      if (cancelledOrderData) {
        const cancelledOrder = JSON.parse(cancelledOrderData);
        const timeSinceCancellation = Date.now() - cancelledOrder.timestamp;
        
        if (timeSinceCancellation > CANCELLED_ORDER_TIMEOUT) {
          // Clear cancelled order data after timeout
          localStorage.removeItem(`cancelledOrder_${tableNumber}`);
          localStorage.removeItem(`cart_${tableNumber}`);
          localStorage.removeItem(`orderId_${tableNumber}`);
          localStorage.removeItem(`orderNumber_${tableNumber}`);
          localStorage.removeItem(`customerName_${tableNumber}`);
          localStorage.removeItem(`session_timestamp_${tableNumber}`);
          
          // Reset state
          setCart([]);
          setOrderId(null);
          setOrderNumber(null);
          setCustomerName(null);
          setOrderItems([]);

          setCurrentView('menu');
          
          toast.success('Fresh start! Ready for new order 🍽️', {
            duration: 4000,
            icon: '🔄'
          });
          
          return 'fresh_start';
        }
      }
    } catch (error) {
      console.error('Error checking cancelled order timeout:', error);
    }
    return 'normal_flow';
  }, [tableNumber]);

  // Load all dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check for cancelled order timeout first
      const timeoutResult = checkCancelledOrderTimeout();
      if (timeoutResult === 'fresh_start') {
        // Fresh start - no need to load old data
        setLoading(false);
        return;
      }
      
      // Check for session timeout (4 hours)
      const checkSessionTimeout = () => {
        try {
          const sessionTimestamp = localStorage.getItem(`session_timestamp_${tableNumber}`);
          if (sessionTimestamp) {
            const sessionTime = new Date(sessionTimestamp).getTime();
            const currentTime = new Date().getTime();
            const hoursDiff = (currentTime - sessionTime) / (1000 * 60 * 60);
            
            if (hoursDiff > 4) {
              // Session expired, clear all data
              localStorage.removeItem(`cart_${tableNumber}`);
              localStorage.removeItem(`customer_${tableNumber}`);
              localStorage.removeItem(`instructions_${tableNumber}`);
              localStorage.removeItem(`session_timestamp_${tableNumber}`);
              console.log('⏰ Session expired, cleared old data');
              return false;
            }
          }
          return true;
        } catch (error) {
          console.error('Error checking session timeout:', error);
          return true;
        }
      };
      
      // Restore session data from localStorage if available
      const restoreSessionData = () => {
        try {
          const savedCart = localStorage.getItem(`cart_${tableNumber}`);
          const savedCustomer = localStorage.getItem(`customer_${tableNumber}`);
          const savedInstructions = localStorage.getItem(`instructions_${tableNumber}`);
          
          if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            setCart(parsedCart);
          }
          
          if (savedCustomer) {
            const parsedCustomer = JSON.parse(savedCustomer);
            // Update URL with customer name if not already present
            if (!customerName && parsedCustomer.name) {
              const newUrl = new URL(window.location);
              newUrl.searchParams.set('customerName', parsedCustomer.name);
              navigate(newUrl.pathname + newUrl.search, { replace: true });
            }
          }
          
          if (savedInstructions) {
            // Instructions restored silently
          }
          
          return true;
        } catch (error) {
          console.error('❌ Error restoring session data:', error);
          return false;
        }
      };
      
      // Check session timeout first
      const sessionValid = checkSessionTimeout();
      
      // Restore session data only if session is valid
      const sessionRestored = sessionValid ? restoreSessionData() : false;
      
      // Load orders for this table
      const tableOrders = await getOrdersByTable(tableNumber);
      
      // Show welcome back message if session was restored
      if (sessionRestored) {
        const savedCart = localStorage.getItem(`cart_${tableNumber}`);
        const savedCustomer = localStorage.getItem(`customer_${tableNumber}`);
        
        if (savedCart || savedCustomer) {
          // Check if there are active orders to show appropriate message
          if (uniqueOrders.length > 0) {
            toast.success('Welcome back! Your active order is being tracked. 🍽️', {
              duration: 4000,
              icon: '📱'
            });
          } else {
            toast.success('Welcome back! Your session has been restored. 🍽️', {
              duration: 4000,
              icon: '🔄'
            });
          }
        }
      }
      
      const activeOrders = tableOrders.filter(order => 
        order.status !== 'completed' && order.status !== 'cancelled'
      );
      

      
      // Remove duplicates based on order ID
      const uniqueOrders = activeOrders.reduce((acc, order) => {
        const existingOrder = acc.find(o => o.id === order.id);
        if (existingOrder) {
          return acc;
        }
        return [...acc, order];
      }, []);
      setOrders(uniqueOrders);

      // Smart view selection: If there are active orders, prioritize tracking view
      if (uniqueOrders.length > 0 && currentView === 'menu') {
        setCurrentView('tracking');
        
        // Set the first active order as the current order
        const firstOrder = uniqueOrders[0];
        setOrderId(firstOrder.id);
        setOrderNumber(firstOrder.order_number);
        setTotalAmount(firstOrder.total_amount);
        
        // Extract customer name from order data
        if (firstOrder.customer_name) {
          setCustomerName(firstOrder.customer_name);
        }
        
        // Load order items for the first order
        try {
          const orderDetails = await getOrderById(firstOrder.id);
          if (orderDetails && orderDetails.items) {
            setOrderItems(orderDetails.items);
          }
        } catch (error) {
          console.error('Error loading order items:', error);
        }
      } else if (orderId) {
      // If we have an orderId, load the specific order items
        try {
          const orderDetails = await getOrderById(orderId);
          if (orderDetails && orderDetails.items) {
            setOrderItems(orderDetails.items);
          }
          
          // Extract customer name from order details
          if (orderDetails && orderDetails.customer_name) {
            setCustomerName(orderDetails.customer_name);
          }
        } catch (error) {
          console.error('Error loading order items:', error);
        }
      }

      // Load menu items and categories
      const [menuData, categoriesData] = await Promise.all([
        fetchMenuItems(),
        fetchMenuCategories()
      ]);
      
      setMenuItems(menuData || []);
      setCategories(categoriesData || []);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [tableNumber, orderId]);

  // Setup real-time updates
  const setupRealTimeUpdates = useCallback(() => {
    socketService.connect();
    socketService.joinTable(tableNumber);

    // Listen for order status updates
    socketService.onOrderStatusUpdate((updateData) => {
      setOrders(prevOrders => {
        const updatedOrders = prevOrders.map(order => {
          // Convert both to strings for comparison to handle type mismatches
          if (order.id.toString() === updateData.orderId.toString()) {
            return { ...order, status: updateData.status, updated_at: updateData.timestamp };
          }
          return order;
        });
        
        // Check if the updated order is now completed
        if (updateData.status === 'completed') {
          // Check if there are any other active orders
          const hasActiveOrders = updatedOrders.some(order => 
            order.status !== 'completed' && order.status !== 'cancelled'
          );
          
          if (!hasActiveOrders) {
            
            
            // Clear all customer data
            localStorage.removeItem(`cart_${tableNumber}`);
            localStorage.removeItem(`orderId_${tableNumber}`);
            localStorage.removeItem(`orderNumber_${tableNumber}`);
            localStorage.removeItem(`customerName_${tableNumber}`);
            localStorage.removeItem(`session_timestamp_${tableNumber}`);
            
            // Clear state
            setCart([]);
            setOrderId(null);
            setOrderNumber(null);
            setCustomerName(null);
            setOrderItems([]);
            setCurrentView('menu');
            
            // Show completion message
            toast.success('🎉 All orders completed! Thank you for dining with us!', {
              duration: 6000
            });
            
            // Redirect to home page
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
          }
        }
        
        // Check if the updated order is now cancelled
        if (updateData.status === 'cancelled') {
          // Store cancelled order timestamp for timeout management
          const cancelledOrderData = {
            orderId: updateData.orderId,
            timestamp: Date.now(),
            tableNumber: tableNumber
          };
          localStorage.setItem(`cancelledOrder_${tableNumber}`, JSON.stringify(cancelledOrderData));
          

          
          // Keep the order in tracking view to show cancelled status
          // Don't clear state or redirect immediately
          
          // Show cancellation message
          toast.error('Order cancelled. You can wait for fresh start or use the button below.', {
            duration: 6000,
            icon: '❌'
          });
          
          // The 5-minute timeout will handle the fresh start automatically
          // Customer can see cancelled status and choose to wait or reset manually
        }
        
        return updatedOrders;
      });

      // Show notification
      const statusConfig = orderStatuses[updateData.status];
      if (statusConfig) {
        toast.success(`Order ${statusConfig.label.toLowerCase()}!`, {
          duration: 4000,
          icon: statusConfig.icon
        });
        
        // Play notification sound
        try {
        socketService.playNotificationSound('notification');
        } catch (error) {
  
        }
        
        // Show browser notification if available
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`Order ${statusConfig.label}`, {
            body: `Your order status has been updated to: ${statusConfig.label}`,
            icon: '/logo192.png'
          });
        }
      }
    });

    // Listen for new orders
    socketService.onNewOrder((orderData) => {
      if (orderData.table_number === tableNumber) {
        setOrders(prevOrders => {
          // Check if order already exists to prevent duplication
          const orderExists = prevOrders.some(order => order.id === orderData.id);
          if (orderExists) {
            return prevOrders;
          }
          return [...prevOrders, orderData];
        });
        toast.success('New order placed!', { duration: 3000 });
      }
    });

    // Listen for order completion
    socketService.onOrderCompleted((data) => {
      setOrders(prevOrders => {
        const updatedOrders = prevOrders.filter(order => order.id !== data.orderId);
        
        // If no more active orders, clear customer data and redirect
        if (updatedOrders.length === 0) {
          
          // Clear all customer data
          localStorage.removeItem(`cart_${tableNumber}`);
          localStorage.removeItem(`orderId_${tableNumber}`);
          localStorage.removeItem(`orderNumber_${tableNumber}`);
          localStorage.removeItem(`customerName_${tableNumber}`);
          localStorage.removeItem(`session_timestamp_${tableNumber}`);
          
          // Clear state
          setCart([]);
          setOrderId(null);
          setOrderNumber(null);
          setCustomerName(null);
          setOrderItems([]);
          setCurrentView('menu');
          
          // Show completion message
          toast.success('🎉 All orders completed! Thank you for dining with us!', {
        duration: 6000
          });
          
          // Redirect to home page
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else {
          // Show completion message for this specific order
          toast.success(`🎉 Order #${data.orderId} completed!`, {
            duration: 4000
          });
        }
        
        return updatedOrders;
      });
      
      socketService.playNotificationSound('completion');
    });
  }, [tableNumber, orderStatuses]);

  // Load order items when orderId changes
  useEffect(() => {
    if (orderId) {
      const loadOrderItems = async () => {
        try {
          const orderDetails = await getOrderById(orderId);
          if (orderDetails && orderDetails.items) {
            setOrderItems(orderDetails.items);
          }
        } catch (error) {
          console.error('Error loading order items:', error);
        }
      };
      loadOrderItems();
      
      // Join customer room for this specific order
      socketService.joinCustomer(orderId);
    }
  }, [orderId]);

  // Update session timestamp
  const updateSessionTimestamp = () => {
    try {
      localStorage.setItem(`session_timestamp_${tableNumber}`, new Date().toISOString());
    } catch (error) {
      console.error('Error updating session timestamp:', error);
    }
  };

  // Cart functions
  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
    updateSessionTimestamp();
    toast.success(`${item.name} added to cart!`);
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    updateSessionTimestamp();
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
      updateSessionTimestamp();
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };





  // Place order function
  const handlePlaceOrder = async () => {
    
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      setLoading(true);
      
      const orderData = {
        table_id: tableNumber,
        customer_name: customerName,
        items: cart.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          special_requests: item.specialRequests || ''
        }))
      };
      


      const response = await createOrder(orderData);
      const newOrder = response.order;
      const isMerged = response.merged;
      

      
      // Save cart items before clearing cart
      const currentCartItems = [...cart]; // Create a copy of current cart
      
      // Update state
      setOrderId(newOrder.id);
      setOrderNumber(newOrder.order_number);
      setTotalAmount(newOrder.total_amount);
      setOrderItems(currentCartItems); // Save cart items as order items
      
      setOrders(prevOrders => {
        if (isMerged) {
          // If merged, update the existing order instead of adding new one
          return prevOrders.map(order => 
            order.id === newOrder.id ? newOrder : order
          );
        } else {
          // If new order, add it to the list
        const orderExists = prevOrders.some(order => order.id === newOrder.id);
        if (orderExists) {
          return prevOrders;
        }
        return [...prevOrders, newOrder];
        }
      });
      setCart([]); // Clear cart after saving items
      
      // Always go directly to tracking page after placing order
      setCurrentView('tracking');
      
      // Show appropriate message based on merge status
      if (isMerged) {
        toast.success('Items added to your existing order! 🍽️', {
          duration: 4000,
          icon: '➕'
        });
      } else {
        toast.success('Order placed successfully! 🎉', {
          duration: 4000,
          icon: '✅'
        });
      }
      
      // Show QR return tip after a short delay
      setTimeout(() => {
        toast.success('📱 You can close this page and scan QR code later!', {
          duration: 5000,
          icon: '💡'
        });
      }, 2000);
      
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  // Helper functions
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusStep = (status) => {
    const statusOrder = ['pending', 'preparing', 'ready', 'completed'];
    if (status === 'cancelled') {
      return 0; // Special case for cancelled orders
    }
    return statusOrder.indexOf(status) + 1;
  };

  // Initialize dashboard
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (tableNumber) {
      // Clear existing orders when table changes to prevent mixing orders from different tables
      setOrders([]);
      // Don't clear orderItems here - they should persist for the current order
      loadDashboardData();
      setupRealTimeUpdates();
    }
  }, [tableNumber]); // Remove loadDashboardData and setupRealTimeUpdates from dependencies

  // Effect to handle view changes when orders are loaded
  useEffect(() => {
    
    // If forceMenuView is true, don't switch to tracking
    if (forceMenuView) {
      return;
    }
    
            // If we have active orders and we're on menu view, switch to tracking
        // BUT only if it's not a manual navigation to menu
        if (orders.length > 0 && currentView === 'menu' && !manualMenuNavigation) {
          setCurrentView('tracking');
          
          // Set the first active order as current
          const firstOrder = orders[0];
          setOrderId(firstOrder.id);
          setOrderNumber(firstOrder.order_number);
          setTotalAmount(firstOrder.total_amount);
        }
        
        // Reset flags after a delay
        if (currentView === 'menu' && manualMenuNavigation) {
          setTimeout(() => {
            setManualMenuNavigation(false);
            setForceMenuView(false);
          }, 10000); // 10 seconds to allow user interaction
        }
  }, [orders, currentView, manualMenuNavigation, forceMenuView]);

  // Effect to ensure menu items are loaded
  useEffect(() => {
    if (menuItems.length === 0 && !loading) {
      // Load menu items if they're not already loaded
      const loadMenuData = async () => {
        try {
          const [menuData, categoriesData] = await Promise.all([
            fetchMenuItems(),
            fetchMenuCategories()
          ]);
          setMenuItems(menuData || []);
          setCategories(categoriesData || []);
        } catch (error) {
          console.error('Error loading menu data:', error);
          toast.error('Failed to load menu items');
        }
      };
      loadMenuData();
    }
  }, [menuItems.length, loading]);



  // Socket connection and order deletion listener
  useEffect(() => {
    // Connect to socket service
    socketService.connect();
    
    // Join table room for order notifications
    if (tableNumber) {
      socketService.joinTable(tableNumber);
    }
    
    // Join customer room for specific order notifications
    if (orderId) {
      socketService.joinCustomer(orderId);
    }

    // Listen for order deletion events
    const handleOrderDeleted = (data) => {
      // Check if this deletion affects our table and specific order
      if (data.tableNumber && tableNumber && 
          data.tableNumber.toString() === tableNumber.toString() &&
          data.orderId && orderId && 
          data.orderId.toString() === orderId.toString()) {
        
        // Clear all customer data and state
        setCart([]);
        setOrderId(null);
        setOrderNumber(null);
        setTotalAmount(null);
        setOrderItems([]);
        
        // Clear localStorage data
        try {
          localStorage.removeItem(`cart_${tableNumber}`);
          localStorage.removeItem(`customer_${tableNumber}`);
          localStorage.removeItem(`instructions_${tableNumber}`);
        } catch (error) {
          console.error('❌ Error clearing localStorage:', error);
        }
        
        // Remove the deleted order from the orders list
        setOrders(prevOrders => {
          const filteredOrders = prevOrders.filter(order => order.id !== data.orderId);
          return filteredOrders;
        });
        
        // Auto-redirect to main website for complete fresh start
        toast.success('Order has been cancelled. Please scan QR code again for fresh start! 🍽️');
        
        // Redirect to main website after a short delay
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    };

    // Listen for order status updates
    const handleStatusUpdate = (updateData) => {
      // Check if this status update affects our table and specific order
      if (updateData.tableNumber && tableNumber && 
          updateData.tableNumber.toString() === tableNumber.toString() &&
          updateData.orderId && orderId && 
          updateData.orderId.toString() === orderId.toString()) {
        
        // Update the order status in our local state
        setOrders(prevOrders => {
          const updatedOrders = prevOrders.map(order => {
            const isSameOrder = order?.id?.toString() === updateData?.orderId?.toString();
            return isSameOrder
              ? { ...order, status: updateData.status, updated_at: updateData.timestamp }
              : order;
          });
          return updatedOrders;
        });
        
        // If status is changed to 'completed', clear customer data and redirect
        if (updateData.status === 'completed') {
          
          // Clear all customer data and state
          setCart([]);
          setOrderId(null);
          setOrderNumber(null);
          setTotalAmount(null);
          setOrderItems([]);
          
          // Clear localStorage data
          try {
            localStorage.removeItem(`cart_${tableNumber}`);
            localStorage.removeItem(`customer_${tableNumber}`);
            localStorage.removeItem(`instructions_${tableNumber}`);
          } catch (error) {
            console.error('❌ Error clearing localStorage:', error);
          }
          
          // Show success message and redirect to main website
          toast.success('Order completed! Thank you for dining with us. Please scan QR code again for fresh start! 🍽️');
          
          // Redirect to main website after a short delay
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
        }
      }
    };

    socketService.onOrderDeleted(handleOrderDeleted);
    socketService.onOrderStatusUpdate(handleStatusUpdate);

    // Cleanup function
    return () => {
      socketService.removeListener('order-deleted');
      socketService.removeListener('order-status-update');
    };
  }, [tableNumber, loadDashboardData]);



  return (
    <div className="min-h-screen bg-gradient-to-br from-sangeet-neutral-950 via-sangeet-neutral-900 to-sangeet-neutral-950">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-sangeet-neutral-900/80 to-sangeet-neutral-800/80 backdrop-blur-xl border-b border-sangeet-neutral-700/50 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Restaurant Info */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-sangeet-400 rounded-lg flex items-center justify-center">
                <span className="text-xl">🍽️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-sangeet-400">Sangeet Restaurant</h1>
                <p className="text-sangeet-neutral-400 text-sm">
                  Table {tableNumber} • {customerName}
                  {orderId && ` • Order #${orderNumber || orderId}`}
                </p>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center space-x-3">
              {!hasCancelledOrder && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Force menu view and prevent auto-switching
                    setForceMenuView(true);
                    setManualMenuNavigation(true);
                    setCurrentView('menu');
                    
                    // Show immediate feedback
                    toast.success('Switching to menu...', { duration: 1000 });
                    
                    // Load menu data if needed
                    if (menuItems.length === 0) {
                      toast.loading('Loading menu items...', { duration: 2000 });
                      
                      Promise.all([
                        fetchMenuItems(),
                        fetchMenuCategories()
                      ]).then(([menuData, categoriesData]) => {
                        setMenuItems(menuData || []);
                        setCategories(categoriesData || []);
                        toast.success('Menu ready!', { duration: 2000 });
                      }).catch(error => {
                        console.error('Error loading menu:', error);
                        toast.error('Failed to load menu');
                      });
                    }
                  }}
                  disabled={loading}
                  className={`px-4 py-2 font-semibold rounded-lg transition-colors duration-200 ${
                    loading 
                      ? 'bg-sangeet-neutral-600 text-sangeet-neutral-400 cursor-not-allowed'
                      : 'bg-sangeet-400 text-sangeet-neutral-950 hover:bg-sangeet-500'
                  }`}
                >
                  {loading ? 'Loading...' : 'Continue Ordering'}
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentView('tracking');
                }}
                className="px-4 py-2 bg-sangeet-neutral-700 text-sangeet-400 font-semibold rounded-lg hover:bg-sangeet-neutral-600 transition-colors duration-200"
              >
                Track Orders
              </button>


              {currentView === 'menu' && cart.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentView('cart');
                  }}
                  className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
                >
                  <span>🛒</span>
                  <span>Cart ({cart.length} items - ${getCartTotal().toFixed(2)})</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* QR Return Banner */}
      <div className="bg-blue-900/20 border-b border-blue-500/30">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center space-x-2 text-blue-300 text-sm">
            <span className="text-lg">📱</span>
            <span>QR Code Return: Scan anytime to track orders</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pt-36 sm:pt-6">

        
        {/* Dynamic Main View */}
        <AnimatePresence mode="wait">

          {currentView === 'menu' && (
            <>
              
              {menuItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🍽️</div>
                  <h3 className="text-xl font-semibold text-sangeet-400 mb-2">Loading Menu...</h3>
                  <p className="text-sangeet-neutral-400">Please wait while we load the menu items</p>
                  <button
                    onClick={() => {
                      toast.loading('Reloading menu...');
                      Promise.all([fetchMenuItems(), fetchMenuCategories()]).then(([menuData, categoriesData]) => {
                        setMenuItems(menuData || []);
                        setCategories(categoriesData || []);
                        toast.success('Menu reloaded!');
                      });
                    }}
                    className="mt-4 px-4 py-2 bg-sangeet-400 text-sangeet-neutral-950 rounded-lg hover:bg-sangeet-500 transition-colors"
                  >
                    Reload Menu
                  </button>
                </div>
                            ) : (
                <div className="h-screen flex flex-col">
                  {/* Fixed Header Controls */}
                  <div className="flex-shrink-0 bg-sangeet-neutral-950/98 backdrop-blur-md border-b-2 border-sangeet-400/30 shadow-lg">
                    {/* Category Filter - Mobile Optimized */}
                    <div className="p-4 pb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-sangeet-400 mb-2 sm:mb-3 flex items-center">
                        <span className="mr-2 text-sm sm:text-base">📋</span>
                        Menu Categories
                      </h3>
                      <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                        <button
                          onClick={() => setSelectedCategory('all')}
                          className={`px-3 py-2 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
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
                            className={`px-3 py-2 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
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

                    {/* Search Bar and Start Fresh Button - Mobile Optimized */}
                    <div className="px-4 pb-4">
                      <div className="flex gap-2 items-center">
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-sangeet-neutral-400 text-sm sm:text-base">🔍</span>
                          </div>
                          <input
                            type="text"
                            placeholder="Search dishes, ingredients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-10 sm:pr-4 py-2.5 sm:py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-lg text-sangeet-neutral-200 placeholder-sangeet-neutral-400 focus:outline-none focus:ring-2 focus:ring-sangeet-400 focus:border-transparent transition-all text-sm sm:text-base"
                          />
                          {searchTerm && (
                            <button
                              onClick={() => setSearchTerm('')}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sangeet-neutral-400 hover:text-sangeet-neutral-200 transition-colors"
                            >
                              <span className="text-lg">✕</span>
                            </button>
                          )}
                                                </div>
                        

                        </div>
                    </div>
                  </div>

                  {/* Scrollable Menu Content */}
                  <div className="flex-1 overflow-y-auto">

                  {/* Menu Items - Enhanced Grid with Consistent Layout */}
                  {(() => {
                    const filteredItems = menuItems.filter(item => {
                      // Category filter
                      if (selectedCategory !== 'all') {
                        const itemCategory = item.category_name || item.category;
                        const selectedCat = typeof selectedCategory === 'object' ? selectedCategory.name : selectedCategory;
                        if (itemCategory !== selectedCat) return false;
                      }
                      
                      // Search filter
                      if (searchTerm.trim()) {
                        const searchLower = searchTerm.toLowerCase();
                        const matchesName = item.name.toLowerCase().includes(searchLower);
                        const matchesDescription = item.description.toLowerCase().includes(searchLower);
                        const matchesCategory = (item.category_name || item.category || '').toLowerCase().includes(searchLower);
                        
                        return matchesName || matchesDescription || matchesCategory;
                      }
                      
                      return true;
                    });

                    if (filteredItems.length === 0) {
                      return (
                        <div className="text-center py-8 sm:py-12">
                          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🔍</div>
                          <h3 className="text-lg sm:text-xl font-semibold text-sangeet-400 mb-2">No items found</h3>
                          <p className="text-sangeet-neutral-400 mb-4 text-sm sm:text-base px-4">
                            {searchTerm.trim() 
                              ? `No items match "${searchTerm}". Try adjusting your search or category filter.`
                              : 'No items available in this category.'
                            }
                          </p>
                          {(searchTerm.trim() || selectedCategory !== 'all') && (
                            <button
                              onClick={() => {
                                setSearchTerm('');
                                setSelectedCategory('all');
                              }}
                              className="px-4 py-2 bg-sangeet-400 text-sangeet-neutral-950 rounded-lg hover:bg-sangeet-500 transition-colors text-sm sm:text-base"
                            >
                              Clear Filters
                            </button>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6">
                        {filteredItems.map((item) => (
                        <div
                          key={item.id}
                          className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-xl overflow-hidden border border-sangeet-neutral-700 hover:border-sangeet-neutral-600 transition-all flex flex-col h-full shadow-lg hover:shadow-xl"
                        >
                          {/* Image Section - Mobile Optimized */}
                          <div className="h-40 sm:h-48 lg:h-52 overflow-hidden">
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          {/* Content Section - Mobile Optimized */}
                          <div className="p-3 sm:p-4 lg:p-5 flex flex-col flex-grow">
                            {/* Header with Name and Price */}
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-sangeet-400 flex-1 mr-2 leading-tight">{item.name}</h3>
                              <span className="text-sangeet-400 font-bold text-base sm:text-lg whitespace-nowrap">${item.price}</span>
                            </div>
                            
                            {/* Description - Mobile Optimized */}
                            <p className="text-xs sm:text-sm text-sangeet-neutral-400 mb-2 sm:mb-3 line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] leading-relaxed">{item.description}</p>
                            
                            {/* Tags Section - Mobile Optimized */}
                            <div className="flex flex-wrap gap-1 mb-3 sm:mb-4 min-h-[1.25rem] sm:min-h-[1.5rem]">
                              {item.is_vegetarian && (
                                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-600 text-white text-xs rounded-full">🌱 Veg</span>
                              )}
                              {item.is_spicy && (
                                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red-600 text-white text-xs rounded-full">🔥 Spicy</span>
                              )}
                              {item.is_popular && (
                                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-yellow-600 text-white text-xs rounded-full">⭐ Popular</span>
                              )}
                            </div>
                            
                            {/* Button Section - Mobile Optimized */}
                            <div className="mt-auto">
                              <button
                                onClick={() => addToCart(item)}
                                className="w-full bg-sangeet-400 text-sangeet-neutral-950 py-2 sm:py-2.5 lg:py-3 rounded-lg font-semibold hover:bg-sangeet-300 transition-colors shadow-lg hover:shadow-xl text-xs sm:text-sm lg:text-base"
                              >
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      </div>
                    );
                  })()}
                  </div>
                </div>
              )}
            </>
          )}

          {currentView === 'cart' && (
            <CartView 
              key="cart"
              cart={cart}
              onUpdateQuantity={updateQuantity}
              onRemoveFromCart={removeFromCart}
              onPlaceOrder={handlePlaceOrder}
              onContinueOrdering={() => setCurrentView('menu')}
              getCartTotal={getCartTotal}
              loading={loading}
            />
          )}

          {currentView === 'tracking' && (
            <TrackingView 
              key="tracking"
              orders={orders}
              orderStatuses={orderStatuses}
              getStatusStep={getStatusStep}
              formatTime={formatTime}
              formatDate={formatDate}
              customerName={customerName}
              tableNumber={tableNumber}
            />
          )}
        </AnimatePresence>


      </div>
    </div>
  );
};

export default UnifiedDashboardPage;
