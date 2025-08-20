import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  toggleUserStatus, 
  getUserStats 
} from '../services/api';
import { getProfile } from '../services/api';
import toast from 'react-hot-toast';
import AdminHeader from '../components/AdminHeader';

const StaffManagementPage = () => {
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
    role: 'staff',
    first_name: '',
    last_name: '',
    phone: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
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
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/login');
        toast.error('Session expired. Please login again.');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [usersResponse, statsResponse] = await Promise.all([
        getAllUsers(),
        getUserStats()
      ]);
      
      setUsers(usersResponse.users || []);
      setStats(statsResponse.stats || {});
    } catch (error) {
      console.error('Error loading data:', error);
      console.log('Using fallback data - API may not be available');
      
      // Fallback data if API fails
      setUsers([
        {
          id: 1,
          username: 'admin',
          email: 'admin@sangeet.com',
          role: 'admin',
          first_name: 'Admin',
          last_name: 'User',
          phone: null,
          is_active: true,
          created_at: '2025-08-06T15:51:22.388Z'
        },
        {
          id: 4,
          username: 'kitchen',
          email: 'kitchen@sangeet.com',
          role: 'staff',
          first_name: 'Kitchen',
          last_name: 'Staff',
          phone: null,
          is_active: true,
          created_at: '2025-08-07T06:00:49.648Z'
        },
        {
          id: 5,
          username: 'chef',
          email: 'chef@sangeet.com',
          role: 'staff',
          first_name: 'Chef',
          last_name: 'Kitchen',
          phone: null,
          is_active: true,
          created_at: '2025-08-07T07:20:55.061Z'
        }
      ]);
      
      // Show error message instead of demo data
      toast.error('Failed to load staff data. Please check your connection and try again.');
      
      setStats({
        total: 0,
        active: 0,
        inactive: 0,
        admins: 0,
        staff: 0,
        recent: 0
      });
    }
  };

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
        delete updateData.password; // Don't send password if not changed
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

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'staff',
      first_name: '',
      last_name: '',
      phone: '',
      is_active: true
    });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-sangeet-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-sangeet-400">Loading staff management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sangeet-neutral-950">
      <AdminHeader showBackButton={true} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-sangeet-400 mb-2">Staff Management</h1>
          <p className="text-sangeet-neutral-400">
            Manage admin and staff accounts, roles, and permissions
          </p>
        </div>

        {/* Enhanced Stats Cards with Better Labels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <div className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-xl p-5 border border-sangeet-neutral-700 hover:border-sangeet-400/30 transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-sangeet-400/20 rounded-lg flex items-center justify-center group-hover:bg-sangeet-400/30 transition-colors">
                <span className="text-lg">👥</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-sangeet-400">{stats.total || 0}</div>
                <div className="text-xs text-sangeet-neutral-500">Total</div>
              </div>
            </div>
            <div className="text-sm text-sangeet-neutral-200 font-medium">All Team Members</div>
            <div className="text-xs text-sangeet-neutral-400 mt-1">Everyone in your restaurant</div>
          </div>
          
          <div className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-xl p-5 border border-sangeet-neutral-700 hover:border-green-400/30 transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center group-hover:bg-green-400/30 transition-colors">
                <span className="text-lg">✅</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">{stats.active || 0}</div>
                <div className="text-xs text-green-300">Active</div>
              </div>
            </div>
            <div className="text-sm text-sangeet-neutral-200 font-medium">Active Users</div>
            <div className="text-xs text-sangeet-neutral-400 mt-1">Can access the system</div>
          </div>
          
          <div className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-xl p-5 border border-sangeet-neutral-700 hover:border-red-400/30 transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-red-400/20 rounded-lg flex items-center justify-center group-hover:bg-red-400/30 transition-colors">
                <span className="text-lg">🚫</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">{stats.inactive || 0}</div>
                <div className="text-xs text-red-300">Inactive</div>
              </div>
            </div>
            <div className="text-sm text-sangeet-neutral-200 font-medium">Inactive Users</div>
            <div className="text-xs text-sangeet-neutral-400 mt-1">Account disabled</div>
          </div>
          
          <div className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-xl p-5 border border-sangeet-neutral-700 hover:border-purple-400/30 transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-purple-400/20 rounded-lg flex items-center justify-center group-hover:bg-purple-400/30 transition-colors">
                <span className="text-lg">👑</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">{stats.admins || 0}</div>
                <div className="text-xs text-purple-300">Admins</div>
              </div>
            </div>
            <div className="text-sm text-sangeet-neutral-200 font-medium">Administrators</div>
            <div className="text-xs text-sangeet-neutral-400 mt-1">Full system access</div>
          </div>
          
          <div className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-xl p-5 border border-sangeet-neutral-700 hover:border-blue-400/30 transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-400/20 rounded-lg flex items-center justify-center group-hover:bg-blue-400/30 transition-colors">
                <span className="text-lg">👤</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">{stats.staff || 0}</div>
                <div className="text-xs text-blue-300">Staff</div>
              </div>
            </div>
            <div className="text-sm text-sangeet-neutral-200 font-medium">Staff Members</div>
            <div className="text-xs text-sangeet-neutral-400 mt-1">Kitchen & service access</div>
          </div>
          
          <div className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-xl p-5 border border-sangeet-neutral-700 hover:border-orange-400/30 transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-orange-400/20 rounded-lg flex items-center justify-center group-hover:bg-orange-400/30 transition-colors">
                <span className="text-lg">🆕</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-400">{stats.recent || 0}</div>
                <div className="text-xs text-orange-300">New</div>
              </div>
            </div>
            <div className="text-sm text-sangeet-neutral-200 font-medium">Recent Additions</div>
            <div className="text-xs text-sangeet-neutral-400 mt-1">Added in last 30 days</div>
          </div>
        </div>

        {/* Enhanced Controls */}
        <div className="bg-sangeet-neutral-900 rounded-xl p-6 border border-sangeet-neutral-700 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-sangeet-neutral-500">🔍</span>
                </div>
                <input
                  type="text"
                  placeholder="Search by name, username, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 placeholder-sangeet-neutral-400 focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400/20 focus:outline-none transition-all duration-200"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sangeet-neutral-400 hover:text-sangeet-neutral-200"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex gap-3">
              <div className="relative">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="appearance-none px-4 py-3 pr-8 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400/20 focus:outline-none transition-all duration-200 cursor-pointer"
                >
                  <option value="all">👥 All Roles</option>
                  <option value="admin">👑 Admin</option>
                  <option value="staff">👤 Staff</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-sangeet-neutral-400">▼</span>
                </div>
              </div>
              
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="appearance-none px-4 py-3 pr-8 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400/20 focus:outline-none transition-all duration-200 cursor-pointer"
                >
                  <option value="all">📊 All Status</option>
                  <option value="active">✅ Active</option>
                  <option value="inactive">⏸️ Inactive</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-sangeet-neutral-400">▼</span>
                </div>
              </div>
            </div>
            
            {/* Add User Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-sangeet-400 to-sangeet-300 text-sangeet-neutral-950 font-semibold rounded-lg hover:from-sangeet-300 hover:to-sangeet-200 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-sangeet-400/25 flex items-center gap-2 whitespace-nowrap"
            >
              <span className="text-lg">➕</span>
              Add New User
            </button>
          </div>
          
          {/* Filter Summary */}
          {(searchTerm || filterRole !== 'all' || filterStatus !== 'all') && (
            <div className="mt-4 pt-4 border-t border-sangeet-neutral-700">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-sangeet-neutral-400">Active filters:</span>
                {searchTerm && (
                  <span className="px-3 py-1 bg-sangeet-400/20 text-sangeet-400 rounded-full text-sm flex items-center gap-1">
                    🔍 "{searchTerm}"
                    <button onClick={() => setSearchTerm('')} className="hover:text-sangeet-300">✕</button>
                  </span>
                )}
                {filterRole !== 'all' && (
                  <span className="px-3 py-1 bg-purple-400/20 text-purple-400 rounded-full text-sm flex items-center gap-1">
                    {filterRole === 'admin' ? '👑' : '👤'} {filterRole}
                    <button onClick={() => setFilterRole('all')} className="hover:text-purple-300">✕</button>
                  </span>
                )}
                {filterStatus !== 'all' && (
                  <span className="px-3 py-1 bg-blue-400/20 text-blue-400 rounded-full text-sm flex items-center gap-1">
                    {filterStatus === 'active' ? '✅' : '⏸️'} {filterStatus}
                    <button onClick={() => setFilterStatus('all')} className="hover:text-blue-300">✕</button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterRole('all');
                    setFilterStatus('all');
                  }}
                  className="px-3 py-1 bg-sangeet-neutral-700 text-sangeet-neutral-300 rounded-full text-sm hover:bg-sangeet-neutral-600 transition-colors"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Users Table */}
        <div className="bg-sangeet-neutral-900 rounded-xl border border-sangeet-neutral-700 overflow-hidden shadow-xl">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-sangeet-neutral-800 to-sangeet-neutral-750 px-6 py-4 border-b border-sangeet-neutral-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-sangeet-neutral-100 flex items-center gap-2">
                <span>👥</span>
                Team Members
                <span className="text-sm font-normal text-sangeet-neutral-400">
                  ({filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'})
                </span>
              </h3>
              {filteredUsers.length > 0 && (
                <div className="text-sm text-sangeet-neutral-400">
                  Showing {filteredUsers.length} of {users.length} users
                </div>
              )}
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-sangeet-neutral-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-sangeet-neutral-300 uppercase tracking-wider">
                    User Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-sangeet-neutral-300 uppercase tracking-wider">
                    Role & Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-sangeet-neutral-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-sangeet-neutral-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sangeet-neutral-700/50">
                {filteredUsers.map((user, index) => (
                  <tr key={user.id} className="hover:bg-sangeet-neutral-800/30 transition-colors duration-200 group">
                    {/* User Details */}
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-sangeet-400/20 to-sangeet-400/10 rounded-full flex items-center justify-center border border-sangeet-400/20">
                            <span className="text-lg font-semibold text-sangeet-400">
                              {user.first_name[0]}{user.last_name[0]}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-sangeet-neutral-100 truncate">
                              {user.first_name} {user.last_name}
                            </p>
                            {user.id === currentUser?.id && (
                              <span className="px-2 py-0.5 text-xs bg-sangeet-400/20 text-sangeet-400 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-sangeet-neutral-400 truncate">
                            @{user.username} • {user.email}
                          </p>
                          {user.phone && (
                            <p className="text-xs text-sangeet-neutral-500 mt-1 flex items-center gap-1">
                              <span>📞</span> {user.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Role & Status */}
                    <td className="px-6 py-5">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'admin' 
                              ? 'bg-purple-400/20 text-purple-400 border border-purple-400/30' 
                              : 'bg-blue-400/20 text-blue-400 border border-blue-400/30'
                          }`}>
                            <span className="mr-1">{user.role === 'admin' ? '👑' : '👤'}</span>
                            {user.role === 'admin' ? 'Administrator' : 'Staff Member'}
                          </span>
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                            user.is_active 
                              ? 'bg-green-400/20 text-green-400 border border-green-400/30' 
                              : 'bg-red-400/20 text-red-400 border border-red-400/30'
                          }`}>
                            <span className="mr-1">{user.is_active ? '✅' : '🚫'}</span>
                            {user.is_active ? 'Active Account' : 'Disabled Account'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className="px-6 py-5">
                      <div className="text-sm text-sangeet-neutral-400">
                        <div>{new Date(user.created_at).toLocaleDateString()}</div>
                        <div className="text-xs text-sangeet-neutral-500 mt-1">
                          {new Date(user.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="px-3 py-2 text-sangeet-400 hover:text-sangeet-300 hover:bg-sangeet-400/10 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                        >
                          <span>✏️</span>
                          Edit
                        </button>
                        
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium ${
                            user.is_active 
                              ? 'text-red-400 hover:text-red-300 hover:bg-red-400/10' 
                              : 'text-green-400 hover:text-green-300 hover:bg-green-400/10'
                          } ${user.id === currentUser?.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={user.id === currentUser?.id}
                        >
                          <span>{user.is_active ? '🚫' : '✅'}</span>
                          {user.is_active ? 'Disable' : 'Enable'}
                        </button>
                        
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className={`px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium ${
                            user.id === currentUser?.id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          disabled={user.id === currentUser?.id}
                        >
                          <span>🗑️</span>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Enhanced Empty State */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">
                {searchTerm || filterRole !== 'all' || filterStatus !== 'all' ? '🔍' : '👥'}
              </div>
              <h3 className="text-xl font-semibold text-sangeet-neutral-200 mb-3">
                {searchTerm || filterRole !== 'all' || filterStatus !== 'all' 
                  ? 'No matching users found'
                  : 'No team members yet'
                }
              </h3>
              <p className="text-sangeet-neutral-400 mb-6 max-w-md mx-auto">
                {searchTerm || filterRole !== 'all' || filterStatus !== 'all' 
                  ? 'Try adjusting your search terms or filters to find the team member you\'re looking for.'
                  : 'Start building your team by adding administrators and staff members who will help manage your restaurant operations.'
                }
              </p>
              {(!searchTerm && filterRole === 'all' && filterStatus === 'all') ? (
                <div className="space-y-4">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-8 py-3 bg-gradient-to-r from-sangeet-400 to-sangeet-300 text-sangeet-neutral-950 font-semibold rounded-lg hover:from-sangeet-300 hover:to-sangeet-200 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center gap-2 mx-auto"
                  >
                    <span>➕</span>
                    Add Your First Team Member
                  </button>
                  <div className="text-xs text-sangeet-neutral-500 max-w-sm mx-auto">
                    You can add administrators (full access) or staff members (kitchen access)
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterRole('all');
                    setFilterStatus('all');
                  }}
                  className="px-6 py-2 bg-sangeet-neutral-700 text-sangeet-neutral-300 rounded-lg hover:bg-sangeet-neutral-600 transition-colors flex items-center gap-2 mx-auto"
                >
                  <span>🔄</span>
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Enhanced Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-2xl border border-sangeet-neutral-600 w-full max-w-lg mx-4 shadow-2xl transform transition-all duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-sangeet-neutral-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sangeet-400/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">👤</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-sangeet-400">Create New User</h2>
                  <p className="text-sm text-sangeet-neutral-400">Add a new team member to your restaurant</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="p-2 text-sangeet-neutral-400 hover:text-sangeet-neutral-200 hover:bg-sangeet-neutral-700 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            {/* Modal Body */}
            <form onSubmit={handleCreateUser} className="p-6 space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-sangeet-neutral-200 uppercase tracking-wider flex items-center gap-2">
                  <span>👤</span> Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 placeholder-sangeet-neutral-400 focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400/20 focus:outline-none transition-all duration-200"
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 placeholder-sangeet-neutral-400 focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400/20 focus:outline-none transition-all duration-200"
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 placeholder-sangeet-neutral-400 focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400/20 focus:outline-none transition-all duration-200"
                    placeholder="Enter phone number (optional)"
                  />
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-sangeet-neutral-200 uppercase tracking-wider flex items-center gap-2">
                  <span>🔐</span> Account Information
                </h3>
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 placeholder-sangeet-neutral-400 focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400/20 focus:outline-none transition-all duration-200"
                    placeholder="Enter username"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 placeholder-sangeet-neutral-400 focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400/20 focus:outline-none transition-all duration-200"
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 placeholder-sangeet-neutral-400 focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400/20 focus:outline-none transition-all duration-200"
                    placeholder="Enter secure password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                    Role *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400/20 focus:outline-none transition-all duration-200 appearance-none cursor-pointer"
                      required
                    >
                      <option value="staff">👤 Staff Member</option>
                      <option value="admin">👑 Administrator</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-sangeet-neutral-400">▼</span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-sangeet-neutral-500">
                    Staff can access kitchen display, Admins have full access
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-sangeet-neutral-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 bg-sangeet-neutral-700 text-sangeet-neutral-300 font-semibold rounded-lg hover:bg-sangeet-neutral-600 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-sangeet-400 to-sangeet-300 text-sangeet-neutral-950 font-semibold rounded-lg hover:from-sangeet-300 hover:to-sangeet-200 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-2xl border border-sangeet-neutral-600 w-full max-w-2xl mx-4 shadow-2xl transform transition-all duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-sangeet-neutral-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-sangeet-400/20 to-sangeet-400/10 rounded-full flex items-center justify-center border border-sangeet-400/20">
                  <span className="text-lg font-semibold text-sangeet-400">
                    {editingUser.first_name[0]}{editingUser.last_name[0]}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-sangeet-400">Edit User</h2>
                  <p className="text-sm text-sangeet-neutral-400">Update {editingUser.first_name}'s information</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                  resetForm();
                }}
                className="p-2 text-sangeet-neutral-400 hover:text-sangeet-neutral-200 hover:bg-sangeet-neutral-700 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            {/* Modal Body */}
            <form onSubmit={handleUpdateUser} className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    className="w-full px-3 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-md text-sangeet-neutral-100 focus:border-sangeet-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className="w-full px-3 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-md text-sangeet-neutral-100 focus:border-sangeet-400 focus:outline-none"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full px-3 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-md text-sangeet-neutral-100 focus:border-sangeet-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-md text-sangeet-neutral-100 focus:border-sangeet-400 focus:outline-none"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-md text-sangeet-neutral-100 focus:border-sangeet-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-3 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-md text-sangeet-neutral-100 focus:border-sangeet-400 focus:outline-none"
                    required
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">
                    Status *
                  </label>
                  <select
                    value={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.value === 'true'})}
                    className="w-full px-3 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-md text-sangeet-neutral-100 focus:border-sangeet-400 focus:outline-none"
                    required
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-md text-sangeet-neutral-100 focus:border-sangeet-400 focus:outline-none"
                />
              </div>
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-sangeet-neutral-700 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 bg-sangeet-neutral-700 text-sangeet-neutral-300 font-semibold rounded-lg hover:bg-sangeet-neutral-600 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-sangeet-400 to-sangeet-300 text-sangeet-neutral-950 font-semibold rounded-lg hover:from-sangeet-300 hover:to-sangeet-200 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                >
                  <span>Update User</span>
                  <span className="text-sm">💾</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Professional Confirmation Modal */}
      {showConfirmModal && confirmAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-2xl border border-sangeet-neutral-600 w-full max-w-md mx-4 shadow-2xl transform transition-all duration-300">
            {/* Modal Header */}
            <div className="flex items-center gap-4 p-6 border-b border-sangeet-neutral-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-sangeet-400/20 to-sangeet-400/10 rounded-full flex items-center justify-center border border-sangeet-400/20">
                  <span className="text-lg font-semibold text-sangeet-400">
                    {confirmAction.user?.first_name[0]}{confirmAction.user?.last_name[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-sangeet-400">{confirmAction.title}</h3>
                  <p className="text-sm text-sangeet-neutral-400">
                    {confirmAction.user?.first_name} {confirmAction.user?.last_name}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-sangeet-neutral-300 leading-relaxed">
                {confirmAction.message}
              </p>
              
              {confirmAction.type === 'delete' && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
                    <span>⚠️</span>
                    Warning: This action cannot be undone
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 p-6 border-t border-sangeet-neutral-700">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmAction(null);
                }}
                className="flex-1 px-6 py-3 bg-sangeet-neutral-700 text-sangeet-neutral-300 font-semibold rounded-lg hover:bg-sangeet-neutral-600 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowConfirmModal(false);
                  await confirmAction.onConfirm();
                  setConfirmAction(null);
                }}
                className={`flex-1 px-6 py-3 text-white font-semibold rounded-lg transition-all duration-200 ${confirmAction.confirmStyle}`}
              >
                {confirmAction.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagementPage;