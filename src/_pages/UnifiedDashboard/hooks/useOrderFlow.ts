import { useState, useCallback } from 'react';
import { createOrder, getTableByNumber, getTableByQRCode } from '../../../services/api';
import toast from 'react-hot-toast';
import { useCart } from '@/contexts/CartContext';
import { saveTableSession } from '@/lib/utils/tableSession';

export const useOrderFlow = (tableSession: any) => {
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

  const { cart, addToCart: ctxAddToCart, removeFromCart: ctxRemoveFromCart, updateQuantity: ctxUpdateQuantity, clearCart, getCartTotal, session } = useCart();
  const [loading, setLoading] = useState(false);

  const addToCart = useCallback((item: any) => {
    ctxAddToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image_url: item.image_url,
      is_vegetarian: item.is_vegetarian
    });
    updateSessionTimestamp();
  }, [ctxAddToCart, updateSessionTimestamp]);

  const removeFromCart = useCallback((itemId: string | number) => {
    ctxRemoveFromCart(Number(itemId));
    updateSessionTimestamp();
  }, [ctxRemoveFromCart, updateSessionTimestamp]);

  const updateQuantity = useCallback((itemId: string | number, quantity: number) => {
    ctxUpdateQuantity(Number(itemId), quantity);
    updateSessionTimestamp();
  }, [ctxUpdateQuantity, updateSessionTimestamp]);

  const handlePlaceOrder = useCallback(async (setCurrentView: (view: string) => void) => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      setLoading(true);
      let tableId = tableInfo?.id;
      
      if (!tableId) {
        if (!tableNumber) {
          toast.error('Table information is missing. Please scan the QR code again.');
          setLoading(false);
          return;
        }
        
        try {
          let tableData: any = null;
          try {
            tableData = await getTableByNumber(tableNumber as string);
          } catch {
            tableData = await getTableByQRCode(tableNumber as string);
          }

          if (tableData && tableData.id) {
            tableId = tableData.id;
          } else {
            throw new Error('Invalid table data');
          }
        } catch (error) {
          console.error('Failed to fetch table info for order:', error);
          toast.error('Could not verify table. Please scan the QR code again.');
          setLoading(false);
          return;
        }
      }
      
      // Ensure tableId is an integer for the backend schema
      tableId = typeof tableId === 'string' ? parseInt(tableId, 10) : tableId;
      
      // Ensure customer_name is locked to the table session across secondary rounds
      let resolvedCustomerName = customerName;
      if ((!resolvedCustomerName || resolvedCustomerName === 'Guest') && tableNumber) {
        try {
          const stored = localStorage.getItem(`customer_${tableNumber}`);
          if (stored && stored !== 'Guest') resolvedCustomerName = stored;
        } catch (e) {}
      }
      
      const orderData = {
        table_id: tableId,
        customer_name: resolvedCustomerName || 'Guest',
        items: cart.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          special_requests: item.specialRequests || ''
        }))
      };
      
      const response: any = await createOrder(orderData);
      const newOrder = response.order;
      
      const currentCartItems = [...cart];
      
      setOrderId(newOrder.id);
      setOrderNumber(newOrder.order_number);
      setTotalAmount(newOrder.total_amount);
      setOrderItems(currentCartItems);
      
      setOrders((prevOrders: any[]) => [...prevOrders, newOrder]);
      
      // Save consolidated tableSession for device security & persistence upon reload/rescan
      try {
        saveTableSession({
          tableId: tableId,
          tableNumber: tableNumber,
          customerName: resolvedCustomerName || 'Guest',
          orderId: newOrder.id,
          orderNumber: newOrder.order_number,
          cart: []
        });
      } catch (e) {
        console.error('Error saving table session:', e);
      }
      
      // Abort any pending cancellation kickouts since they are ordering again!
      if (tableId) {
        localStorage.removeItem(`cancelledOrder_${tableId}`);
        localStorage.removeItem(`cancelledOrder_${tableNumber}`);
      }
      
      clearCart();
      setCurrentView('tracking');
      
      toast.success('Order placed successfully! 🎉', {
        duration: 4000,
        icon: '✅'
      });
      
      setTimeout(() => {
        toast.success('📱 You can close this page and scan QR code later!', {
          duration: 5000,
          icon: '💡'
        });
      }, 2000);
      
    } catch (error: any) {
      console.error('Error placing order:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to place order. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [cart, customerName, tableInfo, tableNumber, setOrderId, setOrderNumber, setTotalAmount, setOrderItems, setOrders]);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    handlePlaceOrder,
    loading,
    setLoading
  };
};
