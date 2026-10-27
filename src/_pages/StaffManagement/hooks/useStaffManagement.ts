import { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUserStats
} from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import type { UserInfo, UserStats } from '@/lib/types';
import { EMPTY_STAFF_FORM, getErrorMessage, type StaffFormData } from '../utils';

const PAGE_SIZE = 50;

const EMPTY_STATS: UserStats = {
  total: 0, active: 0, inactive: 0, admins: 0, staff: 0, recent: 0, roles: {}
};

export interface ConfirmAction {
  type: 'delete' | 'toggle';
  user: UserInfo;
  title: string;
  message: string;
  confirmText: string;
  confirmStyle: string;
  onConfirm: () => Promise<unknown>;
}

export const useStaffManagement = () => {
  const [page, setPage] = useState(1);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserInfo | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const [formData, setFormData] = useState<StaffFormData>(EMPTY_STAFF_FORM);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Identity comes from AuthContext (verified against /api/auth/me). A failed data request
  // must never be treated as an expired session; real 401/403 responses are handled
  // centrally by the API client interceptor.
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ['users', page],
    queryFn: () => getAllUsers({ page, limit: PAGE_SIZE }),
    enabled: isAdmin,
    retry: 1,
    placeholderData: (previousData) => previousData
  });

  const statsQuery = useQuery({
    queryKey: ['usersStats'],
    queryFn: () => getUserStats(),
    enabled: isAdmin,
    retry: 1
  });

  const loading = usersQuery.isLoading || statsQuery.isLoading;
  const error = (usersQuery.error || statsQuery.error) as Error | null;
  const users: UserInfo[] = useMemo(() => usersQuery.data?.data ?? [], [usersQuery.data]);
  const metadata = usersQuery.data?.metadata ?? { total: 0, page: 1, totalPages: 1, limit: PAGE_SIZE };
  const stats: UserStats = statsQuery.data ?? EMPTY_STATS;

  const refetch = useCallback(() => {
    usersQuery.refetch();
    statsQuery.refetch();
  }, [usersQuery, statsQuery]);

  // If the last user on the final page is removed, step back to a page that exists.
  useEffect(() => {
    if (metadata.totalPages > 0 && page > metadata.totalPages) {
      setPage(metadata.totalPages);
    }
  }, [metadata.totalPages, page]);

  const resetForm = useCallback(() => {
    setFormData(EMPTY_STAFF_FORM);
  }, []);

  const invalidateStaffData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    queryClient.invalidateQueries({ queryKey: ['usersStats'] });
  }, [queryClient]);

  const createMutation = useMutation({
    mutationFn: (data: StaffFormData) => createUser(data as never),
    onSuccess: () => {
      toast.success('User created successfully');
      setShowCreateModal(false);
      resetForm();
      invalidateStaffData();
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to create user'))
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.email.trim() || !formData.password || !formData.full_name.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    createMutation.mutate({
      ...formData,
      username: formData.username.trim(),
      email: formData.email.trim(),
      full_name: formData.full_name.trim(),
      phone: formData.phone.trim()
    });
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<StaffFormData> }) => updateUser(id, data as never),
    onSuccess: () => {
      toast.success('User updated successfully');
      setShowEditModal(false);
      setEditingUser(null);
      resetForm();
      invalidateStaffData();
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to update user'))
  });

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const { password, ...rest } = formData;
    const updateData: Partial<StaffFormData> = {
      ...rest,
      username: rest.username.trim(),
      email: rest.email.trim(),
      full_name: rest.full_name.trim(),
      phone: rest.phone.trim()
    };
    if (password) updateData.password = password;
    updateMutation.mutate({ id: editingUser.id, data: updateData });
  };

  const deleteMutation = useMutation({
    mutationFn: (userId: number) => deleteUser(userId),
    onSuccess: () => {
      toast.success('User deleted successfully');
      invalidateStaffData();
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to delete user'))
  });

  const handleDeleteUser = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    setConfirmAction({
      type: 'delete',
      user,
      title: 'Delete User Account',
      message: `Are you sure you want to delete ${user.full_name || user.username}'s account? They will immediately lose access to the system.`,
      confirmText: 'Delete Account',
      confirmStyle: 'bg-red-500 hover:bg-red-600',
      onConfirm: () => deleteMutation.mutateAsync(userId)
    });
    setShowConfirmModal(true);
  };

  const toggleStatusMutation = useMutation({
    mutationFn: (userId: number) => toggleUserStatus(userId),
    onSuccess: (result) => {
      toast.success(`User ${result.status} successfully`);
      invalidateStaffData();
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to update user status'))
  });

  const handleToggleStatus = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    const action = user.is_active ? 'disable' : 'enable';
    setConfirmAction({
      type: 'toggle',
      user,
      title: `${action === 'disable' ? 'Disable' : 'Enable'} User Account`,
      message: `Are you sure you want to ${action} ${user.full_name || user.username}'s account?`,
      confirmText: `${action === 'disable' ? 'Disable' : 'Enable'} Account`,
      confirmStyle: user.is_active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600',
      onConfirm: () => toggleStatusMutation.mutateAsync(userId)
    });
    setShowConfirmModal(true);
  };

  const openEditModal = (user: UserInfo) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      full_name: user.full_name || '',
      phone: user.phone || '',
      is_active: user.is_active
    });
    setShowEditModal(true);
  };

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch = !term ||
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        (user.full_name || '').toLowerCase().includes(term);
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      const matchesStatus = filterStatus === 'all' ||
        (filterStatus === 'active' && user.is_active) ||
        (filterStatus === 'inactive' && !user.is_active);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, filterRole, filterStatus]);

  return {
    users,
    metadata,
    page,
    setPage,
    stats,
    loading,
    error,
    refetch,
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
    resetForm,
    isSaving: createMutation.isPending || updateMutation.isPending
  };
};
