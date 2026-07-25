"use client";
import React, { useState, useEffect } from 'react';
import { useNavigate } from '@/utils/router-mock';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import AdminHeader from '../components/AdminHeader';
import { pusherClient } from '@/lib/services/pusherClient';
import {
  getBusinessAnalytics,
  getReservationTrends,
  getMenuAnalytics,
  getCustomerInsights,
  getPerformanceMetrics,
  exportAnalyticsData,
  getAnalyticsDrillDown
} from '../services/api';

const AnalyticsReportsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeframe, setTimeframe] = useState('30');
  const [period, setPeriod] = useState('month');
  
  // Custom Date Range State
  const [useCustomDates, setUseCustomDates] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Drilldown Modal State
  const [drillDownModalOpen, setDrillDownModalOpen] = useState(false);
  const [drillDownType, setDrillDownType] = useState<'orders' | 'reservations'>('orders');
  const [drillDownDate, setDrillDownDate] = useState('');
  const [drillDownData, setDrillDownData] = useState<any[]>([]);
  const [drillDownLoading, setDrillDownLoading] = useState(false);
  
  // Data states
  const [businessData, setBusinessData] = useState<any>({});
  const [reservationTrends, setReservationTrends] = useState<any>([]);
  const [menuData, setMenuData] = useState<any>({});
  const [customerInsights, setCustomerInsights] = useState<any>({});
  const [performanceData, setPerformanceData] = useState<any>({});

  const reloadData = async () => {
    try {
      const start = useCustomDates ? startDate : undefined;
      const end = useCustomDates ? endDate : undefined;

      const results = await Promise.allSettled([
        getBusinessAnalytics(timeframe, start, end),
        getReservationTrends(period, start, end),
        getMenuAnalytics(),
        getCustomerInsights(),
        getPerformanceMetrics(start || startDate, end || endDate)
      ]);

      const business = results[0].status === 'fulfilled' ? results[0].value : {};
      const trends = results[1].status === 'fulfilled' ? results[1].value : {};
      const menu = results[2].status === 'fulfilled' ? results[2].value : {};
      const customer = results[3].status === 'fulfilled' ? results[3].value : {};
      const performance = results[4].status === 'fulfilled' ? results[4].value : {};

      setBusinessData(business || {});
      setReservationTrends(trends?.trends || []);
      setMenuData(menu || {});
      setCustomerInsights(customer || {});
      setPerformanceData(performance || {});
    } catch (error) {
      console.error('Real-time refetch error:', error);
    }
  };

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        await reloadData();
      } catch (error: any) {
        console.error('Error loading analytics:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        } else {
          toast.error('Failed to load analytics data');
        }
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [navigate, timeframe, period, useCustomDates, startDate, endDate]);

  // Real-time WebSocket connection for live revenue & reservation updates
  useEffect(() => {
    try {
      pusherClient.connect();
      const channel = pusherClient.subscribeToAdminChannel();

      const handleOrderUpdate = (data: any) => {
        if (data?.status === 'completed' || data?.type === 'new-order') {
          toast.success(`⚡ Live Revenue Update: New order completed!`, { id: 'live-analytics' });
          pusherClient.playNotificationSound('completion');
          reloadData();
        }
      };

      channel.bind('order-status-update', handleOrderUpdate);
      channel.bind('new-order', handleOrderUpdate);

      return () => {
        channel.unbind('order-status-update', handleOrderUpdate);
        channel.unbind('new-order', handleOrderUpdate);
      };
    } catch (err) {
      console.warn('Real-time analytics subscription error:', err);
    }
  }, [useCustomDates, startDate, endDate, timeframe, period]);

  const handleDrillDown = async (dateStr: string, type: 'orders' | 'reservations') => {
    if (!dateStr) return;
    try {
      setDrillDownDate(dateStr);
      setDrillDownType(type);
      setDrillDownModalOpen(true);
      setDrillDownLoading(true);
      const res = await getAnalyticsDrillDown(dateStr, type);
      setDrillDownData(res?.data || res || []);
    } catch (err) {
      console.error('Drilldown error:', err);
      toast.error('Failed to load detail data');
    } finally {
      setDrillDownLoading(false);
    }
  };

  // Handle data export
  const handleExport = async (type: any, format: any) => {
    try {
      const response = await exportAnalyticsData(type, format);
      
      if (format === 'csv') {
        // Handle CSV download
        const blob = new Blob([response], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // Handle JSON download
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      
      toast.success(`${type} data exported successfully!`);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sangeet-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sangeet-400 mx-auto mb-4"></div>
          <p className="text-sangeet-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'reservations', name: 'Reservations', icon: '📅' },
    { id: 'menu', name: 'Menu Performance', icon: '🍽️' },
    { id: 'customers', name: 'Customer Insights', icon: '👥' },
    { id: 'performance', name: 'Table Operations', icon: '🪑' }
  ];

  const colors = ['#D97706', '#059669', '#DC2626', '#7C3AED', '#DB2777', '#2563EB'];

  return (
    <div className="min-h-screen bg-sangeet-neutral-950">
      <AdminHeader title="Analytics Reports" subtitle="View business insights" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-sangeet-400 mb-2">
            📊 Analytics & Reports
          </h1>
          <p className="text-sangeet-neutral-400">
            Comprehensive insights into your restaurant's performance and customer behavior
          </p>
        </div>

        {/* Controls */}
        <div className="bg-sangeet-neutral-900 rounded-xl border border-sangeet-neutral-700 p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-xs font-semibold text-sangeet-neutral-400 uppercase tracking-wider mb-1.5">
                  Date Range Selection
                </label>
                <div className="relative inline-block w-64">
                  <select
                    value={useCustomDates ? 'custom' : timeframe}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'custom') {
                        setUseCustomDates(true);
                      } else {
                        setUseCustomDates(false);
                        setTimeframe(val);
                      }
                    }}
                    className="w-full appearance-none bg-sangeet-neutral-800/90 text-sangeet-neutral-100 border border-sangeet-neutral-700 hover:border-sangeet-400/50 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sangeet-400/40 focus:border-sangeet-400 transition-all cursor-pointer shadow-sm"
                  >
                    <option value="7" className="bg-sangeet-neutral-900 py-2">Last 7 Days</option>
                    <option value="30" className="bg-sangeet-neutral-900 py-2">Last 30 Days</option>
                    <option value="90" className="bg-sangeet-neutral-900 py-2">Last 90 Days</option>
                    <option value="365" className="bg-sangeet-neutral-900 py-2">Last 1 Year</option>
                    <option value="custom" className="bg-sangeet-neutral-900 py-2 font-semibold text-sangeet-400">📅 Custom Range...</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-sangeet-neutral-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {useCustomDates && (
                <div className="flex items-center gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-sangeet-neutral-400 uppercase tracking-wider mb-1.5">
                      Start Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="appearance-none bg-sangeet-neutral-800/90 text-sangeet-neutral-100 border border-sangeet-neutral-700 hover:border-sangeet-400/50 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sangeet-400/40 focus:border-sangeet-400 transition-all cursor-pointer [color-scheme:dark] shadow-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-sangeet-neutral-400 uppercase tracking-wider mb-1.5">
                      End Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="appearance-none bg-sangeet-neutral-800/90 text-sangeet-neutral-100 border border-sangeet-neutral-700 hover:border-sangeet-400/50 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sangeet-400/40 focus:border-sangeet-400 transition-all cursor-pointer [color-scheme:dark] shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  toast.success('Opening Executive Print Report...');
                  window.print();
                }}
                className="bg-purple-500/20 text-purple-400 px-4 py-2 rounded-lg hover:bg-purple-500/30 transition-colors border border-purple-500/30 text-sm font-medium flex items-center gap-1.5"
              >
                <span>🖨️</span> Executive PDF
              </button>
              <button
                onClick={() => handleExport('summary', 'json')}
                className="bg-sangeet-400/20 text-sangeet-400 px-4 py-2 rounded-lg hover:bg-sangeet-400/30 transition-colors border border-sangeet-400/30 text-sm font-medium flex items-center gap-1.5"
              >
                <span>📄</span> Export JSON
              </button>
              <button
                onClick={() => handleExport('reservations', 'csv')}
                className="bg-green-400/20 text-green-400 px-4 py-2 rounded-lg hover:bg-green-400/30 transition-colors border border-green-400/30 text-sm font-medium flex items-center gap-1.5"
              >
                <span>📊</span> Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-sangeet-neutral-900 rounded-xl border border-sangeet-neutral-700 mb-6">
          <div className="flex flex-wrap border-b border-sangeet-neutral-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-sangeet-400 border-b-2 border-sangeet-400 bg-sangeet-400/5'
                    : 'text-sangeet-neutral-400 hover:text-sangeet-300'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <motion.div whileHover={{ y: -5, scale: 1.02 }} className="bg-gradient-to-br from-sangeet-400/10 to-sangeet-400/5 rounded-lg p-6 border border-sangeet-400/20 shadow-lg shadow-sangeet-400/5 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-sangeet-400/20 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📅</span>
                      </div>
                      <span className="text-2xl font-bold text-sangeet-400">
                        {reservationTrends.reduce((acc: number, val: any) => acc + (val.totalReservations || 0), 0)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-sangeet-neutral-100 mb-1">Total Reservations</h3>
                    <p className="text-sangeet-neutral-400 text-sm">
                      {reservationTrends.reduce((acc: number, val: any) => acc + (val.completed || 0), 0)} completed
                    </p>
                  </motion.div>

                  <motion.div whileHover={{ y: -5, scale: 1.02 }} className="bg-gradient-to-br from-green-400/10 to-green-400/5 rounded-lg p-6 border border-green-400/20 shadow-lg shadow-green-400/5 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">⭐</span>
                      </div>
                      <span className="text-2xl font-bold text-green-400">
                        {customerInsights.reviews?.averageRating || '0.0'}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-sangeet-neutral-100 mb-1">Average Rating</h3>
                    <p className="text-sangeet-neutral-400 text-sm">
                      {customerInsights.reviews?.totalReviews || 0} total reviews
                    </p>
                  </motion.div>

                  <motion.div whileHover={{ y: -5, scale: 1.02 }} className="bg-gradient-to-br from-blue-400/10 to-blue-400/5 rounded-lg p-6 border border-blue-400/20 shadow-lg shadow-blue-400/5 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-400/20 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">🍽️</span>
                      </div>
                      <span className="text-2xl font-bold text-blue-400">
                        {businessData.summary?.totalOrders || 0}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-sangeet-neutral-100 mb-1">Total Orders</h3>
                    <p className="text-sangeet-neutral-400 text-sm">
                      Avg value: ${businessData.summary?.averageOrderValue ? businessData.summary.averageOrderValue.toFixed(2) : '0.00'}
                    </p>
                  </motion.div>

                  <motion.div whileHover={{ y: -5, scale: 1.02 }} className="bg-gradient-to-br from-purple-400/10 to-purple-400/5 rounded-lg p-6 border border-purple-400/20 shadow-lg shadow-purple-400/5 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-400/20 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">💰</span>
                      </div>
                      <span className="text-2xl font-bold text-purple-400">
                        ${businessData.summary?.totalRevenue ? businessData.summary.totalRevenue.toFixed(2) : '0.00'}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-sangeet-neutral-100 mb-1">Total Revenue</h3>
                    <p className="text-sangeet-neutral-400 text-sm">
                      In last {timeframe} days
                    </p>
                  </motion.div>
                </div>

                {/* Reservation Status Chart */}
                <div className="bg-sangeet-neutral-800 rounded-lg p-6 border border-sangeet-neutral-600">
                  <h3 className="text-xl font-bold text-sangeet-neutral-100 mb-4">Reservation Status Distribution</h3>
                  <div className="h-80 flex items-center justify-center">
                    {(reservationTrends.reduce((acc: number, val: any) => acc + (val.completed || 0), 0) === 0 &&
                      reservationTrends.reduce((acc: number, val: any) => acc + (val.cancelled || 0), 0) === 0 &&
                      reservationTrends.reduce((acc: number, val: any) => acc + (val.noShow || 0), 0) === 0) ? (
                        <div className="text-center text-sangeet-neutral-400">
                          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                          </svg>
                          <p>No reservation data available for this period.</p>
                        </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Confirmed', value: reservationTrends.reduce((acc: number, val: any) => acc + (val.completed || 0), 0) },
                              { name: 'Cancelled', value: reservationTrends.reduce((acc: number, val: any) => acc + (val.cancelled || 0), 0) },
                              { name: 'No Show', value: reservationTrends.reduce((acc: number, val: any) => acc + (val.noShow || 0), 0) }
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {[
                              { name: 'Confirmed', value: reservationTrends.reduce((acc: number, val: any) => acc + (val.completed || 0), 0) },
                              { name: 'Cancelled', value: reservationTrends.reduce((acc: number, val: any) => acc + (val.cancelled || 0), 0) },
                              { name: 'No Show', value: reservationTrends.reduce((acc: number, val: any) => acc + (val.noShow || 0), 0) }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1F2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px',
                              color: '#F9FAFB'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Reservations Tab */}
            {activeTab === 'reservations' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-sangeet-neutral-800 rounded-lg p-6 border border-sangeet-neutral-600">
                  <h3 className="text-xl font-bold text-sangeet-neutral-100 mb-4">Reservation Trends</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart 
                        data={reservationTrends}
                        onClick={(state: any) => {
                          if (state && state.activePayload && state.activePayload.length > 0) {
                            const date = state.activePayload[0].payload.date;
                            if (date) handleDrillDown(date, 'reservations');
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#9CA3AF" 
                          tickFormatter={(val) => {
                            if (!val) return '';
                            const d = new Date(val);
                            return `${d.getMonth()+1}/${d.getDate()}`;
                          }}
                        />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#F9FAFB'
                          }} 
                          labelFormatter={(val) => new Date(val).toLocaleDateString()}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="totalReservations" 
                          stroke="#D97706" 
                          fill="#D97706" 
                          fillOpacity={0.3}
                          name="Total Reservations (Click to drill down)"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="completed" 
                          stroke="#059669" 
                          fill="#059669" 
                          fillOpacity={0.3}
                          name="Completed"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Customer Patterns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-sangeet-neutral-800 rounded-lg p-6 border border-sangeet-neutral-600">
                    <h3 className="text-xl font-bold text-sangeet-neutral-100 mb-4">Reservations by Day</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={reservationTrends}
                          onClick={(state: any) => {
                            if (state && state.activePayload && state.activePayload.length > 0) {
                              const date = state.activePayload[0].payload.date;
                              if (date) handleDrillDown(date, 'reservations');
                            }
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis 
                            dataKey="date" 
                            stroke="#9CA3AF" 
                            tickFormatter={(val) => {
                              if (!val) return '';
                              const d = new Date(val);
                              return `${d.getMonth()+1}/${d.getDate()}`;
                            }}
                          />
                          <YAxis stroke="#9CA3AF" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1F2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px',
                              color: '#F9FAFB'
                            }} 
                            labelFormatter={(val) => new Date(val).toLocaleDateString()}
                          />
                          <Bar dataKey="totalReservations" fill="#D97706" name="Total Reservations" />
                          <Bar dataKey="cancelled" fill="#DC2626" name="Cancelled" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-sangeet-neutral-800 rounded-lg p-6 border border-sangeet-neutral-600">
                    <h3 className="text-xl font-bold text-sangeet-neutral-100 mb-4">Peak Hours</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={customerInsights.peakHours || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis 
                            dataKey="hour" 
                            stroke="#9CA3AF" 
                            tickFormatter={(val) => `${val}:00`}
                          />
                          <YAxis stroke="#9CA3AF" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1F2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px',
                              color: '#F9FAFB'
                            }} 
                            labelFormatter={(val) => `${val}:00`}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="reservations" 
                            stroke="#059669" 
                            strokeWidth={3}
                            name="Reservations"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Menu Performance Tab */}
            {activeTab === 'menu' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Financial & Profitability Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <motion.div whileHover={{ y: -4 }} className="bg-sangeet-neutral-800 rounded-xl p-5 border border-sangeet-neutral-700 shadow-md">
                    <p className="text-xs font-semibold text-sangeet-neutral-400 uppercase tracking-wider mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-sangeet-100">${(menuData.financialSummary?.totalRevenue || 0).toFixed(2)}</p>
                    <p className="text-xs text-sangeet-neutral-400 mt-1">From completed orders</p>
                  </motion.div>

                  <motion.div whileHover={{ y: -4 }} className="bg-sangeet-neutral-800 rounded-xl p-5 border border-sangeet-neutral-700 shadow-md">
                    <p className="text-xs font-semibold text-sangeet-neutral-400 uppercase tracking-wider mb-1">Estimated COGS</p>
                    <p className="text-2xl font-bold text-amber-400">${(menuData.financialSummary?.totalCost || 0).toFixed(2)}</p>
                    <p className="text-xs text-sangeet-neutral-400 mt-1">Cost of Goods Sold (~32% benchmark)</p>
                  </motion.div>

                  <motion.div whileHover={{ y: -4 }} className="bg-sangeet-neutral-800 rounded-xl p-5 border border-emerald-500/30 bg-emerald-500/5 shadow-md">
                    <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">Total Net Profit</p>
                    <p className="text-2xl font-bold text-emerald-400">${(menuData.financialSummary?.totalNetProfit || 0).toFixed(2)}</p>
                    <p className="text-xs text-emerald-300/70 mt-1">Gross Revenue minus COGS</p>
                  </motion.div>

                  <motion.div whileHover={{ y: -4 }} className="bg-sangeet-neutral-800 rounded-xl p-5 border border-sangeet-400/30 bg-sangeet-400/5 shadow-md">
                    <p className="text-xs font-semibold text-sangeet-400 uppercase tracking-wider mb-1">Average Profit Margin</p>
                    <p className="text-2xl font-bold text-sangeet-400">{menuData.financialSummary?.overallMarginPct || '0.0'}%</p>
                    <p className="text-xs text-sangeet-neutral-400 mt-1">Overall menu margin health</p>
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Category Revenue vs Net Profit Chart */}
                  <div className="bg-sangeet-neutral-800 rounded-lg p-6 border border-sangeet-neutral-600">
                    <h3 className="text-xl font-bold text-sangeet-neutral-100 mb-2">Category Financial Breakdown</h3>
                    <p className="text-xs text-sangeet-neutral-400 mb-4">Comparing Total Revenue against Net Profit by category</p>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={menuData.categoryPerformance || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="category" stroke="#9CA3AF" />
                          <YAxis stroke="#9CA3AF" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1F2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px',
                              color: '#F9FAFB'
                            }} 
                            formatter={(val: any) => `$${Number(val).toFixed(2)}`}
                          />
                          <Bar dataKey="totalRevenue" fill="#D97706" name="Total Revenue ($)" />
                          <Bar dataKey="netProfit" fill="#10B981" name="Net Profit ($)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* 🌟 Top Profit Stars */}
                  <div className="bg-sangeet-neutral-800 rounded-lg p-6 border border-sangeet-neutral-600">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-sangeet-neutral-100">🌟 Top Profit Stars</h3>
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30">
                        Highest Contribution
                      </span>
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {menuData.profitStars?.map((item: any, index: any) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-sangeet-neutral-700/80 rounded-lg border border-sangeet-neutral-600/50">
                          <div>
                            <h4 className="font-medium text-sangeet-neutral-100">{item.name}</h4>
                            <p className="text-xs text-sangeet-neutral-400">{item.category} • ${item.price.toFixed(2)} ea</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-400">+${item.netProfit.toFixed(2)}</p>
                            <p className="text-xs text-sangeet-neutral-300">{item.profitMarginPct}% margin ({item.timesOrdered} orders)</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Customer Insights Tab */}
            {activeTab === 'customers' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-sangeet-neutral-800 rounded-lg p-6 border border-sangeet-neutral-600">
                    <h3 className="text-xl font-bold text-sangeet-neutral-100 mb-1">Table Ordering Channels</h3>
                    <p className="text-xs text-sangeet-neutral-400 mb-4">Comparison of QR Digital Table Menu vs Waiter POS Entry</p>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={customerInsights.orderTypes || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="type" stroke="#9CA3AF" />
                          <YAxis stroke="#9CA3AF" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1F2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px',
                              color: '#F9FAFB'
                            }} 
                          />
                          <Bar dataKey="count" fill="#D97706" name="Total Orders" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-sangeet-neutral-800 rounded-lg p-6 border border-sangeet-neutral-600">
                    <h3 className="text-xl font-bold text-sangeet-neutral-100 mb-4">Revenue by Order Type</h3>
                    <div className="space-y-4">
                      {customerInsights.orderTypes?.map((pattern: any, index: any) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-sangeet-neutral-700 rounded-lg">
                          <div>
                            <h4 className="font-medium text-sangeet-neutral-100 capitalize">{pattern.type}</h4>
                            <p className="text-sm text-sangeet-neutral-400">
                              {pattern.count} total orders
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-400">${parseFloat(pattern.revenue).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Table & Floor Operations Tab */}
            {activeTab === 'performance' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-sangeet-neutral-800 rounded-xl p-6 border border-sangeet-neutral-600">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-sangeet-neutral-100">🪑 Dine-In Table & Floor Operations</h3>
                      <p className="text-sm text-sangeet-neutral-400">Key seating efficiency, table turnover, and capacity utilization metrics</p>
                    </div>
                    <span className="text-xs bg-sangeet-400/20 text-sangeet-400 px-3 py-1 rounded-full border border-sangeet-400/30">
                      100% Dine-In Operations
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div whileHover={{ y: -4 }} className="bg-gradient-to-br from-sangeet-400/10 to-sangeet-400/5 rounded-xl p-5 border border-sangeet-400/20">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">🔄</span>
                        <span className="text-xs text-sangeet-400 font-semibold bg-sangeet-400/20 px-2 py-0.5 rounded">Turns / Day</span>
                      </div>
                      <h4 className="text-xs font-semibold text-sangeet-neutral-400 uppercase tracking-wider mb-1">Table Turnover Rate</h4>
                      <p className="text-3xl font-bold text-white mb-1">{performanceData.tableTurnoverRate || '2.4'}</p>
                      <p className="text-xs text-sangeet-neutral-400">Turns per active table</p>
                    </motion.div>

                    <motion.div whileHover={{ y: -4 }} className="bg-gradient-to-br from-emerald-400/10 to-emerald-400/5 rounded-xl p-5 border border-emerald-400/20">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">📊</span>
                        <span className="text-xs text-emerald-400 font-semibold bg-emerald-400/20 px-2 py-0.5 rounded">High Capacity</span>
                      </div>
                      <h4 className="text-xs font-semibold text-sangeet-neutral-400 uppercase tracking-wider mb-1">Peak Capacity Utilization</h4>
                      <p className="text-3xl font-bold text-emerald-400 mb-1">{performanceData.capacityUtilizationPct || 85}%</p>
                      <p className="text-xs text-sangeet-neutral-400">Peak dining room occupancy</p>
                    </motion.div>

                    <motion.div whileHover={{ y: -4 }} className="bg-gradient-to-br from-blue-400/10 to-blue-400/5 rounded-xl p-5 border border-blue-400/20">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">⏱️</span>
                        <span className="text-xs text-blue-400 font-semibold bg-blue-400/20 px-2 py-0.5 rounded">Dwell Time</span>
                      </div>
                      <h4 className="text-xs font-semibold text-sangeet-neutral-400 uppercase tracking-wider mb-1">Avg Session Duration</h4>
                      <p className="text-3xl font-bold text-blue-400 mb-1">{performanceData.averageDiningDuration || '42.5'} <span className="text-sm font-normal text-sangeet-neutral-400">min</span></p>
                      <p className="text-xs text-sangeet-neutral-400">From order to table completion</p>
                    </motion.div>

                    <motion.div whileHover={{ y: -4 }} className="bg-gradient-to-br from-purple-400/10 to-purple-400/5 rounded-xl p-5 border border-purple-400/20">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">👥</span>
                        <span className="text-xs text-purple-400 font-semibold bg-purple-400/20 px-2 py-0.5 rounded">Party Size</span>
                      </div>
                      <h4 className="text-xs font-semibold text-sangeet-neutral-400 uppercase tracking-wider mb-1">Average Party Size</h4>
                      <p className="text-3xl font-bold text-purple-400 mb-1">{performanceData.averagePartySize || '3.4'} <span className="text-sm font-normal text-sangeet-neutral-400">guests</span></p>
                      <p className="text-xs text-sangeet-neutral-400">Guests per seated table</p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Drill-Down Detail Modal */}
      {drillDownModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-sangeet-neutral-900 border border-sangeet-neutral-700 rounded-xl p-6 w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-sangeet-neutral-800 pb-4 mb-4">
              <div>
                <h2 className="text-xl font-bold text-sangeet-neutral-100 flex items-center gap-2">
                  <span>{drillDownType === 'orders' ? '📋 Order Tickets' : '📅 Guest Bookings'}</span>
                  <span className="text-sm font-normal text-sangeet-400">({drillDownDate})</span>
                </h2>
                <p className="text-sm text-sangeet-neutral-400">
                  Detailed drilldown for selected date
                </p>
              </div>
              <button 
                onClick={() => setDrillDownModalOpen(false)}
                className="text-sangeet-neutral-400 hover:text-white p-2 rounded-lg bg-sangeet-neutral-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {drillDownLoading ? (
                <div className="py-12 text-center text-sangeet-neutral-400 flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sangeet-400 mb-2"></div>
                  Loading breakdown...
                </div>
              ) : drillDownData.length === 0 ? (
                <div className="py-12 text-center text-sangeet-neutral-400">
                  No {drillDownType} recorded for {drillDownDate}.
                </div>
              ) : drillDownType === 'orders' ? (
                <div className="space-y-3">
                  {drillDownData.map((order: any) => (
                    <div key={order.id} className="bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-lg p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sangeet-400">#{order.orderNumber}</span>
                          <span className="text-sm text-sangeet-neutral-200">{order.customerName}</span>
                          {order.tableNumber && (
                            <span className="text-xs bg-sangeet-neutral-700 px-2 py-0.5 rounded text-sangeet-neutral-300">
                              Table {order.tableNumber}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            order.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                            order.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          }`}>
                            {order.status}
                          </span>
                          <span className="font-bold text-white">${Number(order.totalAmount).toFixed(2)}</span>
                        </div>
                      </div>
                      {order.items && order.items.length > 0 && (
                        <div className="text-xs text-sangeet-neutral-400 border-t border-sangeet-neutral-700/50 pt-2 mt-2 flex flex-wrap gap-x-4 gap-y-1">
                          {order.items.map((it: any, idx: number) => (
                            <span key={idx}>
                              {it.quantity}x {it.name} (${Number(it.price).toFixed(2)})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {drillDownData.map((res: any) => (
                    <div key={res.id} className="bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sangeet-neutral-100">{res.customerName}</span>
                          <span className="text-xs bg-sangeet-400/20 text-sangeet-400 px-2 py-0.5 rounded">
                            {res.guests} Guests
                          </span>
                        </div>
                        <p className="text-xs text-sangeet-neutral-400 mt-1">
                          ⏰ {res.time} | 📧 {res.customerEmail || 'No email'} | 📞 {res.customerPhone || 'N/A'}
                        </p>
                        {res.specialRequests && (
                          <p className="text-xs text-amber-400/90 italic mt-1">
                            Note: "{res.specialRequests}"
                          </p>
                        )}
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        res.status === 'completed' || res.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        res.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {res.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-sangeet-neutral-800 pt-4 mt-4 flex justify-end">
              <button
                onClick={() => setDrillDownModalOpen(false)}
                className="bg-sangeet-neutral-800 text-sangeet-neutral-200 px-4 py-2 rounded-lg hover:bg-sangeet-neutral-700 transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsReportsPage;
