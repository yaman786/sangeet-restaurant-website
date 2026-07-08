"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { fetchMenuItems, fetchMenuCategories } from '../../services/api';
const socketService = { connect: () => {}, disconnect: () => {}, joinTable: () => {}, onOrderStatusUpdate: () => {}, onOrderCompleted: () => {}, emitNewOrder: () => {}, emitCallWaiter: () => {}, emitRequestBill: () => {}, removeListener: () => {} };
import toast from 'react-hot-toast';

import { ORDER_STATUSES } from './constants';
import { useTableSession } from './hooks/useTableSession';
import { useOrderFlow } from './hooks/useOrderFlow';

import CartView from '../../components/CartView';
import TrackingView from '../../components/TrackingView';
// The inline menu view code from UnifiedDashboardPage is kept here directly as per existing design

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
  const [loading, setLoading] = useState(false);
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
    } catch (error) {
      console.error('Error loading menu:', error);
    } finally {
      setLoading(false);
    }
  }, [checkCancelledOrderTimeout]);

  const setupRealTimeUpdates = useCallback(() => {
    socketService.connect();
    socketService.joinTable(tableNumber as string);

    socketService.onOrderStatusUpdate((updateData: any) => {
      setOrders(prevOrders => {
        const updatedOrders = prevOrders.map(order => {
          if (order.id.toString() === updateData.orderId.toString()) {
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
            toast.success('🎉 All orders completed! Thank you for dining with us!', { duration: 6000 });
            setTimeout(() => { window.location.href = '/'; }, 2000);
          }
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
            clearSession();
            toast.success('Redirecting to home page for fresh start! 🏠', { duration: 3000, icon: '🔄' });
            setTimeout(() => { window.location.href = '/'; }, 1000);
          }, CANCELLED_ORDER_TIMEOUT);
        }
        return updatedOrders;
      });

      const statusConfig = (ORDER_STATUSES as any)[updateData.status];
      if (statusConfig) {
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

    socketService.onOrderCompleted((data: any) => {
      setOrders(prevOrders => {
        const updatedOrders = prevOrders.filter(order => order.id !== data.orderId);
        if (updatedOrders.length === 0) {
          clearSession();
          setCurrentView('menu');
          toast.success('🎉 All orders completed! Thank you for dining with us!', { duration: 6000 });
          setTimeout(() => { window.location.href = '/'; }, 2000);
        } else {
          toast.success(`🎉 Order #${data.orderId} completed!`, { duration: 4000 });
        }
        return updatedOrders;
      });
      try { socketService.playNotificationSound('completion'); } catch (e) {}
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
  }, [tableNumber, orderId, setOrders, clearSession, CANCELLED_ORDER_TIMEOUT]);

  useEffect(() => {
    if (tableNumber) {
      loadDashboardData();
      setupRealTimeUpdates();
    }
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
    if (currentView === 'menu' && manualMenuNavigation) {
      setTimeout(() => {
        setManualMenuNavigation(false);
        setForceMenuView(false);
      }, 10000);
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
    <div className="min-h-screen bg-gradient-to-br from-sangeet-neutral-950 via-sangeet-neutral-900 to-sangeet-neutral-950">
      <div className="bg-gradient-to-r from-sangeet-neutral-900/80 to-sangeet-neutral-800/80 backdrop-blur-xl border-b border-sangeet-neutral-700/50 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-sangeet-400 rounded-lg flex items-center justify-center">
                <span className="text-xl">🍽️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-sangeet-400">Sangeet Restaurant</h1>
                <p className="text-sangeet-neutral-400 text-sm">
                  Table {tableNumber} {customerName ? `• ${customerName}` : ''}
                  {orderId && ` • Order #${orderNumber || orderId}`}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
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
                  className="px-4 py-2 font-semibold rounded-lg bg-sangeet-400 text-sangeet-neutral-950 hover:bg-sangeet-500 transition-colors duration-200"
                >
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
                  className="px-4 py-2 bg-sangeet-neutral-700 text-sangeet-400 font-semibold rounded-lg hover:bg-sangeet-neutral-600 transition-colors duration-200"
                >
                  Track Orders
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

      <div className="bg-blue-900/20 border-b border-blue-500/30">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center space-x-2 text-blue-300 text-sm">
            <span className="text-lg">📱</span>
            <span>QR Code Return: Scan anytime to track orders</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-36 sm:pt-6">
        <AnimatePresence mode="wait">
          {currentView === 'menu' && (
            <>
              {menuItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🍽️</div>
                  <h3 className="text-xl font-semibold text-sangeet-400 mb-2">Loading Menu...</h3>
                  <p className="text-sangeet-neutral-400">Please wait while we load the menu items</p>
                </div>
              ) : (
                <div className="h-screen flex flex-col">
                  <div className="flex-shrink-0 bg-sangeet-neutral-950/98 backdrop-blur-md border-b-2 border-sangeet-400/30 shadow-lg">
                    <div className="p-4 pb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-sangeet-400 mb-2 flex items-center">
                        <span className="mr-2 text-sm sm:text-base">📋</span> Menu Categories
                      </h3>
                      <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                          onClick={() => setSelectedCategory('all')}
                          className={`px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${selectedCategory === 'all' ? 'bg-sangeet-400 text-sangeet-neutral-950 shadow-lg' : 'bg-sangeet-neutral-800 text-sangeet-neutral-400 hover:bg-sangeet-neutral-700'}`}
                        >
                          All Items
                        </button>
                        {categories.map((category) => (
                          <button
                            key={category.id || category.name}
                            onClick={() => setSelectedCategory(category.name || category)}
                            className={`px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${selectedCategory === (category.name || category) ? 'bg-sangeet-400 text-sangeet-neutral-950 shadow-lg' : 'bg-sangeet-neutral-800 text-sangeet-neutral-400 hover:bg-sangeet-neutral-700'}`}
                          >
                            {category.name || category}
                          </button>
                        ))}
                      </div>
                    </div>
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
                            className="w-full pl-10 pr-10 py-2.5 bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-lg text-sangeet-neutral-200 placeholder-sangeet-neutral-400 focus:outline-none focus:ring-2 focus:ring-sangeet-400 transition-all text-sm sm:text-base"
                          />
                          {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-sangeet-neutral-400 hover:text-sangeet-neutral-200 transition-colors">
                              <span className="text-lg">✕</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {(() => {
                      const filteredItems = menuItems.filter(item => {
                        if (selectedCategory !== 'all') {
                          const itemCategory = item.category_name || item.category;
                          const selectedCat = typeof selectedCategory === 'object' ? (selectedCategory as any).name : selectedCategory;
                          if (itemCategory !== selectedCat) return false;
                        }
                        if (searchTerm.trim()) {
                          const searchLower = searchTerm.toLowerCase();
                          return item.name.toLowerCase().includes(searchLower) || item.description.toLowerCase().includes(searchLower) || (item.category_name || item.category || '').toLowerCase().includes(searchLower);
                        }
                        return true;
                      });

                      if (filteredItems.length === 0) {
                        return (
                          <div className="text-center py-8">
                            <div className="text-4xl sm:text-6xl mb-3">🔍</div>
                            <h3 className="text-lg sm:text-xl font-semibold text-sangeet-400 mb-2">No items found</h3>
                            <p className="text-sangeet-neutral-400 mb-4 px-4">{searchTerm.trim() ? `No items match "${searchTerm}".` : 'No items available in this category.'}</p>
                          </div>
                        );
                      }

                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 pt-4">
                          {filteredItems.map((item) => (
                            <div key={item.id} className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-xl overflow-hidden border border-sangeet-neutral-700 hover:border-sangeet-neutral-600 transition-all flex flex-col h-full shadow-lg">
                              <div className="h-40 sm:h-48 overflow-hidden">
                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="p-3 sm:p-4 flex flex-col flex-grow">
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="text-sm sm:text-base font-semibold text-sangeet-400 flex-1 mr-2">{item.name}</h3>
                                  <span className="text-sangeet-400 font-bold text-base">${item.price}</span>
                                </div>
                                <p className="text-xs sm:text-sm text-sangeet-neutral-400 mb-2 line-clamp-2">{item.description}</p>
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {item.is_vegetarian && <span className="px-1.5 py-0.5 bg-green-600 text-white text-xs rounded-full">🌱 Veg</span>}
                                  {item.is_spicy && <span className="px-1.5 py-0.5 bg-red-600 text-white text-xs rounded-full">🔥 Spicy</span>}
                                  {item.is_popular && <span className="px-1.5 py-0.5 bg-yellow-600 text-white text-xs rounded-full">⭐ Popular</span>}
                                </div>
                                <div className="mt-auto">
                                  <button onClick={() => addToCart(item)} className="w-full bg-sangeet-400 text-sangeet-neutral-950 py-2 rounded-lg font-semibold hover:bg-sangeet-300 transition-colors shadow-lg text-xs sm:text-sm">
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
      </div>
    </div>
  );
};

export default UnifiedDashboard;
