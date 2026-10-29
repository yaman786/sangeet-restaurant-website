"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from '@/utils/router-mock';
import { toast } from 'react-hot-toast';
import { createOrder } from '../services/api';
import {
  ChevronLeft,
  User,
  Phone,
  Clock,
  MessageSquare,
  Utensils,
  Wine,
  Minus,
  Plus,
  X,
  Receipt,
  ShoppingBag,
  MapPin,
  CreditCard,
  Leaf,
  Check
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { isBarMenuItem } from '@/lib/utils/menuSection';
import { saveTableSession } from '@/lib/utils/tableSession';

const PICKUP_TIME_SLOTS = [
  'In 30 mins',
  'In 45 mins',
  'In 1 hour',
  '12:30 PM',
  '1:00 PM',
  '1:30 PM',
  '2:00 PM',
  '6:00 PM',
  '6:30 PM',
  '7:00 PM',
  '7:30 PM',
  '8:00 PM',
  '8:30 PM',
  '9:00 PM',
  '9:30 PM'
];

const PickupCartPage = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart, session, updateSession } = useCart();

  const [customerName, setCustomerName] = useState(session?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(session?.customerPhone || '');
  const [pickupMode, setPickupMode] = useState<'asap' | 'scheduled'>('asap');
  const [scheduledSlot, setScheduledSlot] = useState(PICKUP_TIME_SLOTS[0]);
  const [noCutlery, setNoCutlery] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    try {
      const savedName = localStorage.getItem('customer_PICKUP');
      const savedPhone = localStorage.getItem('phone_PICKUP');
      const savedInstructions = localStorage.getItem('instructions_PICKUP');
      if (savedName && !customerName) setCustomerName(savedName);
      if (savedPhone && !customerPhone) setCustomerPhone(savedPhone);
      if (savedInstructions) setSpecialInstructions(savedInstructions);
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    try {
      if (customerName) localStorage.setItem('customer_PICKUP', customerName);
      if (customerPhone) localStorage.setItem('phone_PICKUP', customerPhone);
      localStorage.setItem('instructions_PICKUP', specialInstructions);
    } catch {
      // ignore storage errors
    }
  }, [customerName, customerPhone, specialInstructions]);

  const getTotalAmount = () => getCartTotal();

  const foodCartItems = cart.filter((item: any) => !isBarMenuItem(item));
  const drinkCartItems = cart.filter((item: any) => isBarMenuItem(item));
  const totalCartQuantity = cart.reduce((total: number, item: any) => total + (Number(item.quantity) || 1), 0);

  const resolvedPickupTime = pickupMode === 'asap' ? 'ASAP (~20-25 mins)' : `Scheduled (${scheduledSlot})`;

  const renderCartItemRow = (item: any) => (
    <div
      key={item.id}
      className="flex flex-col sm:flex-row sm:items-center justify-between bg-sangeet-neutral-900/30 rounded-2xl p-4 border border-white/5"
    >
      <div className="flex-1 mb-4 sm:mb-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3 className="font-display text-xl text-white">{item.name}</h3>
          {item.category && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-sangeet-neutral-300">
              {item.category}
            </span>
          )}
        </div>
        <p className="text-sangeet-400 text-sm font-medium">${parseFloat(String(item.price)).toFixed(2)} each</p>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-6">
        <div className="flex items-center gap-4 bg-[#1C1917] rounded-full p-1 border border-white/10 shadow-inner">
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="w-8 h-8 bg-white/5 text-sangeet-400 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </motion.button>
          <span className="text-white font-medium w-4 text-center">{item.quantity}</span>
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="w-8 h-8 bg-sangeet-400 text-sangeet-neutral-900 rounded-full flex items-center justify-center hover:bg-sangeet-300 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="text-right min-w-[80px]">
          <div className="font-display text-xl font-bold text-white">
            ${(parseFloat(String(item.price)) * item.quantity).toFixed(2)}
          </div>
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => removeFromCart(item.id)}
          className="w-10 h-10 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-300 ml-2 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );

  const handleSubmitOrder = async () => {
    if (!customerName.trim()) {
      toast.error('Please enter your name for pick-up');
      return;
    }

    if (!customerPhone.trim() || customerPhone.trim().length < 6) {
      toast.error('Please enter a valid mobile / WhatsApp number');
      return;
    }

    if (cart.length === 0) {
      toast.error('Your pick-up cart is empty');
      return;
    }

    setIsSubmitting(true);

    try {
      const notesParts: string[] = [];
      if (noCutlery) notesParts.push('No disposable cutlery needed');
      if (specialInstructions.trim()) notesParts.push(specialInstructions.trim());

      const orderData = {
        table_id: null,
        order_type: 'takeaway' as const,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        pickup_time: resolvedPickupTime,
        special_instructions: notesParts.join(' • '),
        items: cart.map((item: any) => ({
          menu_item_id: item.id || item.menu_item_id,
          quantity: item.quantity,
          special_requests: item.specialRequests || item.special_requests || ''
        }))
      };

      const orderResponse = await createOrder(orderData);
      const orderId = (orderResponse as any)?.order?.id;
      const orderNumber = (orderResponse as any)?.order?.order_number;

      if (!orderId) {
        throw new Error('Order ID not found in response');
      }

      const sessionData = {
        tableId: null,
        tableNumber: 'PICKUP',
        orderType: 'takeaway' as const,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        pickupTime: resolvedPickupTime,
        orderId: orderId,
        orderNumber: orderNumber
      };

      updateSession(sessionData);
      saveTableSession({
        ...sessionData,
        cart: []
      });

      try {
        localStorage.setItem('orderSession', JSON.stringify(sessionData));
        localStorage.setItem('orderId_PICKUP', String(orderId));
        localStorage.setItem('customer_PICKUP', customerName.trim());
        localStorage.removeItem('instructions_PICKUP');
      } catch (e) {
        console.error('Failed to write pickup orderSession to localStorage:', e);
      }

      clearCart();
      toast.success('Pick-Up order placed! Redirecting to live tracker...');

      const dashboardUrl = `/dashboard?orderId=${orderId}&table=PICKUP&customerName=${encodeURIComponent(
        customerName.trim()
      )}&orderNumber=${orderNumber || ''}`;
      navigate(dashboardUrl, { replace: true });
    } catch (error: any) {
      console.error('Error placing pickup order:', error);
      toast.error(error.response?.data?.error || 'Failed to place pick-up order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueOrdering = () => {
    navigate('/pickup');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-sangeet-neutral-900 text-sangeet-neutral-100 selection:bg-sangeet-400 selection:text-sangeet-neutral-900 pb-36">
      {/* Liquid Glass Header */}
      <div className="bg-[#1C1917]/80 backdrop-blur-xl border-b border-white/10 p-4 sticky top-0 z-50 shadow-glass">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={handleContinueOrdering}
                className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors shadow-glass cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 text-sangeet-400" />
              </button>
              <div>
                <h1 className="font-display text-2xl font-bold text-white tracking-tight">Pick-Up Checkout</h1>
                <p className="text-sangeet-400 text-xs sm:text-sm font-medium">
                  Self Pick-Up • 17 Fenwick Street, Wan Chai • {totalCartQuantity} item{totalCartQuantity !== 1 ? 's' : ''}
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
            <h3 className="font-display text-3xl font-semibold text-sangeet-400 mb-3">Your pick-up bag is empty</h3>
            <p className="text-sangeet-neutral-400 mb-8 text-lg">Add your favourite dishes and drinks for self pick-up.</p>
            <button
              type="button"
              onClick={handleContinueOrdering}
              className="bg-sangeet-400 text-sangeet-neutral-950 px-8 py-3.5 rounded-xl font-semibold hover:bg-sangeet-300 transition-colors shadow-gold-glow cursor-pointer"
            >
              Browse Pick-Up Menu
            </button>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Pick-Up Location & Payment Notice */}
            <div
              className="bg-linear-to-r from-sangeet-400/15 via-sangeet-400/10 to-transparent rounded-3xl p-5 md:p-6 border border-sangeet-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-sangeet-400/20 border border-sangeet-400/40 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5 text-sangeet-400" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-sangeet-400 mb-0.5">
                    Self Pick-Up Collection Point
                  </p>
                  <p className="text-white font-semibold text-sm sm:text-base">
                    Sangeet Restaurant • 17 Fenwick Street, Wan Chai, Hong Kong
                  </p>
                  <p className="text-sangeet-neutral-400 text-xs sm:text-sm mt-0.5">
                    Please quote your Order # and Name at the reception counter.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-sangeet-neutral-950/80 border border-white/10 px-4 py-2.5 rounded-2xl shrink-0">
                <CreditCard className="w-4 h-4 text-sangeet-400 shrink-0" />
                <span className="text-xs font-medium text-sangeet-neutral-200">
                  Pay at Counter (Cash / Card / Octopus / PayMe)
                </span>
              </div>
            </div>

            {/* Pick-Up Customer & Time Details */}
            <div
              className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10 shadow-glass space-y-6"
            >
              <h2 className="font-display text-2xl text-white flex items-center">
                <div className="w-8 h-8 bg-sangeet-400/20 rounded-full flex items-center justify-center mr-3 border border-sangeet-400/30">
                  <User className="w-4 h-4 text-sangeet-400" />
                </div>
                Pick-Up Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sangeet-neutral-300 text-sm mb-2 ml-1 font-medium">
                    Full Name <span className="text-sangeet-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      data-testid="pickup-name-input"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-5 py-4 bg-sangeet-neutral-900/50 border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-sangeet-400 focus:bg-sangeet-neutral-900 transition-all duration-300 shadow-inner pl-12"
                      placeholder="E.g., Alex Chan"
                    />
                    <User className="w-5 h-5 text-sangeet-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-sangeet-neutral-300 text-sm mb-2 ml-1 font-medium">
                    Mobile / WhatsApp Number <span className="text-sangeet-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      data-testid="pickup-phone-input"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-5 py-4 bg-sangeet-neutral-900/50 border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-sangeet-400 focus:bg-sangeet-neutral-900 transition-all duration-300 shadow-inner pl-12"
                      placeholder="E.g., +852 9123 4567"
                    />
                    <Phone className="w-5 h-5 text-sangeet-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              {/* Pick-Up Time Selection */}
              <div>
                <label className="block text-sangeet-neutral-300 text-sm mb-2.5 ml-1 font-medium">
                  Preferred Collection Time
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    data-testid="pickup-time-asap"
                    onClick={() => setPickupMode('asap')}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      pickupMode === 'asap'
                        ? 'bg-sangeet-400/15 border-sangeet-400 text-white shadow-gold-glow'
                        : 'bg-sangeet-neutral-900/40 border-white/10 text-sangeet-neutral-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-sangeet-400 shrink-0" />
                      <div>
                        <p className="font-semibold text-sm">ASAP (Standard Prep)</p>
                        <p className="text-xs text-sangeet-neutral-400">Ready in ~20–25 mins</p>
                      </div>
                    </div>
                    {pickupMode === 'asap' && (
                      <div className="w-6 h-6 rounded-full bg-sangeet-400 text-sangeet-neutral-950 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    data-testid="pickup-time-schedule"
                    onClick={() => setPickupMode('scheduled')}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      pickupMode === 'scheduled'
                        ? 'bg-sangeet-400/15 border-sangeet-400 text-white shadow-gold-glow'
                        : 'bg-sangeet-neutral-900/40 border-white/10 text-sangeet-neutral-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-sangeet-400 shrink-0" />
                      <div>
                        <p className="font-semibold text-sm">Schedule Later Today</p>
                        <p className="text-xs text-sangeet-neutral-400">Choose a specific time slot</p>
                      </div>
                    </div>
                    {pickupMode === 'scheduled' && (
                      <div className="w-6 h-6 rounded-full bg-sangeet-400 text-sangeet-neutral-950 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                </div>

                {pickupMode === 'scheduled' && (
                  <div className="mt-3">
                    <select
                      data-testid="pickup-time-select"
                      value={scheduledSlot}
                      onChange={(e) => setScheduledSlot(e.target.value)}
                      className="w-full px-4 py-3.5 bg-sangeet-neutral-900 border border-sangeet-400/40 rounded-xl text-white focus:outline-hidden focus:border-sangeet-400 text-sm font-medium"
                    >
                      {PICKUP_TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot} className="bg-sangeet-neutral-900 text-white">
                          Collect Today: {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Eco Cutlery & Special Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-sangeet-neutral-300 text-sm mb-2 ml-1 font-medium">
                    Special Requests / Allergies
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      data-testid="pickup-instructions-input"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="w-full px-5 py-3.5 bg-sangeet-neutral-900/50 border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-sangeet-400 focus:bg-sangeet-neutral-900 transition-all duration-300 shadow-inner pl-12 text-sm"
                      placeholder="Allergies, spice preferences..."
                    />
                    <MessageSquare className="w-4 h-4 text-sangeet-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    data-testid="pickup-no-cutlery-toggle"
                    onClick={() => setNoCutlery((prev) => !prev)}
                    className={`w-full px-4 py-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      noCutlery
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                        : 'bg-sangeet-neutral-900/40 border-white/10 text-sangeet-neutral-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 text-left">
                      <Leaf className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-sm font-medium">No disposable cutlery needed</span>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                        noCutlery ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-white/25'
                      }`}
                    >
                      {noCutlery && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Grouped Cart Items: Food Menu (Kitchen) & Bar & Drinks */}
            {foodCartItems.length > 0 && (
              <div
                data-testid="pickup-cart-food-section"
                className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10 shadow-glass"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl text-white flex items-center">
                    <div className="w-8 h-8 bg-sangeet-400/20 rounded-full flex items-center justify-center mr-3 border border-sangeet-400/30">
                      <Utensils className="w-4 h-4 text-sangeet-400" />
                    </div>
                    Food Menu (Kitchen)
                  </h2>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-sangeet-400/15 text-sangeet-400 border border-sangeet-400/30">
                    {foodCartItems.reduce((sum: number, i: any) => sum + (Number(i.quantity) || 1), 0)} item
                    {foodCartItems.reduce((sum: number, i: any) => sum + (Number(i.quantity) || 1), 0) !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-4">{foodCartItems.map(renderCartItemRow)}</div>
              </div>
            )}

            {drinkCartItems.length > 0 && (
              <div
                data-testid="pickup-cart-drinks-section"
                className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10 shadow-glass"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl text-white flex items-center">
                    <div className="w-8 h-8 bg-sangeet-400/20 rounded-full flex items-center justify-center mr-3 border border-sangeet-400/30">
                      <Wine className="w-4 h-4 text-sangeet-400" />
                    </div>
                    Bar &amp; Drinks
                  </h2>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-sangeet-400/15 text-sangeet-400 border border-sangeet-400/30">
                    {drinkCartItems.reduce((sum: number, i: any) => sum + (Number(i.quantity) || 1), 0)} item
                    {drinkCartItems.reduce((sum: number, i: any) => sum + (Number(i.quantity) || 1), 0) !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-4">{drinkCartItems.map(renderCartItemRow)}</div>
              </div>
            )}

            {/* Order Summary */}
            <div
              className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10 shadow-glass"
            >
              <h2 className="font-display text-2xl text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-sangeet-400/20 rounded-full flex items-center justify-center mr-3 border border-sangeet-400/30">
                  <Receipt className="w-4 h-4 text-sangeet-400" />
                </div>
                Pick-Up Summary
              </h2>

              <div className="space-y-4 mb-6">
                {foodCartItems.length > 0 && drinkCartItems.length > 0 && (
                  <>
                    <div className="flex justify-between items-center text-sangeet-neutral-400 text-base">
                      <span>Food Menu ({foodCartItems.reduce((t: number, i: any) => t + i.quantity, 0)} items)</span>
                      <span>
                        ${foodCartItems.reduce((t: number, i: any) => t + parseFloat(String(i.price)) * i.quantity, 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sangeet-neutral-400 text-base">
                      <span>Bar &amp; Drinks ({drinkCartItems.reduce((t: number, i: any) => t + i.quantity, 0)} items)</span>
                      <span>
                        ${drinkCartItems.reduce((t: number, i: any) => t + parseFloat(String(i.price)) * i.quantity, 0).toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center text-sangeet-neutral-300 text-base">
                  <span>Collection Time</span>
                  <span className="font-semibold text-sangeet-400">{resolvedPickupTime}</span>
                </div>
                <div className="border-t border-white/10 pt-4 flex justify-between items-end">
                  <div>
                    <span className="text-white text-lg block">Total Due at Counter</span>
                    <span className="text-xs text-sangeet-neutral-400">No service charge on self pick-up</span>
                  </div>
                  <span className="font-display text-4xl font-bold text-sangeet-400 drop-shadow-md">
                    ${getTotalAmount().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Checkout Actions */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-[#1C1917]/95 backdrop-blur-xl border-t border-white/10 z-50 shadow-[0_-16px_48px_rgba(0,0,0,0.5)]"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={handleContinueOrdering}
                  className="flex-1 bg-transparent border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/5 transition-all duration-300 text-lg cursor-pointer"
                >
                  Add More Items
                </button>
                <button
                  type="button"
                  data-testid="pickup-submit-order-btn"
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting || cart.length === 0}
                  className="flex-1 bg-sangeet-400 text-sangeet-neutral-950 px-8 py-4 rounded-xl font-bold hover:bg-sangeet-300 transition-all duration-300 disabled:opacity-50 shadow-gold-glow text-lg relative overflow-hidden group cursor-pointer"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <span className="relative z-10">
                    {isSubmitting ? 'Placing Pick-Up Order...' : 'Place Pick-Up Order'}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PickupCartPage;

