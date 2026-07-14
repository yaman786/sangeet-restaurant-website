import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@/utils/router-mock';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUserStats,
  getProfile
} from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import type { UserRow } from '@/lib/types';

export const useStaffManagement = () => {
  const [page, setPage] = useState(1);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', role: 'waiter',
    first_name: '', last_name: '', phone: '', is_active: true
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      try {
        const response: any = await getProfile();
        setCurrentUser(response.user || response);
        if ((response.user || response).role !== 'admin') {
          toast.error('Access denied. Admin role required.');
          navigate('/admin/dashboard');
          return;
        }
      } catch (error) {
        logout();
        navigate('/login');
      }
    };
    checkAuth();
  }, [isAuthenticated, navigate, logout]);

  // React Query for Users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users', page],
    queryFn: () => (getAllUsers as any)({ page, limit: 50 }),
    enabled: !!currentUser && currentUser.role === 'admin',
    placeholderData: (previousData) => previousData
  });

  // React Query for Stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['usersStats'],
    queryFn: () => getUserStats(),
    enabled: !!currentUser && currentUser.role === 'admin'
  });

  const loading = !currentUser || usersLoading || statsLoading;
  const users = (usersData as any)?.data || usersData || [];
  const metadata = (usersData as any)?.metadata || { page: 1, totalPages: 1 };
  const stats = statsData || { total: 0, active: 0, roles: {} as Record<string, number> };

  const resetForm = useCallback(() => {
    setFormData({
      username: '', email: '', password: '', role: 'waiter',
      first_name: '', last_name: '', phone: '', is_active: true
    });
  }, []);

  const createMutation = useMutation({
    mutationFn: (data: Partial<UserRow>) => createUser(data),
    onSuccess: () => {
      toast.success('User created successfully');
      setShowCreateModal(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['usersStats'] });
    },
    onError: (error: any) => toast.error(error.response?.data?.error || 'Failed to create user')
  });

  const handleCreateUser = (e: any) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password || !formData.first_name || !formData.last_name) {
      toast.error('Please fill in all required fields');
      return;
    }
    createMutation.mutate(formData as any);
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => updateUser(id, data),
    onSuccess: () => {
      toast.success('User updated successfully');
      setShowEditModal(false);
      setEditingUser(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['usersStats'] });
    },
    onError: (error: any) => toast.error(error.response?.data?.error || 'Failed to update user')
  });

  const handleUpdateUser = (e: any) => {
    e.preventDefault();
    if (!editingUser) return;
    const updateData = { ...formData };
    if (!updateData.password) delete (updateData as any).password;
    updateMutation.mutate({ id: editingUser.id, data: updateData });
  };

  const deleteMutation = useMutation({
    mutationFn: (userId: any) => deleteUser(userId),
    onSuccess: () => {
      toast.success('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['usersStats'] });
    },
    onError: (error: any) => toast.error(error.response?.data?.error || 'Failed to delete user')
  });

  const handleDeleteUser = (userId: any) => {
    const user = users.find((u: any) => u.id === userId);
    setConfirmAction({
      type: 'delete',
      user: user,
      title: 'Delete User Account',
      message: `Are you sure you want to delete ${user.first_name} ${user.last_name}'s account? This action cannot be undone.`,
      confirmText: 'Delete Account',
      confirmStyle: 'bg-red-500 hover:bg-red-600',
      onConfirm: async () => deleteMutation.mutateAsync(userId)
    });
    setShowConfirmModal(true);
  };

  const toggleStatusMutation = useMutation({
    mutationFn: (userId: any) => toggleUserStatus(userId),
    onSuccess: (_: any, userId: any) => {
      const user = users.find((u: any) => u.id === userId);
      toast.success(`User ${user.is_active ? 'disabled' : 'enabled'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['usersStats'] });
    },
    onError: (error: any) => toast.error(error.response?.data?.error || 'Failed to update user status')
  });

  const handleToggleStatus = (userId: any) => {
    const user = users.find((u: any) => u.id === userId);
    const action = user.is_active ? 'disable' : 'enable';
    setConfirmAction({
      type: 'toggle',
      user: user,
      title: `${action === 'disable' ? 'Disable' : 'Enable'} User Account`,
      message: `Are you sure you want to ${action} ${user.first_name} ${user.last_name}'s account?`,
      confirmText: `${action === 'disable' ? 'Disable' : 'Enable'} Account`,
      confirmStyle: user.is_active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600',
      onConfirm: async () => toggleStatusMutation.mutateAsync(userId)
    });
    setShowConfirmModal(true);
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone || '',
      is_active: user.is_active
    });
    setShowEditModal(true);
  };

  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && user.is_active) ||
      (filterStatus === 'inactive' && !user.is_active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  return {
    users,
    metadata,
    page,
    setPage,
    stats,
    loading,
    currentUser,
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    editingUser,
    setEditingUser,
    showConfirmModal,
    setShowConfirmModal,
    confirmAction,
    setConfirmAction,
    formData,
    setFormData,
    searchTerm,
    setSearchTerm,
    filterRole,
    setFilterRole,
    filterStatus,
    setFilterStatus,
    filteredUsers,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    handleToggleStatus,
    openEditModal,
    resetForm
  };
};
