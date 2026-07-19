import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from '@/utils/router-mock';
import { getOrdersByTable, getTableByNumber, getOrderById } from '../../../services/api';
import { pusherClient as socketService } from '@/lib/services/pusherClient';
import toast from 'react-hot-toast';
import { ORDER_STATUSES } from '../constants';

const CANCELLED_ORDER_TIMEOUT = 2 * 60 * 1000;

export const useTableSession = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  
  const initialOrderId = searchParams.get('orderId');
  const tableNumber = searchParams.get('table');
  const initialOrderNumber = searchParams.get('orderNumber');
  const initialTotalAmount = searchParams.get('totalAmount');
  const initialCustomerName = searchParams.get('customerName');

  const [customerName, setCustomerName] = useState<string | null>(() => {
    if (initialCustomerName) return initialCustomerName;
    try {
      if (typeof window !== 'undefined' && tableNumber) {
        const stored = localStorage.getItem(`customer_${tableNumber}`);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.name) return parsed.name;
            if (typeof parsed === 'string' && parsed.length > 0) return parsed;
          } catch (parseError) {
            // If it's not JSON, it might just be the raw string (saved by QRCartPage)
            if (typeof stored === 'string' && stored.length > 0) return stored;
          }
        }
      }
    } catch (e) {}
    return null;
  });
  const [orderId, setOrderId] = useState(initialOrderId);
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [totalAmount, setTotalAmount] = useState(initialTotalAmount);
  const [orders, setOrders] = useState<any[]>([]);
  const [tableInfo, setTableInfo] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);

  const hasCancelledOrder = useMemo(() => {
    return orders.some((order: any) => order.status === 'cancelled');
  }, [orders]);

  const updateSessionTimestamp = useCallback(() => {
    if (!tableNumber) return;
    try {
      localStorage.setItem(`session_timestamp_${tableNumber}`, new Date().toISOString());
    } catch (error) {
      console.error('Error updating session timestamp:', error);
    }
  }, [tableNumber]);

  const clearSession = useCallback(() => {
    if (!tableNumber) return;
    localStorage.removeItem(`cart_${tableNumber}`);
    localStorage.removeItem(`orderId_${tableNumber}`);
    localStorage.removeItem(`orderNumber_${tableNumber}`);
    localStorage.removeItem(`customerName_${tableNumber}`);
    localStorage.removeItem(`session_timestamp_${tableNumber}`);
    localStorage.removeItem(`customer_${tableNumber}`);
    localStorage.removeItem(`instructions_${tableNumber}`);
  }, [tableNumber]);

  return {
    tableNumber,
    customerName,
    setCustomerName,
    orderId,
    setOrderId,
    orderNumber,
    setOrderNumber,
    totalAmount,
    setTotalAmount,
    orders,
    setOrders,
    tableInfo,
    setTableInfo,
    orderItems,
    setOrderItems,
    hasCancelledOrder,
    updateSessionTimestamp,
    clearSession,
    CANCELLED_ORDER_TIMEOUT
  };
};
