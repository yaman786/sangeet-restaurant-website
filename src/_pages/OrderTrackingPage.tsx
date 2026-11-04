"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from '@/utils/router-mock';
import { motion, AnimatePresence } from 'framer-motion';
import { getOrderById, trackPublicOrders } from '../services/api';
import { pusherClient as socketService } from '@/lib/services/pusherClient';
import toast from 'react-hot-toast';
import ReviewModal from '../components/ReviewModal';
import {
  Search,
  Smartphone,
  ClipboardList,
  ChefHat,
  CheckCircle2,
  PartyPopper,
  XCircle,
  MessageCircle,
  MapPin,
  Clock,
  ArrowRight,
  ShoppingBag,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { getOrderStationSummary } from '@/lib/utils/menuSection';

const OrderTrackingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search state for public lookup
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [showSearchForm, setShowSearchForm] = useState(false);

  const [reviewModal, setReviewModal] = useState<any>({
    isOpen: false,
    order: null
  });
  const [reviewedOrders, setReviewedOrders] = useState<Set<any>>(new Set());

  // Order status configuration
  const orderStatuses: Record<string, { label: string; description: string; icon: string; color: string; bgColor: string; borderColor: string }> = {
    pending: {
      label: 'Order Placed',
      description: 'Your order has been received and is awaiting kitchen confirmation',
      icon: '📋',
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      borderColor: 'border-blue-400/30'
    },
    accepted: {
      label: 'Order Accepted',
      description: 'The kitchen has accepted your order and preparation is starting',
      icon: '👨‍🍳',
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/10',
      borderColor: 'border-amber-400/30'
    },
    preparing: {
      label: 'In the Kitchen',
      description: 'Our chefs are cooking your fresh culinary offerings',
      icon: '🔥',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      borderColor: 'border-yellow-400/30'
    },
    ready: {
      label: 'Ready for Pick-Up',
      description: 'Your order is freshly packed and ready for collection at the counter!',
      icon: '🛍️',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10',
      borderColor: 'border-emerald-400/30'
    },
    completed: {
      label: 'Paid & Collected',
      description: 'Thank you for dining with Sangeet Restaurant! Enjoy your meal.',
      icon: '🎉',
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
      borderColor: 'border-purple-400/30'
    },
    cancelled: {
      label: 'Order Cancelled',
      description: 'Your order has been cancelled by the restaurant',
      icon: '❌',
      color: 'text-red-400',
      bgColor: 'bg-red-400/10',
      borderColor: 'border-red-400/30'
    }
  };

  const adoptOrderSession = useCallback((targetOrder: any) => {
    if (!targetOrder) return;
    try {
      const isTakeaway = targetOrder.order_type === 'takeaway' || String(targetOrder.table_number).toUpperCase() === 'PICKUP';
      if (isTakeaway) {
        localStorage.setItem('orderId_PICKUP', String(targetOrder.id));
        localStorage.setItem('orderNumber_PICKUP', String(targetOrder.order_number || ''));
        if (targetOrder.customer_name) {
          localStorage.setItem('customer_PICKUP', targetOrder.customer_name);
        }
      }
      localStorage.setItem(
        'orderSession',
        JSON.stringify({
          orderId: targetOrder.id,
          orderNumber: targetOrder.order_number,
          tableNumber: targetOrder.table_number || (isTakeaway ? 'PICKUP' : null),
          orderType: targetOrder.order_type || (isTakeaway ? 'takeaway' : 'dine-in'),
          customerName: targetOrder.customer_name
        })
      );
    } catch {
      // ignore storage errors
    }
  }, []);

  // Public search handler
  const handlePerformSearch = async (termToSearch?: string) => {
    const rawTerm = (termToSearch !== undefined ? termToSearch : searchQuery).trim();
    if (!rawTerm) {
      toast.error('Please enter your mobile number or order number');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const res = await trackPublicOrders({
        phone: rawTerm,
        orderNumber: rawTerm
      });

      if (res && res.orders && res.orders.length > 0) {
        if (res.orders.length === 1) {
          // Exactly 1 active order, load it directly
          const selected = res.orders[0];
          adoptOrderSession(selected);
          setOrder(selected);
          setShowSearchForm(false);
          setSearchResults(null);
          toast.success(`Found Order #${selected.order_number || selected.id}!`);
        } else {
          // Multiple orders, display results list
          setSearchResults(res.orders);
        }
      } else {
        setSearchResults([]);
        setError(`No active orders found for "${rawTerm}". Please check your mobile or order number.`);
      }
    } catch (err: any) {
      console.error('Track order search error:', err);
      setError(err?.response?.data?.error || 'Unable to find orders. Please check your details and try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (selectedOrder: any) => {
    adoptOrderSession(selectedOrder);
    setOrder(selectedOrder);
    setShowSearchForm(false);
    setSearchResults(null);
  };

  // Initial loader: checks URL parameters & localStorage
  useEffect(() => {
    const initTracking = async () => {
      try {
        setLoading(true);
        const searchParams = new URLSearchParams(location.search);
        const urlOrderId = searchParams.get('orderId');
        const urlOrderNumber = searchParams.get('orderNumber');
        const urlPhone = searchParams.get('phone');

        // Case 1: Order Number or Phone passed directly via URL
        if (urlOrderNumber || urlPhone) {
          const res = await trackPublicOrders({
            phone: urlPhone || undefined,
            orderNumber: urlOrderNumber || undefined
          });
          if (res && res.orders && res.orders.length > 0) {
            adoptOrderSession(res.orders[0]);
            setOrder(res.orders[0]);
            setLoading(false);
            return;
          }
        }

        // Case 2: Order ID passed in URL
        let targetOrderId = urlOrderId;
        if (!targetOrderId) {
          // Fallback to local storage
          try {
            targetOrderId = localStorage.getItem('orderId_PICKUP');
            if (!targetOrderId) {
              const sessionStr = localStorage.getItem('orderSession');
              if (sessionStr) {
                const parsed = JSON.parse(sessionStr);
                targetOrderId = parsed.orderId ? String(parsed.orderId) : null;
              }
            }
          } catch {}
        }

        if (targetOrderId) {
          const orderData = await getOrderById(targetOrderId, 'PICKUP');
          if (orderData && orderData.status !== 'cancelled') {
            adoptOrderSession(orderData);
            setOrder(orderData);
            setLoading(false);
            return;
          }
        }

        // If no active order, open the search lookup form
        setShowSearchForm(true);
      } catch (err) {
        console.error('Error initializing order tracking:', err);
        setShowSearchForm(true);
      } finally {
        setLoading(false);
      }
    };

    initTracking();
  }, [location.search, adoptOrderSession]);

  // Real-time socket updates via Pusher
  useEffect(() => {
    if (!order?.id) return;

    socketService.connect();
    socketService.joinCustomer(order.id);

    const unsubscribeStatus = socketService.onOrderStatusUpdate((data: any) => {
      if (data.orderId && String(data.orderId) === String(order.id)) {
        setOrder((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: data.status,
            kot_status: data.kot_status || prev.kot_status,
            bot_status: data.bot_status || prev.bot_status,
            updated_at: data.timestamp || new Date().toISOString()
          };
        });

        const statusMessages: Record<string, string> = {
          preparing: 'Our chefs are cooking your meal! 🔥',
          ready: 'Your order is packed and ready for collection! 🛍️',
          completed: 'Thank you for dining with Sangeet Restaurant! 🎉'
        };

        if (statusMessages[data.status]) {
          toast.success(statusMessages[data.status], { icon: '🍽️' });
        }
      }
    });

    return () => {
      unsubscribeStatus();
    };
  }, [order?.id]);

  const getStatusStep = (status: string) => {
    const statusOrder = ['pending', 'accepted', 'preparing', 'ready', 'completed'];
    if (status === 'cancelled') return 0;
    return statusOrder.indexOf(status) + 1;
  };

  const getTotalAmount = () => {
    if (!order?.items) return parseFloat(order?.total_amount || 0);
    return order.items.reduce((total: number, item: any) => total + parseFloat(item.total_price || 0), 0);
  };

  const formatTime = (dateString: any) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-HK', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: any) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-HK', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sangeet-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sangeet-400 mx-auto mb-4" />
          <p className="text-sangeet-neutral-300 font-medium">Checking live order status...</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // VIEW 1: SEARCH / LOOKUP FORM (When no order is active or user clicked Track Another)
  // ─────────────────────────────────────────────────────────────
  if (showSearchForm || !order) {
    return (
      <div className="min-h-screen bg-sangeet-neutral-950 py-16 px-4 selection:bg-sangeet-400 selection:text-sangeet-neutral-900">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-sangeet-400/10 border border-sangeet-400/20 text-sangeet-400 mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">
              Track Your Order
            </h1>
            <p className="text-sangeet-neutral-300 text-sm sm:text-base max-w-lg mx-auto">
              Check real-time kitchen preparation, bar packing, and ready-for-collection status.
            </p>
          </div>

          {/* Search Card */}
          <div className="bg-sangeet-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePerformSearch();
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="searchQuery" className="block text-xs font-semibold uppercase tracking-wider text-sangeet-400 mb-2">
                  Mobile Number or Order #
                </label>
                <div className="relative">
                  <input
                    id="searchQuery"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. 91234567 or 20261104-001"
                    data-testid="track-order-search-input"
                    className="w-full bg-sangeet-neutral-950/80 border border-white/10 rounded-2xl px-4 py-3.5 pl-11 text-white placeholder-sangeet-neutral-500 text-sm sm:text-base focus:outline-hidden focus:border-sangeet-400 focus:ring-1 focus:ring-sangeet-400 transition-all"
                  />
                  <Search className="w-5 h-5 text-sangeet-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-xs text-sangeet-neutral-400 mt-2">
                  Enter the phone number used during checkout, or your order receipt number.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSearching}
                data-testid="track-order-search-btn"
                className="w-full bg-linear-to-r from-sangeet-400 to-sangeet-500 hover:from-sangeet-300 hover:to-sangeet-400 text-sangeet-neutral-950 font-bold py-3.5 px-6 rounded-2xl transition-all shadow-gold-glow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSearching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Find My Order</span>
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm text-center">
                <p>{error}</p>
                <p className="text-xs text-sangeet-neutral-400 mt-2">
                  Need assistance? Call reception directly at <a href="tel:+85225725707" className="text-sangeet-400 underline">+852 2572 5707</a>.
                </p>
              </div>
            )}
          </div>

          {/* Multiple Results List */}
          {searchResults && searchResults.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-sangeet-400 px-1">
                Found {searchResults.length} Order{searchResults.length !== 1 ? 's' : ''}
              </h2>
              {searchResults.map((resOrder) => {
                const isReady = resOrder.status === 'ready';
                return (
                  <div
                    key={resOrder.id}
                    className="bg-sangeet-neutral-900/80 border border-white/10 rounded-2xl p-5 hover:border-sangeet-400/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white text-base">
                          Order #{resOrder.order_number || resOrder.id}
                        </span>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                            isReady
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-sangeet-400/15 text-sangeet-300 border-sangeet-400/30'
                          }`}
                        >
                          {resOrder.status}
                        </span>
                      </div>
                      <p className="text-xs text-sangeet-neutral-400">
                        {resOrder.customer_name} • {formatTime(resOrder.created_at)} •{' '}
                        {resOrder.order_items?.length || 0} items (${parseFloat(resOrder.total_amount || 0).toFixed(2)})
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectSearchResult(resOrder)}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-sangeet-400 text-sangeet-neutral-950 font-bold text-xs hover:bg-sangeet-300 transition-colors cursor-pointer"
                    >
                      <span>Open Live Tracker</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Help & Fast Links */}
          <div className="text-center mt-12 text-xs text-sangeet-neutral-500">
            <p>Sangeet Restaurant • 17 Fenwick Street, Wan Chai, Hong Kong</p>
            <div className="mt-3 flex justify-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/pickup')}
                className="text-sangeet-400 hover:underline"
              >
                Start New Pick-Up Order
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-sangeet-neutral-400 hover:underline"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // VIEW 2: ACTIVE ORDER LIVE TRACKER
  // ─────────────────────────────────────────────────────────────
  const currentStatus = orderStatuses[order.status] || orderStatuses.pending;
  const statusStep = getStatusStep(order.status);
  const isTakeaway = order.order_type === 'takeaway' || String(order.table_number).toUpperCase() === 'PICKUP';
  const stationSummary = getOrderStationSummary(order);

  const trackingShareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/track-order?orderNumber=${encodeURIComponent(order.order_number || order.id)}`
    : `https://www.sangeet.hk/track-order?orderNumber=${order.order_number || order.id}`;

  const whatsappShareText = `Track my Sangeet Restaurant Pick-Up Order #${order.order_number || order.id}:\n${trackingShareUrl}`;

  return (
    <div className="min-h-screen bg-sangeet-neutral-950 py-10 px-4 selection:bg-sangeet-400 selection:text-sangeet-neutral-900 pb-28">
      <div className="max-w-3xl mx-auto">
        {/* Top bar controls */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => {
              setShowSearchForm(true);
              setSearchQuery('');
            }}
            data-testid="track-switch-order-btn"
            className="inline-flex items-center gap-1.5 text-xs text-sangeet-neutral-400 hover:text-sangeet-400 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Track Another Order</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/pickup')}
            className="text-xs text-sangeet-400 hover:underline"
          >
            + New Order
          </button>
        </div>

        {/* Order Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-sangeet-neutral-900/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 mb-6"
        >
          {/* Main Status Badge */}
          <div className="text-center mb-6">
            <div className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full ${currentStatus.bgColor} ${currentStatus.borderColor} border-2 mb-3 shadow-inner`}>
              <span className="text-3xl sm:text-4xl">{currentStatus.icon}</span>
            </div>
            <h1 className={`font-display text-2xl sm:text-3xl font-bold ${currentStatus.color} mb-1.5`}>
              {currentStatus.label}
            </h1>
            <p className="text-sangeet-neutral-300 text-xs sm:text-sm max-w-md mx-auto">
              {currentStatus.description}
            </p>
          </div>

          {/* Progress Step Bar */}
          <div className="mb-6 pt-2">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-semibold text-sangeet-neutral-300">Preparation Progress</span>
              <span className="text-sangeet-neutral-400">
                {order.status === 'cancelled' ? 'Cancelled' : `Step ${statusStep} of 4`}
              </span>
            </div>

            <div className="relative">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-sangeet-400 to-emerald-400 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(15, (statusStep / 4) * 100))}%` }}
                />
              </div>

              <div className="flex justify-between mt-3 text-[11px] text-sangeet-neutral-400">
                <span className={statusStep >= 1 ? 'text-sangeet-300 font-semibold' : ''}>Placed</span>
                <span className={statusStep >= 2 ? 'text-sangeet-300 font-semibold' : ''}>Cooking</span>
                <span className={statusStep >= 3 ? 'text-emerald-400 font-bold' : ''}>Ready</span>
                <span className={statusStep >= 4 ? 'text-purple-300 font-semibold' : ''}>Completed</span>
              </div>
            </div>
          </div>

          {/* Station Status Split (Food vs Drinks) */}
          {(stationSummary.hasKot || stationSummary.hasBot) && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs">
                {stationSummary.hasKot && (
                  <div
                    className={`p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 ${
                      !stationSummary.hasBot ? 'sm:col-span-2' : ''
                    }`}
                  >
                    <span className="text-sangeet-neutral-300 font-medium">🍳 Kitchen Food:</span>
                    <span className="font-bold text-sangeet-300 capitalize text-right">
                      {order.kot_status || 'In Prep'}
                    </span>
                  </div>
                )}
                {stationSummary.hasBot && (
                  <div
                    className={`p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 ${
                      !stationSummary.hasKot ? 'sm:col-span-2' : ''
                    }`}
                  >
                    <span className="text-sangeet-neutral-300 font-medium">🍷 Beverages:</span>
                    <span className="font-bold text-emerald-400 capitalize text-right">
                      {order.bot_status || 'Packed ✓'}
                    </span>
                  </div>
                )}
              </div>

              {stationSummary.hasBot && stationSummary.hasKot && order.bot_status === 'ready' && order.kot_status !== 'ready' && (
                <p className="mt-2 text-xs text-sangeet-300 bg-sangeet-400/10 border border-sangeet-400/20 rounded-xl px-3 py-2">
                  🥤 Your drinks are packed! Waiting for the kitchen to finish packing your hot food so you can collect everything together.
                </p>
              )}
            </div>
          )}

          {/* WhatsApp & Navigation Actions */}
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(whatsappShareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="track-whatsapp-share-btn"
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Save Tracking Link to WhatsApp</span>
            </a>

            <a
              href="https://maps.google.com/?q=17+Fenwick+Street+Wan+Chai+Hong+Kong"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/5 hover:bg-white/10 text-sangeet-neutral-200 border border-white/10 font-medium py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
            >
              <MapPin className="w-4 h-4 text-sangeet-400" />
              <span>Directions: 17 Fenwick St</span>
              <ExternalLink className="w-3 h-3 text-sangeet-neutral-400" />
            </a>
          </div>
        </motion.div>

        {/* Order Details & Summary Card */}
        <div className="bg-sangeet-neutral-900/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/10">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-white">Order Details</h2>
              <p className="text-xs text-sangeet-neutral-400">
                Order #{order.order_number || order.id} • {order.customer_name || 'Guest'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-sangeet-neutral-400">Total</span>
              <p className="text-lg font-bold text-sangeet-400">${getTotalAmount().toFixed(2)}</p>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3 mb-6">
            {order.items?.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center text-xs sm:text-sm py-1.5 border-b border-white/5 last:border-b-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sangeet-400">{item.quantity}×</span>
                  <span className="text-sangeet-neutral-200">{item.name}</span>
                </div>
                <span className="text-sangeet-neutral-400">
                  ${parseFloat(item.total_price || item.unit_price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Collection instructions */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-sangeet-neutral-300">
            <p className="font-semibold text-sangeet-400 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Pick-Up Collection Counter
            </p>
            <p>
              Present Order <strong>#{order.order_number || order.id}</strong> to our reception desk on arrival at{' '}
              <strong>17 Fenwick Street, Wan Chai</strong>. You can settle payment at the counter via Cash, Octopus, Credit Card, or PayMe/FPS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
