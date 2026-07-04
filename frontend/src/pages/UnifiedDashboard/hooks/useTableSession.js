import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getOrdersByTable, getTableByNumber, getOrderById } from '../../../services/api';
import socketService from '../../../services/socketService';
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

  const [customerName, setCustomerName] = useState(null);
  const [orderId, setOrderId] = useState(initialOrderId);
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [totalAmount, setTotalAmount] = useState(initialTotalAmount);
  const [orders, setOrders] = useState([]);
  const [tableInfo, setTableInfo] = useState(null);
  const [orderItems, setOrderItems] = useState([]);

  const hasCancelledOrder = useMemo(() => {
    return orders.some(order => order.status === 'cancelled');
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
