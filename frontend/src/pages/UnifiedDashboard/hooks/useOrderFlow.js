import { useState, useCallback } from 'react';
import { createOrder } from '../../../services/api';
import toast from 'react-hot-toast';

export const useOrderFlow = (tableSession) => {
  const {
    tableNumber,
    tableInfo,
    customerName,
    setOrderId,
    setOrderNumber,
    setTotalAmount,
    setOrderItems,
    setOrders,
    updateSessionTimestamp
  } = tableSession;

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const addToCart = useCallback((item) => {
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
  }, [updateSessionTimestamp]);

  const removeFromCart = useCallback((itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    updateSessionTimestamp();
  }, [updateSessionTimestamp]);

  const updateQuantity = useCallback((itemId, quantity) => {
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
  }, [removeFromCart, updateSessionTimestamp]);

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  const handlePlaceOrder = useCallback(async (setCurrentView) => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      setLoading(true);
      const tableId = tableInfo?.id || tableNumber;
      
      const orderData = {
        table_id: tableId,
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
      
      const currentCartItems = [...cart];
      
      setOrderId(newOrder.id);
      setOrderNumber(newOrder.order_number);
      setTotalAmount(newOrder.total_amount);
      setOrderItems(currentCartItems);
      
      setOrders(prevOrders => {
        if (isMerged) {
          return prevOrders.map(order => 
            order.id === newOrder.id ? newOrder : order
          );
        } else {
          const orderExists = prevOrders.some(order => order.id === newOrder.id);
          if (orderExists) return prevOrders;
          return [...prevOrders, newOrder];
        }
      });
      
      setCart([]);
      setCurrentView('tracking');
      
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
  }, [cart, customerName, tableInfo, tableNumber, setOrderId, setOrderNumber, setTotalAmount, setOrderItems, setOrders]);

  return {
    cart,
    setCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    handlePlaceOrder,
    loading,
    setLoading
  };
};
