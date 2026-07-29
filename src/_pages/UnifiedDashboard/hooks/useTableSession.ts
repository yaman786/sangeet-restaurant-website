import { useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from '@/utils/router-mock';
import { getTableSession, clearTableSession as clearConsolidatedTableSession } from '@/lib/utils/tableSession';

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
      const session = getTableSession();
      if (session?.customerName) return session.customerName;
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
    // Session timestamp is automatically handled in saveTableSession
  }, []);

  const clearSession = useCallback(() => {
    clearConsolidatedTableSession();
  }, []);

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
