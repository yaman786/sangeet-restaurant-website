import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  updateOrderStatus,
  deleteOrder,
  bulkUpdateOrderStatus,
  fetchAllOrders,
  fetchTables,
  getOrderById,
  archiveCompletedOrders
} from '../../../services/api';
import { pusherClient as socketService } from '@/lib/services/pusherClient';

export const useOrderManagement = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    status: '',
    table_id: '',
    date_from: '',
    date_to: '',
    query: ''
  });
  const [tables, setTables] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState('all'); 
  const [completedOrders, setCompletedOrders] = useState<any[]>([]); 
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    orderId: null,
    orderNumber: null,
    customerName: null,
    tableNumber: null
  });
  const [activeOrdersModal, setActiveOrdersModal] = useState<any>({
    isOpen: false,
    customerName: null,
    activeOrders: [],
    blockedOrderId: null
  });
  const [clearModal, setClearModal] = useState(false);

  const loadDashboardData = useCallback(async (isBackgroundPoll = false) => {
    try {
      if (!isBackgroundPoll) setLoading(true);
      
      let searchParams = { ...filters };
      if (viewMode !== 'all') {
        searchParams.status = viewMode;
      }

      const [ordersData, tablesData] = await Promise.all([
        fetchAllOrders(searchParams),
        fetchTables()
      ]);

      const activeOrdersList = (ordersData || []).filter(order => order.status !== 'completed');
      const completedOrdersList = (ordersData || []).filter(order => order.status === 'completed');

      setOrders(activeOrdersList);
      setCompletedOrders(completedOrdersList);
      setTables(tablesData);
    } catch (error: any) {
      console.error('❌ Error loading admin dashboard data:', error);
      if (!isBackgroundPoll) {
        if (error.type === 'NETWORK_ERROR') {
          toast.error('Network error: Please check your internet connection');
        } else if (error.type === 'TIMEOUT_ERROR') {
          toast.error('Request timeout: Server is taking too long to respond');
        } else if (error.status === 401) {
          toast.error('Authentication required: Please log in again');
        } else if (error.status >= 500) {
          toast.error('Server error: Please try again later');
        } else {
          toast.error('Failed to load dashboard data');
        }
      }
    } finally {
      if (!isBackgroundPoll) setLoading(false);
    }
  }, [filters, viewMode]);

  useEffect(() => {
    loadDashboardData(false);
    
    const pollingInterval = setInterval(() => {
      loadDashboardData(true);
    }, 60000);

    return () => clearInterval(pollingInterval);
  }, [loadDashboardData]);

  useEffect(() => {
    try {
      if (!socketService.isConnected) {
        socketService.connect();
      }
      socketService.joinAdminRoom();

      const handleNewOrder = (orderData: any) => {
        if (orderData && orderData.id) {
          setOrders(prevOrders => {
            if (prevOrders.some(order => order.id === orderData.id)) {
              return prevOrders;
            }
            return [orderData, ...prevOrders];
          });
          toast.success(`New order #${orderData.order_number || orderData.id} received from ${orderData.customer_name || 'Customer'}`, {
            duration: 5000,
            icon: '🔔'
          });
        } else {
          loadDashboardData();
          toast.success('New order received');
        }
      };

      const handleStatusUpdateEvent = (data: any) => {
        const { orderId, status } = data;
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === orderId
              ? { ...order, status, updated_at: new Date().toISOString() }
              : order
          )
        );
        setCompletedOrders(prevCompleted =>
          prevCompleted.map(order =>
            order.id === orderId
              ? { ...order, status, updated_at: new Date().toISOString() }
              : order
          )
        );
        if (status === 'completed') {
          setTimeout(() => {
            setOrders(prevOrders => {
              const orderToMove = prevOrders.find(order => order.id === orderId);
              if (orderToMove) {
                const updatedOrder = { ...orderToMove, status: 'completed', updated_at: new Date().toISOString() };
                setCompletedOrders(prev => [updatedOrder, ...prev]);
                return prevOrders.filter(order => order.id !== orderId);
              }
              return prevOrders;
            });
          }, 2000);
        }
      };

      const handleOrderDeletedEvent = (data: any) => {
        const deletedOrderId = data.orderId;
        setOrders(prevOrders => prevOrders.filter(order => order.id !== deletedOrderId));
        setCompletedOrders(prevCompleted => prevCompleted.filter(order => order.id !== deletedOrderId));
        setSelectedOrders(prevSelected => prevSelected.filter(id => id !== deletedOrderId));
        toast.success(`Order #${deletedOrderId} has been deleted`);
      };

      socketService.onNewOrder(handleNewOrder);
      socketService.onOrderStatusUpdate(handleStatusUpdateEvent);
      socketService.onOrderDeleted(handleOrderDeletedEvent);

      return () => {
        socketService.removeListener('new-order');
        socketService.removeListener('order-status-update');
        socketService.removeListener('order-deleted');
      };
    } catch (error: any) {
      console.error('Error setting up socket:', error);
    }
  }, [loadDashboardData]);

  const isValidStatusTransition = (currentStatus: any, newStatus: any) => {
    const statusFlow = {
      'pending': ['preparing', 'cancelled'],
      'preparing': ['ready', 'cancelled'],
      'ready': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': []
    };
    return (statusFlow as any)[currentStatus]?.includes(newStatus) || false;
  };

  const getOtherActiveOrders = (order: any) => {
    return orders.filter(o =>
      o.id !== order.id &&
      o.customer_name === order.customer_name &&
      o.status !== 'completed' &&
      o.status !== 'cancelled'
    );
  };

  const canCompleteOrder = (order: any) => {
    return getOtherActiveOrders(order).length === 0;
  };

  const showActiveOrdersModalDetails = (order: any) => {
    setActiveOrdersModal({
      isOpen: true,
      customerName: order.customer_name,
      activeOrders: getOtherActiveOrders(order),
      blockedOrderId: order.id
    });
  };

  const closeActiveOrdersModal = () => {
    setActiveOrdersModal({
      isOpen: false,
      customerName: null,
      activeOrders: [],
      blockedOrderId: null
    });
  };

  const handleStatusUpdate = async (orderId: any, newStatus: any) => {
    try {
      const currentOrder = orders.find(order => order.id === orderId) || completedOrders.find(order => order.id === orderId);
      if (!currentOrder) {
        toast.error('Order not found');
        return;
      }
      if (!isValidStatusTransition(currentOrder.status, newStatus)) {
        toast.error(`Cannot change status from "${currentOrder.status}" to "${newStatus}". Invalid transition.`);
        return;
      }

      await updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated successfully');
    } catch (error: any) {
      console.error('Error updating order status:', error);
      if (error.response?.data?.error?.includes('other active orders')) {
        const activeOrdersList = error.response.data.activeOrders;
        const customerName = error.response.data.customerName;
        toast.error(`Cannot complete order. ${customerName} has other active orders.`, { duration: 8000 });
        const listStr = activeOrdersList.map((order: any) => `Order #${order.order_number} (${order.status})`).join(', ');
        toast.success(`Active orders: ${listStr}`, { duration: 10000 });
      } else {
        toast.error('Failed to update order status');
      }
    }
  };

  const handleDeleteOrderClick = (orderId: any) => {
    const orderToDelete = orders.find((order: any) => order.id === orderId) || completedOrders.find((order: any) => order.id === orderId);
    if (orderToDelete) {
      setDeleteModal({
        isOpen: true,
        orderId: orderId,
        orderNumber: orderToDelete.order_number || orderId,
        customerName: orderToDelete.customer_name,
        tableNumber: orderToDelete.table_number
      });
    }
  };

  const confirmDeleteOrder = async () => {
    try {
      await deleteOrder(deleteModal.orderId as any);
      const deletedOrderId = deleteModal.orderId;
      setDeleteModal({ isOpen: false, orderId: null, orderNumber: null, customerName: null, tableNumber: null } as any);
      setOrders(prevOrders => prevOrders.filter((order: any) => order.id !== deletedOrderId));
      setCompletedOrders(prevCompleted => prevCompleted.filter((order: any) => order.id !== deletedOrderId));
      toast.success(`Order #${deleteModal.orderNumber} deleted successfully`);
    } catch (error: any) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    }
  };

  const cancelDeleteOrder = () => {
    setDeleteModal({ isOpen: false, orderId: null, orderNumber: null, customerName: null, tableNumber: null });
  };

  const handleViewOrderDetails = async (orderId: any) => {
    try {
      const orderDetails = await getOrderById(orderId);
      setSelectedOrderDetails(orderDetails);
      setShowOrderModal(true);
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    }
  };

  const handleBulkStatusUpdate = async (status: any) => {
    if (selectedOrders.length === 0) {
      toast.error('Please select orders to update');
      return;
    }
    try {
      await bulkUpdateOrderStatus(selectedOrders, status);
      toast.success(`${selectedOrders.length} orders updated successfully`);
      setSelectedOrders([]);
    } catch (error: any) {
      toast.error('Failed to bulk update orders');
    }
  };

  const handleClearCompletedOrdersClick = () => {
    setClearModal(true);
  };

  const confirmClearCompletedOrders = async () => {
    try {
      await archiveCompletedOrders();
      setCompletedOrders([]);
      setClearModal(false);
      toast.success('Completed orders successfully archived and cleared');
      // Optionally trigger a fresh reload to ensure state is in sync with DB
      loadDashboardData(true);
    } catch (error) {
      toast.error('Failed to clear completed orders');
      console.error(error);
    }
  };

  const cancelClearCompletedOrders = () => {
    setClearModal(false);
  };

  const handleOrderSelection = (orderId: any) => {
    const order = orders.find((o: any) => o.id === orderId) || completedOrders.find((o: any) => o.id === orderId);
    if (order && (order.status === 'completed' || order.status === 'cancelled')) {
      toast.error('Cannot select completed or cancelled orders for bulk actions');
      return;
    }
    setSelectedOrders(prev => prev.includes(orderId) ? prev.filter((id: any) => id !== orderId) : [...prev, orderId]);
  };

  const handleSelectAll = () => {
    const currentOrders = viewMode === 'completed' ? completedOrders : orders;
    const selectableOrders = currentOrders.filter((order: any) => order.status !== 'completed' && order.status !== 'cancelled');
    if (selectedOrders.length === selectableOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(selectableOrders.map((order: any) => order.id));
    }
  };

  return {
    orders,
    completedOrders,
    loading,
    selectedOrders,
    filters,
    setFilters,
    tables,
    viewMode,
    setViewMode,
    selectedOrderDetails,
    setSelectedOrderDetails,
    showOrderModal,
    setShowOrderModal,
    deleteModal,
    activeOrdersModal,
    clearModal,
    handleStatusUpdate,
    handleDeleteOrderClick,
    confirmDeleteOrder,
    cancelDeleteOrder,
    handleViewOrderDetails,
    handleBulkStatusUpdate,
    handleClearCompletedOrdersClick,
    confirmClearCompletedOrders,
    cancelClearCompletedOrders,
    handleOrderSelection,
    handleSelectAll,
    canCompleteOrder,
    showActiveOrdersModalDetails,
    closeActiveOrdersModal
  };
};
