"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { fetchMenuItems, fetchMenuCategories, getOrdersByTable, getTableByNumber } from '../../services/api';
import { pusherClient as socketService } from '@/lib/services/pusherClient';
import toast from 'react-hot-toast';

import { ORDER_STATUSES } from './constants';
import { useTableSession } from './hooks/useTableSession';
import { useOrderFlow } from './hooks/useOrderFlow';

import CartView from '../../components/CartView';
import TrackingView from '../../components/TrackingView';
import MenuView from '../../components/MenuView';
import { ChefHat, ShoppingBag, ListOrdered, ChevronLeft, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const UnifiedDashboard = () => {
  const tableSession = useTableSession();
  const {
    tableNumber,
    customerName,
    orderId,
    orderNumber,
    totalAmount,
    orders,
    tableInfo,
    setTableInfo,
    hasCancelledOrder,
    setOrders,
    setOrderId,
    setOrderNumber,
    setTotalAmount,
    setCustomerName,
    setOrderItems,
    clearSession,
    CANCELLED_ORDER_TIMEOUT
  } = tableSession;

  const orderFlow = useOrderFlow(tableSession);
  const { cart, addToCart, removeFromCart, updateQuantity, getCartTotal, handlePlaceOrder, loading: orderLoading } = orderFlow;

  const [currentView, setCurrentView] = useState(() => {
    if (orderId || orderNumber) return 'tracking';
    try {
      const savedCart = localStorage.getItem(`cart_${tableNumber}`);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (parsedCart && parsedCart.length > 0) return 'cart';
      }
    } catch (e) {}
    return 'menu';
  });

  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [manualMenuNavigation, setManualMenuNavigation] = useState(false);
  const [forceMenuView, setForceMenuView] = useState(false);

  const checkCancelledOrderTimeout = useCallback(() => {
    try {
      const cancelledOrderData = localStorage.getItem(`cancelledOrder_${tableNumber}`);
      if (cancelledOrderData) {
        const cancelledOrder = JSON.parse(cancelledOrderData);
        const timeSinceCancellation = Date.now() - cancelledOrder.timestamp;
        
        if (timeSinceCancellation > CANCELLED_ORDER_TIMEOUT) {
          clearSession();
          setCurrentView('menu');
          toast.success('Fresh start! Ready for new order 🍽️', { duration: 4000, icon: '🔄' });
          return 'fresh_start';
        }
      }
    } catch (error) {}
    return 'normal_flow';
  }, [tableNumber, clearSession, CANCELLED_ORDER_TIMEOUT]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const timeoutResult = checkCancelledOrderTimeout();
      if (timeoutResult === 'fresh_start') {
        setLoading(false);
        return;
      }
      
      const [menuData, categoriesData] = await Promise.all([
        fetchMenuItems(),
        fetchMenuCategories()
      ]);
      setMenuItems(menuData || []);
      setCategories(categoriesData || []);

      if (tableNumber) {
        try {
          const [activeOrders, tableData] = await Promise.all([
            getOrdersByTable(tableNumber as string),
            getTableByNumber(tableNumber as string).catch(e => {
              console.error("Failed to fetch table info:", e);
              return null;
            })
          ]);
          if (activeOrders) {
            setOrders(activeOrders);
          } else {
            setOrders([]);
          }
          if (tableData) {
            setTableInfo(tableData);
          }
        } catch (e) {
          console.error("Error fetching active orders or table info", e);
        }
      }
    } catch (error) {
      console.error('Error loading menu:', error);
    } finally {
      setLoading(false);
    }
  }, [checkCancelledOrderTimeout, tableNumber, setOrders, setTableInfo]);

  const setupRealTimeUpdates = useCallback(() => {
    socketService.connect();
    socketService.joinTable(tableNumber as string);

    // Clean up any existing listeners to prevent duplicates
    socketService.removeListener('order-status-update');
    socketService.removeListener('new-order');
    socketService.removeListener('order-deleted');

    socketService.onOrderStatusUpdate((updateData: any) => {
      setOrders(prevOrders => {
        const updatedOrders = prevOrders.map(order => {
          if (String(order.id) === String(updateData.orderId)) {
            return { ...order, status: updateData.status, updated_at: updateData.timestamp };
          }
          return order;
        });
        
        if (updateData.status === 'completed') {
          const hasActiveOrders = updatedOrders.some(order => 
            order.status !== 'completed' && order.status !== 'cancelled'
          );
          
          if (!hasActiveOrders) {
            clearSession();
            setCurrentView('menu');
            toast.success('🎉 All orders completed! Thank you for dining with us! Redirecting to home page...', { duration: 5000, icon: '🏠' });
            setTimeout(() => { window.location.href = '/'; }, 2500);
          } else {
            toast.success(`🎉 Order #${updateData.orderId} completed!`, { duration: 4000 });
          }
          try { socketService.playNotificationSound('completion'); } catch (e) {}
        }
        
        if (updateData.status === 'cancelled') {
          const cancelledOrderData = {
            orderId: updateData.orderId,
            timestamp: Date.now(),
            tableNumber: tableNumber
          };
          localStorage.setItem(`cancelledOrder_${tableNumber}`, JSON.stringify(cancelledOrderData));
          toast.error('Order cancelled. Auto-redirecting to home in 2 minutes.', { duration: 6000, icon: '❌' });
          setTimeout(() => {
            // Check if they placed a new order (which clears this flag) before kicking them out
            const stillCancelled = localStorage.getItem(`cancelledOrder_${tableNumber}`);
            if (stillCancelled) {
              clearSession();
              toast.success('Redirecting to home page for fresh start! 🏠', { duration: 3000, icon: '🔄' });
              setTimeout(() => { window.location.href = '/'; }, 1000);
            }
          }, CANCELLED_ORDER_TIMEOUT);
        }
        return updatedOrders;
      });

      const statusConfig = (ORDER_STATUSES as any)[updateData.status];
      // Only play the generic notification sound if it's NOT completed (since completed plays its own sound above)
      if (statusConfig && updateData.status !== 'completed') {
        toast.success(`Order ${statusConfig.label.toLowerCase()}!`, { duration: 4000, icon: statusConfig.icon });
        try { socketService.playNotificationSound('notification'); } catch (error) {}
      }
    });

    socketService.onNewOrder((orderData: any) => {
      if (orderData.table_number === tableNumber) {
        setOrders(prevOrders => {
          const orderExists = prevOrders.some(order => order.id === orderData.id);
          if (orderExists) return prevOrders;
          return [...prevOrders, orderData];
        });
        toast.success('New order placed!', { duration: 3000 });
      }
    });

    socketService.onOrderDeleted((data: any) => {
      if (data.tableNumber && tableNumber && data.tableNumber.toString() === tableNumber.toString()) {
        setOrders(prevOrders => prevOrders.filter(order => order.id !== data.orderId));
        if (data.orderId && orderId && data.orderId.toString() === orderId.toString()) {
          clearSession();
          toast.success('Order has been cancelled. Please scan QR code again for fresh start! 🍽️');
          setTimeout(() => { window.location.href = '/'; }, 2000);
        } else {
          toast.success(`Order #${data.orderId} has been cancelled`, { duration: 3000, icon: '🗑️' });
        }
      }
    });
    socketService.onItemCancelled((data: any) => {
      if (data.tableNumber && tableNumber && data.tableNumber.toString() === tableNumber.toString()) {
        setOrders(prevOrders => prevOrders.map(order => {
          if (order.id !== data.orderId) return order;
          return {
            ...order,
            items: order.items.map((item: any) => 
              item.id === data.itemId ? { ...item, status: 'cancelled' } : item
            )
          };
        }));
        toast.error('An item in your order was unavailable and has been cancelled/refunded.', { duration: 5000, icon: '⚠️' });
        try { socketService.playNotificationSound('notification'); } catch (e) {}
      }
    });
    
    return () => {
      socketService.removeListener('order-status-update');
      socketService.removeListener('new-order');
      socketService.removeListener('order-deleted');
      socketService.removeListener('item-cancelled');
    };
  }, [tableNumber, orderId, setOrders, clearSession, CANCELLED_ORDER_TIMEOUT]);

  useEffect(() => {
    let cleanup: any = null;
    if (tableNumber) {
      loadDashboardData();
      cleanup = setupRealTimeUpdates();
    }
    return () => {
      if (cleanup) cleanup();
    };
  }, [tableNumber, loadDashboardData, setupRealTimeUpdates]);

  useEffect(() => {
    if (forceMenuView) return;
    if (orders.length > 0 && currentView === 'menu' && !manualMenuNavigation) {
      setCurrentView('tracking');
      const firstOrder = orders[0];
      setOrderId(firstOrder.id);
      setOrderNumber(firstOrder.order_number);
      setTotalAmount(firstOrder.total_amount);
    }
  }, [orders, currentView, manualMenuNavigation, forceMenuView, setOrderId, setOrderNumber, setTotalAmount]);

  const formatTime = (dateString: string | Date | undefined) => dateString ? new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '';
  const formatDate = (dateString: string | Date | undefined) => dateString ? new Date(dateString).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';
  const getStatusStep = (status: string) => {
    const statusOrder = ['pending', 'preparing', 'ready', 'completed'];
    if (status === 'cancelled') return 0;
    return statusOrder.indexOf(status) + 1;
  };

  return (
    <div className="min-h-screen bg-[#131210] selection:bg-sangeet-400 selection:text-[#131210]">
      {/* Liquid Glass Header */}
      <div className="bg-[#1C1917]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 shadow-glass">
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-inner">
                <ChefHat className="w-6 h-6 text-sangeet-400" />
              </div>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">Sangeet Restaurant</h1>
                <p className="text-sangeet-400 text-sm md:text-base font-medium">
                  Table {tableNumber} {customerName ? `• ${customerName}` : ''}
                  {orderId && ` • Order #${orderNumber || orderId}`}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {!hasCancelledOrder && currentView !== 'menu' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setForceMenuView(true);
                    setManualMenuNavigation(true);
                    setCurrentView('menu');
                  }}
                  className="px-5 py-2.5 font-semibold rounded-xl bg-sangeet-400 text-[#131210] hover:bg-sangeet-300 transition-all duration-300 shadow-gold-glow flex items-center whitespace-nowrap"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Continue Ordering
                </button>
              )}
              {currentView !== 'tracking' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentView('tracking');
                  }}
                  className="px-5 py-2.5 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 shadow-glass flex items-center whitespace-nowrap"
                >
                  <ListOrdered className="w-4 h-4 mr-2 text-sangeet-400" />
                  Track Order
                </button>
              )}
              {currentView === 'menu' && cart.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentView('cart');
                  }}
                  className="px-5 py-2.5 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 shadow-glass flex items-center space-x-2 whitespace-nowrap"
                >
                  <ShoppingBag className="w-4 h-4 text-sangeet-400" />
                  <span>Cart ({cart.length} items - ${getCartTotal().toFixed(2)})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>



      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Global Loading Spinner */}
        {loading && (
          <div className="text-center py-32 px-4 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-glass max-w-lg mx-auto mt-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sangeet-400 mx-auto mb-6"></div>
            <h3 className="font-display text-2xl font-semibold text-sangeet-400 mb-3">Loading...</h3>
            <p className="text-sangeet-neutral-400 text-base">Setting up your dining experience</p>
          </div>
        )}

        {!loading && (
        <AnimatePresence mode="wait">
          {currentView === 'menu' && (
            <>
              {menuItems.length === 0 ? (
                <div className="text-center py-32 px-4 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-glass max-w-lg mx-auto mt-20">
                  <div className="text-6xl mb-6">🍽️</div>
                  <h3 className="font-display text-3xl font-semibold text-sangeet-400 mb-3">No Menu Items</h3>
                  <p className="text-sangeet-neutral-400 text-lg">The menu is being updated. Please check back soon!</p>
                </div>
              ) : (
                <div className="w-full">
                  {/* Liquid Glass Hero Header for Menu */}
                  <div className="relative h-[40vh] min-h-[300px] w-full overflow-hidden flex items-center justify-center rounded-3xl mb-8">
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
                      <h1 className="font-display text-4xl md:text-6xl text-white font-bold mb-4 tracking-tight drop-shadow-2xl">
                        Sangeet <span className="text-sangeet-400 italic font-light">Menu</span>
                      </h1>
                      <div className="inline-flex items-center space-x-2 bg-sangeet-400/10 backdrop-blur-md border border-sangeet-400/20 px-6 py-2 rounded-full">
                        <Sparkles className="w-4 h-4 text-sangeet-400" />
                        <p className="text-sangeet-400 font-medium tracking-wide">
                          Continue your culinary journey
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Liquid Glass Menu Component */}
                  <div className="max-w-5xl mx-auto -mt-16 relative z-20 pb-24">
                    <MenuView 
                      menuItems={menuItems}
                      categories={categories}
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      onAddToCart={addToCart}
                      onViewCart={() => setCurrentView('cart')}
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
                            onClick={() => setCurrentView('cart')}
                            className="w-full bg-[#1C1917]/90 backdrop-blur-xl border border-white/10 text-white p-4 rounded-2xl shadow-[0_0_30px_rgba(212,175,55,0.15)] hover:shadow-[0_0_40px_rgba(212,175,55,0.25)] transition-all duration-300 flex items-center justify-between group overflow-hidden relative cursor-pointer"
                          >
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
                                ${getCartTotal().toFixed(2)}
                              </p>
                            </div>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
              onPlaceOrder={() => handlePlaceOrder(setCurrentView)}
              onContinueOrdering={() => setCurrentView('menu')}
              getCartTotal={getCartTotal}
              loading={orderLoading || loading}
            />
          )}

          {currentView === 'tracking' && (
            <TrackingView 
              key="tracking"
              orders={orders}
              orderStatuses={ORDER_STATUSES}
              getStatusStep={getStatusStep}
              formatTime={formatTime}
              formatDate={formatDate}
              customerName={customerName}
              tableNumber={tableNumber}
            />
          )}
        </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default UnifiedDashboard;
