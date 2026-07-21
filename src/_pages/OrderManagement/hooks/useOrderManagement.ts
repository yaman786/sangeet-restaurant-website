import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pusherClient as socketService } from '@/lib/services/pusherClient';
import { fetchAllOrders, updateOrderStatus, deleteOrder, fetchOrderStats, fetchTables, archiveCompletedOrders } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

export const useOrderManagement = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [userRole, setUserRole] = useState<any>(null);
  const [filters, setFilters] = useState<any>({
    status: '',
    table_id: '',
    date: ''
  });
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [viewMode, setViewMode] = useState('list');

  useEffect(() => {
    if (user) {
      setUserRole(user.role);
    }
  }, [user]);

  // Data Fetching with React Query
  const { data: ordersData = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', filters],
    queryFn: () => fetchAllOrders(filters),
    refetchInterval: 60000, // Poll every minute as a fallback
  });

  const { data: tables = [], isLoading: tablesLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: fetchTables,
  });

  const { data: stats = { total_orders: 0, pending_orders: 0, preparing_orders: 0, completed_orders: 0, total_revenue: 0 } as any, isLoading: statsLoading } = useQuery({
    queryKey: ['orderStats'],
    queryFn: fetchOrderStats,
    refetchInterval: 60000,
  });

  const loading = ordersLoading || tablesLoading || statsLoading;

  const orders = (ordersData || []).filter((order: any) => order.status !== 'completed' && order.status !== 'cancelled');
  const completedOrders = (ordersData || []).filter((order: any) => order.status === 'completed' || order.status === 'cancelled');

  // Mutations
  const statusMutation = useMutation({
    mutationFn: ({ orderId, newStatus }: { orderId: any, newStatus: any }) => updateOrderStatus(orderId, newStatus),
    onMutate: async ({ orderId, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: ['orders', filters] });
      const previousOrders = queryClient.getQueryData(['orders', filters]);
      queryClient.setQueryData(['orders', filters], (old: any) => {
        if (!old) return old;
        return old.map((order: any) => 
          order.id === orderId ? { ...order, status: newStatus } : order
        );
      });
      return { previousOrders };
    },
    onSuccess: (data, variables) => {
      toast.success(`Order status updated to ${variables.newStatus}`);
      queryClient.invalidateQueries({ queryKey: ['orderStats'] });
    },
    onError: (err, variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(['orders', filters], context.previousOrders);
      }
      toast.error('Failed to update order status');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', filters] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (orderId: any) => deleteOrder(orderId),
    onSuccess: () => {
      toast.success('Order deleted successfully');
      setShowDeleteModal(false);
      setSelectedOrder(null);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orderStats'] });
    },
    onError: (error) => {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    }
  });

  const archiveMutation = useMutation({
    mutationFn: archiveCompletedOrders,
    onSuccess: () => {
      toast.success('Completed orders successfully archived');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      console.error('Error archiving completed orders:', error);
      toast.error('Failed to archive completed orders');
    }
  });

  // Socket Listeners
  const setupSocketListeners = useCallback(() => {
    try {
      if (!socketService.isConnected) {
        socketService.connect();
      }
      socketService.joinAdmin();
      
      socketService.onNewOrder(() => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['orderStats'] });
      });
      
      socketService.onOrderStatusUpdate((data: any) => {
        queryClient.setQueryData(['orders', filters], (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.map((order: any) =>
            order.id === data.orderId ? { ...order, status: data.status, updated_at: new Date().toISOString() } : order
          );
        });
        queryClient.invalidateQueries({ queryKey: ['orderStats'] });
      });
      
      socketService.onOrderDeleted((data: any) => {
        queryClient.setQueryData(['orders', filters], (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.filter((order: any) => order.id !== data.orderId);
        });
        queryClient.invalidateQueries({ queryKey: ['orderStats'] });
        toast.success(`Order #${data.orderId} has been deleted`);
      });
    } catch (error) {
      console.error('Error setting up socket listeners:', error);
    }
  }, [queryClient, filters]);

  useEffect(() => {
    setupSocketListeners();
    return () => {
      socketService.removeListener('new-order');
      socketService.removeListener('order-status-update');
      socketService.removeListener('order-deleted');
    };
  }, [setupSocketListeners]);

  // Derived filtered orders
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

  const handleStatusUpdate = (orderId: any, newStatus: any) => statusMutation.mutate({ orderId, newStatus });
  const handleDelete = (orderId: any) => deleteMutation.mutate(orderId);
  const clearCompletedOrders = () => archiveMutation.mutate();
  const updatingOrder = statusMutation.isPending ? statusMutation.variables?.orderId : null;

  return {
    orders, tables, stats, loading, userRole, filters, setFilters,
    selectedOrder, setSelectedOrder, showDeleteModal, setShowDeleteModal,
    viewMode, setViewMode, updatingOrder, completedOrders,
    handleStatusUpdate, handleDelete, clearCompletedOrders, getFilteredOrders
  };
};
