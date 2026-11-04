"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useLocation } from '@/utils/router-mock';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ChevronRight, X, Clock, CheckCircle2 } from 'lucide-react';
import { getOrderById } from '@/services/api';

export default function ActiveOrderTrackerPill() {
  const location = useLocation();
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if current page is already the dashboard or track-order page
  const isTrackingPage =
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/track-order') ||
    location.pathname.startsWith('/pickup/cart');

  const checkActiveOrder = useCallback(async () => {
    if (typeof window === 'undefined') return;

    try {
      // Check session dismissal
      const dismissed = sessionStorage.getItem('dismissed_pickup_tracker_pill');
      if (dismissed === 'true') {
        setIsDismissed(true);
        setLoading(false);
        return;
      }

      let orderId = localStorage.getItem('orderId_PICKUP');
      let orderNumber = localStorage.getItem('orderNumber_PICKUP');
      let customerName = localStorage.getItem('customer_PICKUP');

      if (!orderId) {
        const orderSessionStr = localStorage.getItem('orderSession');
        if (orderSessionStr) {
          const parsed = JSON.parse(orderSessionStr);
          if (parsed.orderType === 'takeaway' || parsed.tableNumber === 'PICKUP') {
            orderId = parsed.orderId;
            orderNumber = parsed.orderNumber || orderNumber;
            customerName = parsed.customerName || customerName;
          }
        }
      }

      if (!orderId) {
        setActiveOrder(null);
        setLoading(false);
        return;
      }

      // Fetch live status
      const data: any = await getOrderById(orderId, 'PICKUP');
      if (data && data.status !== 'completed' && data.status !== 'cancelled') {
        setActiveOrder(data);
      } else {
        // Order completed or cancelled, clear
        setActiveOrder(null);
      }
    } catch {
      // Silent error handling for background pill check
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkActiveOrder();

    // Re-check on visibility change or interval
    const interval = setInterval(checkActiveOrder, 25000);
    return () => clearInterval(interval);
  }, [checkActiveOrder]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDismissed(true);
    try {
      sessionStorage.setItem('dismissed_pickup_tracker_pill', 'true');
    } catch {}
  };

  if (isTrackingPage || isDismissed || loading || !activeOrder) {
    return null;
  }

  const isReady = activeOrder.status === 'ready';
  const dashboardUrl = `/dashboard?orderId=${activeOrder.id}&table=PICKUP&customerName=${encodeURIComponent(
    activeOrder.customer_name || 'Guest'
  )}&orderNumber=${activeOrder.order_number || ''}`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 60, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 max-w-[calc(100vw-2rem)]"
      >
        <div
          data-testid="floating-order-tracker-pill"
          className="flex items-center gap-2.5 bg-sangeet-neutral-900/95 backdrop-blur-xl border border-sangeet-400/40 rounded-full px-3.5 py-2 sm:px-4 sm:py-2.5 shadow-2xl hover:border-sangeet-400 transition-all duration-300 group"
        >
          {/* Animated pulsing dot */}
          <div className="relative flex items-center justify-center shrink-0">
            <span
              className={`animate-ping absolute inline-flex h-3 w-3 rounded-full opacity-75 ${
                isReady ? 'bg-emerald-400' : 'bg-sangeet-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isReady ? 'bg-emerald-400' : 'bg-sangeet-400'
              }`}
            />
          </div>

          <Link
            href={dashboardUrl}
            data-testid="floating-order-tracker-link"
            className="flex items-center gap-2 text-xs sm:text-sm text-sangeet-neutral-100 hover:text-sangeet-400 transition-colors"
          >
            <span className="font-bold text-white flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5 text-sangeet-400 inline" />
              Pick-Up #{activeOrder.order_number || activeOrder.id}
            </span>
            <span className="text-sangeet-neutral-500">•</span>
            <span
              className={`font-semibold ${
                isReady ? 'text-emerald-400' : 'text-sangeet-400'
              }`}
            >
              {isReady ? 'Ready for Collection ✓' : 'In the Kitchen 🔥'}
            </span>
            <ChevronRight className="w-4 h-4 text-sangeet-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss active order notification"
            data-testid="floating-order-tracker-dismiss"
            className="w-5 h-5 rounded-full flex items-center justify-center text-sangeet-neutral-400 hover:text-white hover:bg-white/10 transition-colors ml-1 cursor-pointer shrink-0"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

