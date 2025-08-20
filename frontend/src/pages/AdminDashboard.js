import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getProfile } from '../services/api';
import toast from 'react-hot-toast';
import AdminHeader from '../components/AdminHeader';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // QR stats are loaded but not currently displayed in the dashboard
  // const [qrStats, setQrStats] = useState({
  //   totalTables: 0,
  //   totalCustom: 0,
  //   totalOrders: 0,
  //   totalRevenue: 0,
  //   activeTables: 0
  // });
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
        setUser(response.user);
      } catch (error) {
        console.error('Auth check error:', error);
        console.log('Using fallback user data - API may not be available');
        
        // Check if it's an authentication error
        if (error.status === 401 || error.message?.includes('token')) {
          console.log('Authentication failed - redirecting to login');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          navigate('/login');
          toast.error('Session expired. Please login again.');
          return;
        }
        
        // Fallback user data if API fails for other reasons
        const fallbackUser = {
          first_name: 'Admin',
          last_name: 'User',
          email: 'admin@sangeet.com',
          role: 'admin'
        };
        setUser(fallbackUser);
        
        // Don't redirect to login if we have a token, just use fallback data
        // This allows the dashboard to work even if the API is temporarily unavailable
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);



  if (loading) {
    return (
      <div className="min-h-screen bg-sangeet-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-sangeet-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sangeet-neutral-950">
      <AdminHeader showBackButton={false} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-sangeet-400 mb-2">
            Welcome back, {user?.first_name}! 👋
          </h2>
          <p className="text-sangeet-neutral-400">
            Manage your restaurant operations from this central dashboard.
          </p>
        </div>
        {/* --- Dashboard is now clean. Add new UI/UX here. --- */}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {/* Order Management */}
          <div className="bg-sangeet-neutral-900 rounded-xl p-6 border border-sangeet-neutral-700 hover:border-sangeet-400/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-sangeet-400/20 rounded-lg flex items-center justify-center group-hover:bg-sangeet-400/30 transition-colors">
                <span className="text-2xl">📋</span>
              </div>
              <span className="text-sangeet-neutral-500 text-sm">Admin</span>
            </div>
            <h3 className="text-xl font-bold text-sangeet-neutral-100 mb-2">Order Management</h3>
            <p className="text-sangeet-neutral-400 text-sm mb-4">
              Administrative control: view all orders, analytics, customer data, and business reports
            </p>
            <Link
              to="/admin/orders"
              className="inline-flex items-center text-sangeet-400 hover:text-sangeet-300 font-medium text-sm group-hover:underline"
            >
              Manage Orders
              <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {/* Kitchen Access */}
          <div className="bg-sangeet-neutral-900 rounded-xl p-6 border border-sangeet-neutral-700 hover:border-sangeet-400/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-400/20 rounded-lg flex items-center justify-center group-hover:bg-orange-400/30 transition-colors">
                <span className="text-2xl">🍳</span>
              </div>
              <span className="text-sangeet-neutral-500 text-sm">Kitchen</span>
            </div>
            <h3 className="text-xl font-bold text-sangeet-neutral-100 mb-2">Kitchen Display</h3>
            <p className="text-sangeet-neutral-400 text-sm mb-4">
              Real-time kitchen operations: live order queue, touch-friendly interface for staff
            </p>
            <Link
              to="/kitchen/display"
              className="inline-flex items-center text-sangeet-400 hover:text-sangeet-300 font-medium text-sm group-hover:underline"
            >
              Open Kitchen Display
              <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>



          {/* Menu Management */}
          <div className="bg-sangeet-neutral-900 rounded-xl p-6 border border-sangeet-neutral-700 hover:border-sangeet-400/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-sangeet-400/20 rounded-lg flex items-center justify-center group-hover:bg-sangeet-400/30 transition-colors">
                <span className="text-2xl">🍽️</span>
              </div>
              <span className="text-sangeet-neutral-500 text-sm">Menu</span>
            </div>
            <h3 className="text-xl font-bold text-sangeet-neutral-100 mb-2">Menu Management</h3>
            <p className="text-sangeet-neutral-400 text-sm mb-4">
              Add, edit, and organize menu items, categories, and manage your restaurant's offerings
            </p>
            <Link
              to="/admin/menu-management"
              className="inline-flex items-center text-sangeet-400 hover:text-sangeet-300 font-medium text-sm group-hover:underline"
            >
              Manage Menu
              <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {/* QR Code Management */}
          <div className="bg-sangeet-neutral-900 rounded-xl p-6 border border-sangeet-neutral-700 hover:border-sangeet-400/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-sangeet-400/20 rounded-lg flex items-center justify-center group-hover:bg-sangeet-400/30 transition-colors">
                <span className="text-2xl">📱</span>
              </div>
              <span className="text-sangeet-neutral-500 text-sm">QR Codes</span>
            </div>
            <h3 className="text-xl font-bold text-sangeet-neutral-100 mb-2">QR Code Management</h3>
            <p className="text-sangeet-neutral-400 text-sm mb-4">
              Generate and manage QR codes for tables, track usage analytics, and customize QR experiences
            </p>
            <Link
              to="/admin/qr-management"
              className="inline-flex items-center text-sangeet-400 hover:text-sangeet-300 font-medium text-sm group-hover:underline"
            >
              Manage QR Codes
              <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>



          {/* Reservation Management */}
          <div className="bg-sangeet-neutral-900 rounded-xl p-6 border border-sangeet-neutral-700 hover:border-sangeet-400/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center group-hover:bg-green-400/30 transition-colors">
                <span className="text-2xl">📅</span>
              </div>
              <span className="text-sangeet-neutral-500 text-sm">Reservations</span>
            </div>
            <h3 className="text-xl font-bold text-sangeet-neutral-100 mb-2">Reservation Management</h3>
            <p className="text-sangeet-neutral-400 text-sm mb-4">
              Manage table reservations, confirm bookings, and track customer appointments
            </p>
            <Link
              to="/admin/reservations"
              className="inline-flex items-center text-sangeet-400 hover:text-sangeet-300 font-medium text-sm group-hover:underline"
            >
              Manage Reservations
              <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {/* Staff Management */}
          <div className="bg-sangeet-neutral-900 rounded-xl p-6 border border-sangeet-neutral-700 hover:border-sangeet-400/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-sangeet-400/20 rounded-lg flex items-center justify-center group-hover:bg-sangeet-400/30 transition-colors">
                <span className="text-2xl">👥</span>
              </div>
              <span className="text-sangeet-neutral-500 text-sm">Staff</span>
            </div>
            <h3 className="text-xl font-bold text-sangeet-neutral-100 mb-2">Staff Management</h3>
            <p className="text-sangeet-neutral-400 text-sm mb-4">
              Manage admin and staff accounts, roles, permissions, and user activity tracking
            </p>
            <Link
              to="/admin/staff-management"
              className="inline-flex items-center text-sangeet-400 hover:text-sangeet-300 font-medium text-sm group-hover:underline"
            >
              Manage Staff
              <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {/* Analytics Dashboard */}
          <div className="bg-sangeet-neutral-900 rounded-xl p-6 border border-sangeet-neutral-700 hover:border-sangeet-400/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-sangeet-400/20 rounded-lg flex items-center justify-center group-hover:bg-sangeet-400/30 transition-colors">
                <span className="text-2xl">📊</span>
              </div>
              <span className="text-sangeet-neutral-500 text-sm">Analytics</span>
            </div>
            <h3 className="text-xl font-bold text-sangeet-neutral-100 mb-2">Analytics & Reports</h3>
            <p className="text-sangeet-neutral-400 text-sm mb-4">
              View sales reports, order analytics, performance metrics, and business insights
            </p>
            <Link
              to="/admin/analytics"
              className="inline-flex items-center text-sangeet-400 hover:text-sangeet-300 font-medium text-sm group-hover:underline"
            >
              View Analytics
              <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {/* Restaurant Website */}
          <div className="bg-sangeet-neutral-900 rounded-xl p-6 border border-sangeet-neutral-700 hover:border-sangeet-400/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-sangeet-400/20 rounded-lg flex items-center justify-center group-hover:bg-sangeet-400/30 transition-colors">
                <span className="text-2xl">🌐</span>
              </div>
              <span className="text-sangeet-neutral-500 text-sm">Website</span>
            </div>
            <h3 className="text-xl font-bold text-sangeet-neutral-100 mb-2">Restaurant Website</h3>
            <p className="text-sangeet-neutral-400 text-sm mb-4">
              Manage your main restaurant website, menu display, and customer-facing content
            </p>
            <Link
              to="/admin/website-management"
              className="inline-flex items-center text-sangeet-400 hover:text-sangeet-300 font-medium text-sm group-hover:underline"
            >
              Manage Website
              <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard; 