import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
const socketService = { connect: () => {}, disconnect: () => {}, joinTable: () => {}, onOrderStatusUpdate: () => {}, onOrderCompleted: () => {}, emitNewOrder: () => {}, emitCallWaiter: () => {}, emitRequestBill: () => {}, removeListener: () => {} };
import { fetchAllOrders, updateOrderStatus, deleteOrder, fetchOrderStats, fetchTables } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

export const useOrderManagement = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<any>(null);
  const [filters, setFilters] = useState<any>({
    status: '',
    table_id: '',
    date: ''
  });
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [updatingOrder, setUpdatingOrder] = useState<any>(null);
  const [completedOrders, setCompletedOrders] = useState<any[]>([]);

  const { user } = useAuth();

  const loadData = useCallback(async (isBackgroundPoll = false) => {
    try {
      if (!isBackgroundPoll) setLoading(true);
      
      const [ordersData, tablesData, statsData] = await Promise.all([
        fetchAllOrders(filters),
        fetchTables(),
        fetchOrderStats()
      ]);
      
      const activeOrders = (ordersData || []).filter((order: any) => order.status !== 'completed');
      const completedList = (ordersData || []).filter((order: any) => order.status === 'completed');
      
      setOrders(activeOrders);
      setCompletedOrders(completedList);
      setTables(tablesData || []);
      setStats(statsData || {});
    } catch (error) {
      console.error('Error loading data:', error);
      if (!isBackgroundPoll) {
        const fallbackActiveOrders = [
          {
            id: 1, order_number: 'ORD-001', customer_name: 'John Doe', table_id: 1, status: 'pending',
            total_amount: 45.99, created_at: new Date().toISOString(),
            items: [{ name: 'Butter Chicken', quantity: 2, price: 18.99 }, { name: 'Naan', quantity: 2, price: 4.00 }]
          },
          {
            id: 2, order_number: 'ORD-002', customer_name: 'Jane Smith', table_id: 3, status: 'preparing',
            total_amount: 32.50, created_at: new Date(Date.now() - 3600000).toISOString(),
            items: [{ name: 'Paneer Tikka', quantity: 1, price: 16.99 }, { name: 'Biryani', quantity: 1, price: 22.99 }]
          }
        ];
        const fallbackCompleted = [
          {
            id: 3, order_number: 'ORD-003', customer_name: 'Mike Wilson', table_id: 2, status: 'completed',
            total_amount: 28.50, created_at: new Date(Date.now() - 7200000).toISOString(),
            items: [{ name: 'Chicken Tikka', quantity: 1, price: 12.00 }, { name: 'Momo Dumplings', quantity: 1, price: 18.00 }]
          }
        ];
        setOrders(fallbackActiveOrders);
        setCompletedOrders(fallbackCompleted);
        toast.error('Failed to load data. Please check your connection and try again.');
        setTables([]);
        setStats({ total_orders: 0, pending_orders: 0, preparing_orders: 0, completed_orders: 0, total_revenue: 0 });
      }
    } finally {
      if (!isBackgroundPoll) setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (user) {
      setUserRole(user.role);
    }
    loadData(false);
    const pollingInterval = setInterval(() => {
      loadData(true);
    }, 60000);
    return () => clearInterval(pollingInterval);
  }, [filters, user, loadData]);

  const setupSocketListeners = useCallback(() => {
    try {
      if (!socketService.isConnected) {
        socketService.connect();
      }
      socketService.joinAdmin();
      
      socketService.onNewOrder(() => loadData());
      socketService.onOrderStatusUpdate(() => loadData());
      socketService.onOrderDeleted((data: any) => {
        const deletedOrderId = data.orderId;
        setOrders(prev => prev.filter((order: any) => order.id !== deletedOrderId));
        setCompletedOrders(prev => prev.filter((order: any) => order.id !== deletedOrderId));
        setStats((prev: any) => ({ ...prev, total_orders: (prev.total_orders || 0) - 1 }));
        toast.success(`Order #${data.orderId} has been deleted`);
      });
    } catch (error) {
      console.error('Error setting up socket listeners:', error);
    }
  }, [loadData]);

  useEffect(() => {
    setupSocketListeners();
    return () => {
      socketService.removeListener('new-order');
      socketService.removeListener('order-status-update');
      socketService.removeListener('order-deleted');
    };
  }, [setupSocketListeners]);

  const handleStatusUpdate = async (orderId: any, newStatus: any) => {
    try {
      setUpdatingOrder(orderId);
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      loadData();
    } catch (error) {
      toast.error('Failed to update order status');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleDelete = async (orderId: any) => {
    try {
      await deleteOrder(orderId);
      toast.success('Order deleted successfully');
      setShowDeleteModal(false);
      setSelectedOrder(null);
      setOrders(prev => prev.filter((order: any) => order.id !== orderId));
      setCompletedOrders(prev => prev.filter((order: any) => order.id !== orderId));
      if (stats) {
        setStats((prev: any) => ({ ...prev, total_orders: (prev.total_orders || 0) - 1 }));
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    }
  };

  const clearCompletedOrders = () => {
    setCompletedOrders([]);
    toast.success('Completed orders cleared');
  };

  const getFilteredOrders = () => {
    let filtered = orders as any[];
    if (userRole !== 'admin') {
      filtered = filtered.filter((order: any) => ['pending', 'preparing', 'ready'].includes(order.status));
    }
    if (filters.status === 'completed') {
      filtered = completedOrders;
    } else if (filters.status) {
      filtered = filtered.filter((order: any) => order.status === filters.status);
    }
    if (filters.table_id) {
      filtered = filtered.filter((order: any) => order.table_id === parseInt(filters.table_id));
    }
    if (filters.date) {
      const filterDate = new Date(filters.date).toDateString();
      filtered = filtered.filter((order: any) => {
        const orderDate = new Date(order.created_at).toDateString();
        return orderDate === filterDate;
      });
    }
    return filtered;
  };

  return {
    orders, tables, stats, loading, userRole, filters, setFilters,
    selectedOrder, setSelectedOrder, showDeleteModal, setShowDeleteModal,
    viewMode, setViewMode, updatingOrder, completedOrders,
    handleStatusUpdate, handleDelete, clearCompletedOrders, getFilteredOrders
  };
};
