"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useNavigate } from '@/utils/router-mock';
import { fetchMenuItems, fetchMenuCategories, getOrderById } from '../services/api';
import toast from 'react-hot-toast';
import MenuView from '../components/MenuView';
import { ShoppingBag, MapPin, Clock, Sparkles, ChevronRight, ArrowLeft, ListOrdered } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { getTableSession, clearTableSession } from '@/lib/utils/tableSession';
import { isBarMenuItem } from '@/lib/utils/menuSection';

const PickupMenuPage = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activePickupOrder, setActivePickupOrder] = useState<any>(null);

  const { cart, addToCart, updateQuantity, getCartTotal, initializeSession } = useCart();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Isolate PICKUP session from dine-in table sessions
        const existingPickupSession = getTableSession('PICKUP');
        if (!existingPickupSession) {
          const anySession = getTableSession();
          if (anySession && anySession.tableNumber && anySession.tableNumber !== 'PICKUP') {
            clearTableSession();
          }
        }

        initializeSession({
          tableId: null,
          tableNumber: 'PICKUP',
          orderType: 'takeaway',
          customerName: existingPickupSession?.customerName || null,
          orderId: existingPickupSession?.orderId as number | undefined,
          orderNumber: existingPickupSession?.orderNumber as string | undefined
        });

        // Check if this device has an active Pick-Up order
        const storedOrderId = existingPickupSession?.orderId || localStorage.getItem('orderId_PICKUP');
        if (storedOrderId) {
          try {
            const orderData: any = await getOrderById(storedOrderId, 'PICKUP');
            if (orderData && orderData.status !== 'completed' && orderData.status !== 'cancelled') {
              setActivePickupOrder(orderData);
            }
          } catch {
            // Order no longer active or not found
          }
        }

        const [menuData, categoriesData] = await Promise.all([
          fetchMenuItems(),
          fetchMenuCategories()
        ]);
        setMenuItems(menuData || []);
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Error loading pickup menu:', error);
        toast.error('Failed to load menu. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [initializeSession]);

  const handleAddToCart = (item: any) => {
    const isDrink = item.section === 'drinks' || isBarMenuItem(item, categories);
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image_url: item.image_url,
      is_vegetarian: item.is_vegetarian,
      category: item.category_name || item.category,
      category_id: item.category_id,
      section: isDrink ? 'drinks' : 'food'
    });
  };

  const totalCartItems = cart.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 1), 0);

  const handleViewCart = () => {
    navigate('/pickup/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sangeet-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-sangeet-400">Loading Online Pick-Up Menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sangeet-neutral-900 text-sangeet-neutral-100 selection:bg-sangeet-400 selection:text-sangeet-neutral-900 pb-28">
      {/* Top Navigation Bar */}
      <div className="bg-[#1C1917]/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-sangeet-neutral-300 hover:text-sangeet-400 transition-colors py-1.5 px-3 rounded-xl bg-white/5 border border-white/10"
          >
            <ArrowLeft className="w-4 h-4 text-sangeet-400" />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center gap-2">
            {activePickupOrder && (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/dashboard?orderId=${activePickupOrder.id}&table=PICKUP&customerName=${encodeURIComponent(
                      activePickupOrder.customer_name || 'Guest'
                    )}&orderNumber=${activePickupOrder.order_number || ''}`
                  )
                }
                data-testid="pickup-track-active-order-btn"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all cursor-pointer"
              >
                <ListOrdered className="w-4 h-4 text-emerald-400" />
                <span>Track Order #{activePickupOrder.order_number || activePickupOrder.id}</span>
              </button>
            )}

            {totalCartItems > 0 && (
              <button
                type="button"
                onClick={handleViewCart}
                data-testid="pickup-header-cart-btn"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold px-4 py-2 rounded-xl bg-sangeet-400 text-sangeet-neutral-950 hover:bg-sangeet-300 transition-all shadow-gold-glow cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  Cart ({totalCartItems}) • ${getCartTotal().toFixed(2)}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <div className="relative min-h-[260px] md:min-h-[300px] w-full flex items-center justify-center pt-8 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-35 mix-blend-luminosity"></div>
        <div className="absolute inset-0 bg-linear-to-t from-sangeet-neutral-900 via-sangeet-neutral-900/75 to-sangeet-neutral-950/85"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative z-10 text-center px-4 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-sangeet-400/15 border border-sangeet-400/40 px-4 py-1.5 rounded-full mb-4">
            <ShoppingBag className="w-4 h-4 text-sangeet-400" />
            <span className="text-xs sm:text-sm font-semibold text-sangeet-400 uppercase tracking-wider">
              Online Self Pick-Up • No Delivery
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-6xl text-white font-bold mb-4 tracking-tight drop-shadow-2xl">
            Order <span className="text-sangeet-400 italic font-light">Pick-Up</span>
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-sangeet-neutral-200">
            <div className="inline-flex items-center gap-1.5 bg-sangeet-neutral-950/80 backdrop-blur-xl border border-white/10 px-3.5 py-2 rounded-full">
              <MapPin className="w-4 h-4 text-sangeet-400 shrink-0" />
              <span>17 Fenwick Street, Wan Chai, HK</span>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-sangeet-neutral-950/80 backdrop-blur-xl border border-white/10 px-3.5 py-2 rounded-full">
              <Clock className="w-4 h-4 text-sangeet-400 shrink-0" />
              <span>Ready in ~20–25 mins</span>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-sangeet-neutral-950/80 backdrop-blur-xl border border-white/10 px-3.5 py-2 rounded-full">
              <Sparkles className="w-4 h-4 text-sangeet-400 shrink-0" />
              <span>Pay at Counter on Collection</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Menu Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-2 relative z-20">
        <MenuView
          menuItems={menuItems}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAddToCart={handleAddToCart}
          onUpdateQuantity={updateQuantity}
          onViewCart={handleViewCart}
          cart={cart}
          cartLength={totalCartItems}
        />
      </div>

      {/* Floating Glassmorphism Cart Bar */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-6 left-0 right-0 px-4 z-50 pointer-events-none"
          >
            <div className="max-w-2xl mx-auto pointer-events-auto">
              <button
                type="button"
                onClick={handleViewCart}
                data-testid="pickup-floating-cart-btn"
                className="w-full bg-[#1C1917]/95 backdrop-blur-xl border border-sangeet-400/30 text-white p-4 rounded-2xl shadow-glass-lg hover:shadow-gold-glow-lg transition-all duration-300 flex items-center justify-between group overflow-hidden relative cursor-pointer"
              >
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                <div className="flex items-center space-x-4 relative z-10">
                  <div className="w-12 h-12 bg-sangeet-400 rounded-xl flex items-center justify-center shadow-lg">
                    <ShoppingBag className="w-6 h-6 text-[#1C1917]" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-lg leading-tight">
                      {totalCartItems} Item{totalCartItems !== 1 ? 's' : ''} for Pick-Up
                    </p>
                    <p className="text-sangeet-neutral-400 text-sm">Review &amp; choose collection time</p>
                  </div>
                </div>

                <div className="text-right relative z-10 flex items-center gap-3">
                  <div>
                    <p className="text-xs text-sangeet-neutral-400 uppercase tracking-wider mb-0.5">Total</p>
                    <p className="font-display text-2xl font-bold text-sangeet-400">
                      ${getCartTotal().toFixed(2)}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center border border-white/20 group-hover:bg-sangeet-400 group-hover:border-sangeet-400 transition-colors">
                    <ChevronRight className="w-5 h-5 text-sangeet-400 group-hover:text-sangeet-neutral-950 transition-colors" />
                  </div>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PickupMenuPage;
