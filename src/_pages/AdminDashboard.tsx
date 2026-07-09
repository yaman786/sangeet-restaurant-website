"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useNavigate } from '@/utils/router-mock';
import { getProfile } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import AdminHeader from '../components/AdminHeader';

const AdminDashboard = () => {
  const [user, setUser] = useState<any>(null);
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

  const { user: authUser, isAuthenticated, logout }: any = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      try {
        // Try to get latest user data from API
        const userData = await getProfile();
        setUser((userData as any).user);
      } catch (error) {
        // Fallback to context user if API fails
        if (authUser) {
          setUser(authUser);
        } else {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, navigate, authUser]);



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
      <AdminHeader title="Admin Dashboard" subtitle="Overview" showBackButton={false} />

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
          {(user?.role === 'admin' || user?.role === 'reception' || user?.role === 'waiter') && (
            <div className="bg-sangeet-neutral-900 rounded-xl p-6 border border-sangeet-neutral-700 hover:border-sangeet-400/50 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-sangeet-400/20 rounded-lg flex items-center justify-center group-hover:bg-sangeet-400/30 transition-colors">
                  <span className="text-2xl">📋</span>
                </div>
                <span className="text-sangeet-neutral-500 text-sm">Orders</span>
              </div>
              <h3 className="text-xl font-bold text-sangeet-neutral-100 mb-2">Order Management</h3>
              <p className="text-sangeet-neutral-400 text-sm mb-4">
                View all orders, customer data, and current operational status
              </p>
              <Link href="/admin/orders"
                className="inline-flex items-center text-sangeet-400 hover:text-sangeet-300 font-medium text-sm group-hover:underline"
              >
                Manage Orders
                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          )}

          {/* Kitchen Access */}
          {(user?.role === 'admin' || user?.role === 'kitchen' || user?.role === 'waiter') && (
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
              <Link href="/kitchen/display"
                className="inline-flex items-center text-sangeet-400 hover:text-sangeet-300 font-medium text-sm group-hover:underline"
              >
                Open Kitchen Display
                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          )}



          {/* Menu Management */}
          {user?.role === 'admin' && (
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
              <Link href="/admin/menu-management"
                className="inline-flex items-center text-sangeet-400 hover:text-sangeet-300 font-medium text-sm group-hover:underline"
              >
                Manage Menu
                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          )}

          {/* QR Code Management */}
          {user?.role === 'admin' && (
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
              <Link href="/admin/qr-management"
                className="inline-flex items-center text-sangeet-400 hover:text-sangeet-300 font-medium text-sm group-hover:underline"
              >
                Manage QR Codes
                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          )}



          {/* Reservation Management */}
          {(user?.role === 'admin' || user?.role === 'reception') && (
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
              <Link href="/admin/reservations"
                className="inline-flex items-center text-sangeet-400 hover:text-sangeet-300 font-medium text-sm group-hover:underline"
              >
                Manage Reservations
                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          )}

          {/* Staff Management */}
          {user?.role === 'admin' && (
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
              <Link href="/admin/staff-management"
                className="inline-flex items-center text-sangeet-400 hover:text-sangeet-300 font-medium text-sm group-hover:underline"
              >
                Manage Staff
                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          )}

          {/* History & Archives */}
          {(user?.role === 'admin' || user?.role === 'reception') && (
            <div className="bg-sangeet-neutral-900 rounded-xl p-6 border border-sangeet-neutral-700 hover:border-sangeet-400/50 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-sangeet-400/20 rounded-lg flex items-center justify-center group-hover:bg-sangeet-400/30 transition-colors">
                  <span className="text-2xl">🗄️</span>
                </div>
                <span className="text-sangeet-neutral-500 text-sm">History</span>
              </div>
              <h3 className="text-xl font-bold text-sangeet-neutral-100 mb-2">History & Archives</h3>
              <p className="text-sangeet-neutral-400 text-sm mb-4">
                Browse archived records, search past orders, and view historical reservations
              </p>
              <Link href="/admin/history"
                className="inline-flex items-center text-sangeet-400 hover:text-sangeet-300 font-medium text-sm group-hover:underline"
              >
                Browse History
                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          )}

          {/* Analytics Dashboard */}
          {user?.role === 'admin' && (
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
              <Link href="/admin/analytics"
                className="inline-flex items-center text-sangeet-400 hover:text-sangeet-300 font-medium text-sm group-hover:underline"
              >
                View Analytics
                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          )}

          {/* Restaurant Website */}
          {user?.role === 'admin' && (
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
              <Link href="/admin/website-management"
                className="inline-flex items-center text-sangeet-400 hover:text-sangeet-300 font-medium text-sm group-hover:underline"
              >
                Manage Website
                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard; 