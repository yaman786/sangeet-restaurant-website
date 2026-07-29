'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, OrderSession } from '@/lib/types';
import toast from 'react-hot-toast';

interface CartContextType {
  cart: CartItem[];
  session: OrderSession | null;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  initializeSession: (session: OrderSession) => void;
  updateSession: (updates: Partial<OrderSession>) => void;
  getCartTotal: () => number;
  isInitialized: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

import { getTableSession, saveTableSession, clearTableSession } from '@/lib/utils/tableSession';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [session, setSession] = useState<OrderSession | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSession = getTableSession();
        if (savedSession) {
          setSession(savedSession as any);
          if (savedSession.cart && Array.isArray(savedSession.cart)) {
            setCart(savedSession.cart);
          }
        }
      } catch (e) {
        console.error('Failed to parse table session from localStorage', e);
      }
      setIsInitialized(true);
    }
  }, []);

  // Save to consolidated tableSession when session or cart changes
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      if (session) {
        saveTableSession({
          ...session,
          cart
        });
      }
    }
  }, [cart, session, isInitialized]);

  const addToCart = useCallback((item: CartItem) => {
    setCart((prev) => {
      const existingItem = prev.find((i) => i.id === item.id);
      if (existingItem) {
        toast.success(`Increased ${item.name} quantity to ${existingItem.quantity + 1}`);
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      toast.success(`Added ${item.name} to cart`);
      return [...prev, item];
    });
  }, []);

  const removeFromCart = useCallback((itemId: number) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const initializeSession = useCallback((newSession: OrderSession) => {
    setSession(newSession);
    if (typeof window !== 'undefined') {
      // Load cart for this new session if it exists
      const savedCart = localStorage.getItem(`cart_${newSession.tableNumber}`);
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch(e) {
          setCart([]);
        }
      } else {
        setCart([]);
      }
    }
  }, []);

  const updateSession = useCallback((updates: Partial<OrderSession>) => {
    setSession((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => {
      const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
      return total + (price * item.quantity);
    }, 0);
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        session,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        initializeSession,
        updateSession,
        getCartTotal,
        isInitialized
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
