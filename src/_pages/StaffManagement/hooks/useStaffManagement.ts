import { useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  restoreUser,
  toggleUserStatus,
  getUserStats,
  getRolesCatalog,
  upsertRole,
  updateRolePermissions,
  resetRolePermissions,
  deleteCustomRole,
} from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import type { UserInfo, UserStats } from '@/lib/types';
import {
  ADMIN_MODULES,
  DEFAULT_SYSTEM_ROLES,
  hasModulePermission,
  type AdminModuleKey,
  type AdminModuleMeta,
  type RoleDefinition,
  type RoleTier,
} from '@/lib/rbac';
import { EMPTY_STAFF_FORM, getErrorMessage, type StaffFormData } from '../utils';

const PAGE_SIZE = 50;

const EMPTY_STATS: UserStats = {
  total: 0,
  active: 0,
  inactive: 0,
  admins: 0,
  staff: 0,
  recent: 0,
  roles: {},
};

export interface ConfirmAction {
  type: 'delete' | 'permanent_delete' | 'restore' | 'toggle';
  user: UserInfo;
  title: string;
  message: string;
  confirmText: string;
  confirmStyle: string;
  onConfirm: () => Promise<unknown>;
}

export const useStaffManagement = () => {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'team' | 'roles'>('team');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserInfo | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const [formData, setFormData] = useState<StaffFormData>(EMPTY_STAFF_FORM);

  const [searchTerm, setSearchTermState] = useState('');
  const [filterRole, setFilterRoleState] = useState('all');
  const [filterStatus, setFilterStatusState] = useState('all');

  const setSearchTerm = useCallback((value: React.SetStateAction<string>) => {
    setSearchTermState(value);
    setPage(1);
  }, []);

  const setFilterRole = useCallback((value: React.SetStateAction<string>) => {
    setFilterRoleState(value);
    setPage(1);
  }, []);

  const setFilterStatus = useCallback((value: React.SetStateAction<string>) => {
    setFilterStatusState(value);
    setPage(1);
  }, []);

  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'admin';
  const canManageStaff = isSuperAdmin || hasModulePermission(currentUser, 'staff');
  const queryClient = useQueryClient();

  const rolesQuery = useQuery({
    queryKey: ['rolesCatalog'],
    queryFn: () => getRolesCatalog(),
    enabled: Boolean(currentUser),
    retry: 1,
  });

  const rolesCatalog: Record<string, RoleDefinition> = useMemo(
    () => rolesQuery.data?.roles ?? DEFAULT_SYSTEM_ROLES,
    [rolesQuery.data]
  );

  const modules: AdminModuleMeta[] = useMemo(
    () => rolesQuery.data?.modules ?? ADMIN_MODULES,
    [rolesQuery.data]
  );

  const usersQuery = useQuery({
    queryKey: ['users', page, filterRole, filterStatus],
    queryFn: () =>
      getAllUsers({
        page,
        limit: PAGE_SIZE,
        role: filterRole !== 'all' ? filterRole : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
      }),
    enabled: canManageStaff,
    retry: 1,
    placeholderData: (previousData) => previousData,
  });

  const statsQuery = useQuery({
    queryKey: ['usersStats'],
    queryFn: () => getUserStats(),
    enabled: canManageStaff,
    retry: 1,
  });

  const loading = usersQuery.isLoading || statsQuery.isLoading;
  const error = (usersQuery.error || statsQuery.error) as Error | null;
  const users: UserInfo[] = useMemo(() => usersQuery.data?.data ?? [], [usersQuery.data]);
  const metadata = usersQuery.data?.metadata ?? { total: 0, page: 1, totalPages: 1, limit: PAGE_SIZE };
  const effectivePage = metadata.totalPages > 0 && page > metadata.totalPages ? metadata.totalPages : page;
  const stats: UserStats = statsQuery.data ?? EMPTY_STATS;

  const refetch = useCallback(() => {
    usersQuery.refetch();
    statsQuery.refetch();
    rolesQuery.refetch();
  }, [usersQuery, statsQuery, rolesQuery]);

  const resetForm = useCallback(() => {
    setFormData(EMPTY_STAFF_FORM);
  }, []);

  const invalidateStaffData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    queryClient.invalidateQueries({ queryKey: ['usersStats'] });
    queryClient.invalidateQueries({ queryKey: ['rolesCatalog'] });
  }, [queryClient]);

  const createMutation = useMutation({
    mutationFn: (data: StaffFormData) => createUser(data as never),
    onSuccess: () => {
      toast.success('User created successfully');
      setShowCreateModal(false);
      resetForm();
      invalidateStaffData();
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to create user')),
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
      phone: formData.phone.trim(),
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
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to update user')),
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
      phone: rest.phone.trim(),
    };
    if (password) updateData.password = password;
    updateMutation.mutate({ id: editingUser.id, data: updateData });
  };

  const deleteMutation = useMutation({
    mutationFn: (userId: number) => deleteUser(userId, false),
    onSuccess: () => {
      toast.success('User moved to archive');
      invalidateStaffData();
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to archive user')),
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: (userId: number) => deleteUser(userId, true),
    onSuccess: () => {
      toast.success('User permanently deleted');
      invalidateStaffData();
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to permanently delete user')),
  });

  const restoreMutation = useMutation({
    mutationFn: (userId: number) => restoreUser(userId),
    onSuccess: () => {
      toast.success('User restored to active team');
      invalidateStaffData();
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to restore user')),
  });

  const handleDeleteUser = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    setConfirmAction({
      type: 'delete',
      user,
      title: 'Archive User Account',
      message: `Are you sure you want to archive ${user.full_name || user.username}'s account? They will immediately lose access, and you can restore or permanently delete them from the Archived view.`,
      confirmText: 'Archive Account',
      confirmStyle: 'bg-red-500 hover:bg-red-600',
      onConfirm: () => deleteMutation.mutateAsync(userId),
    });
    setShowConfirmModal(true);
  };

  const handlePermanentDeleteUser = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    setConfirmAction({
      type: 'permanent_delete',
      user,
      title: 'Permanently Delete User',
      message: `Are you sure you want to permanently delete ${user.full_name || user.username}'s account from the database? This cannot be undone.`,
      confirmText: 'Delete Permanently',
      confirmStyle: 'bg-red-600 hover:bg-red-700',
      onConfirm: () => permanentDeleteMutation.mutateAsync(userId),
    });
    setShowConfirmModal(true);
  };

  const handleRestoreUser = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    setConfirmAction({
      type: 'restore',
      user,
      title: 'Restore User Account',
      message: `Restore ${user.full_name || user.username} (@${user.username}) back to the active team?`,
      confirmText: 'Restore Account',
      confirmStyle: 'bg-green-500 hover:bg-green-600',
      onConfirm: () => restoreMutation.mutateAsync(userId),
    });
    setShowConfirmModal(true);
  };

  const toggleStatusMutation = useMutation({
    mutationFn: (userId: number) => toggleUserStatus(userId),
    onSuccess: (result) => {
      toast.success(`User ${result.status} successfully`);
      invalidateStaffData();
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to update user status')),
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
      onConfirm: () => toggleStatusMutation.mutateAsync(userId),
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
      is_active: user.is_active,
    });
    setShowEditModal(true);
  };

  // RBAC Role & Permission Mutations (Super Admin)
  const upsertRoleMutation = useMutation({
    mutationFn: (data: {
      key?: string;
      label: string;
      icon?: string;
      description?: string;
      tier?: RoleTier;
      badgeColor?: string;
      permissions: string[];
    }) => upsertRole(data),
    onSuccess: (res) => {
      toast.success(`Role "${res.role.label}" saved successfully`);
      queryClient.invalidateQueries({ queryKey: ['rolesCatalog'] });
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to save role')),
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: ({ roleKey, permissions }: { roleKey: string; permissions: string[] }) =>
      updateRolePermissions(roleKey, permissions),
    onSuccess: (res) => {
      toast.success(`Updated permissions for ${res.role.label}`);
      queryClient.invalidateQueries({ queryKey: ['rolesCatalog'] });
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to update permissions')),
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (roleKey: string) => deleteCustomRole(roleKey),
    onSuccess: () => {
      toast.success('Custom role deleted');
      queryClient.invalidateQueries({ queryKey: ['rolesCatalog'] });
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to delete custom role')),
  });

  const resetRolesMutation = useMutation({
    mutationFn: () => resetRolePermissions(),
    onSuccess: () => {
      toast.success('System role permissions reset to factory defaults');
      queryClient.invalidateQueries({ queryKey: ['rolesCatalog'] });
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to reset permissions')),
  });

  const handleToggleRoleModule = useCallback(
    (roleKey: string, moduleKey: AdminModuleKey) => {
      if (!isSuperAdmin || roleKey === 'admin') return;
      const roleDef = rolesCatalog[roleKey];
      if (!roleDef) return;
      const currentPerms = roleDef.permissions || [];
      const nextPerms = currentPerms.includes(moduleKey)
        ? currentPerms.filter((p) => p !== moduleKey)
        : [...currentPerms, moduleKey];
      updatePermissionsMutation.mutate({ roleKey, permissions: nextPerms });
    },
    [isSuperAdmin, rolesCatalog, updatePermissionsMutation]
  );

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return users.filter((user) => {
      if (!isSuperAdmin && user.role === 'admin') return false;
      const matchesSearch =
        !term ||
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        (user.full_name || '').toLowerCase().includes(term);
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && user.is_active && !user.deleted_at) ||
        (filterStatus === 'inactive' && !user.is_active && !user.deleted_at) ||
        (filterStatus === 'archived' && Boolean(user.deleted_at));
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, isSuperAdmin, searchTerm, filterRole, filterStatus]);

  return {
    users,
    metadata,
    page: effectivePage,
    setPage,
    stats,
    loading,
    error,
    refetch,
    currentUser,
    isSuperAdmin,
    activeTab,
    setActiveTab,
    rolesCatalog,
    modules,
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
    handlePermanentDeleteUser,
    handleRestoreUser,
    handleToggleStatus,
    openEditModal,
    resetForm,
    isSaving: createMutation.isPending || updateMutation.isPending,
    // RBAC controls
    upsertRoleMutation,
    updatePermissionsMutation,
    deleteRoleMutation,
    resetRolesMutation,
    handleToggleRoleModule,
  };
};
