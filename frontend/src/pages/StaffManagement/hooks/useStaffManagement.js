import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
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

export const useStaffManagement = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'waiter',
    first_name: '',
    last_name: '',
    phone: '',
    is_active: true
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const loadData = useCallback(async () => {
    try {
      const [usersResponse, statsResponse] = await Promise.all([
        getAllUsers(),
        getUserStats()
      ]);
      setUsers(usersResponse.users || []);
      setStats(statsResponse.stats || {});
    } catch (error) {
      toast.error('Failed to load staff data. Please check your connection and try again.');
      setStats({
        total: 0, active: 0, inactive: 0, admins: 0, staff: 0, recent: 0
      });
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      try {
        const response = await getProfile();
        setCurrentUser(response.user);
        if (response.user.role !== 'admin') {
          toast.error('Access denied. Admin role required.');
          navigate('/admin/dashboard');
          return;
        }
        await loadData();
      } catch (error) {
        console.error('Auth check error:', error);
        logout();
        navigate('/login');
        toast.error('Session expired. Please login again.');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [isAuthenticated, navigate, logout, loadData]);

  const resetForm = useCallback(() => {
    setFormData({
      username: '', email: '', password: '', role: 'waiter',
      first_name: '', last_name: '', phone: '', is_active: true
    });
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password || !formData.first_name || !formData.last_name) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await createUser(formData);
      toast.success('User created successfully');
      setShowCreateModal(false);
      resetForm();
      await loadData();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.response?.data?.error || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
      await updateUser(editingUser.id, updateData);
      toast.success('User updated successfully');
      setShowEditModal(false);
      setEditingUser(null);
      resetForm();
      await loadData();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.error || 'Failed to update user');
    }
  };

  const handleDeleteUser = (userId) => {
    const user = users.find(u => u.id === userId);
    setConfirmAction({
      type: 'delete',
      user: user,
      title: 'Delete User Account',
      message: `Are you sure you want to delete ${user.first_name} ${user.last_name}'s account? This action cannot be undone.`,
      confirmText: 'Delete Account',
      confirmStyle: 'bg-red-500 hover:bg-red-600',
      onConfirm: async () => {
        try {
          await deleteUser(userId);
          toast.success('User deleted successfully');
          await loadData();
        } catch (error) {
          console.error('Error deleting user:', error);
          toast.error(error.response?.data?.error || 'Failed to delete user');
        }
      }
    });
    setShowConfirmModal(true);
  };

  const handleToggleStatus = (userId) => {
    const user = users.find(u => u.id === userId);
    const action = user.is_active ? 'disable' : 'enable';
    const actionPast = user.is_active ? 'disabled' : 'enabled';
    setConfirmAction({
      type: 'toggle',
      user: user,
      title: `${action === 'disable' ? 'Disable' : 'Enable'} User Account`,
      message: `Are you sure you want to ${action} ${user.first_name} ${user.last_name}'s account? ${action === 'disable' ? 'They will lose access to the system.' : 'They will regain access to the system.'}`,
      confirmText: `${action === 'disable' ? 'Disable' : 'Enable'} Account`,
      confirmStyle: user.is_active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600',
      onConfirm: async () => {
        try {
          await toggleUserStatus(userId);
          toast.success(`User ${actionPast} successfully`);
          await loadData();
        } catch (error) {
          console.error('Error toggling user status:', error);
          toast.error(error.response?.data?.error || 'Failed to update user status');
        }
      }
    });
    setShowConfirmModal(true);
  };

  const openEditModal = (user) => {
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

  const filteredUsers = users.filter(user => {
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
