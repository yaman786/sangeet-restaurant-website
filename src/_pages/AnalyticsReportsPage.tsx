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
import {
  getBusinessAnalytics,
  getReservationTrends,
  getMenuAnalytics,
  getCustomerInsights,
  getPerformanceMetrics,
  exportAnalyticsData
} from '../services/api';

const AnalyticsReportsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeframe, setTimeframe] = useState('30');
  const [period, setPeriod] = useState('month');
  
  // Data states
  const [businessData, setBusinessData] = useState<any>({});
  const [reservationTrends, setReservationTrends] = useState<any>([]);
  const [menuData, setMenuData] = useState<any>({});
  const [customerInsights, setCustomerInsights] = useState<any>({});
  const [performanceData, setPerformanceData] = useState<any>({});

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        // Calculate default date range (last 30 days)
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const results = await Promise.allSettled([
          getBusinessAnalytics(timeframe),
          getReservationTrends(period),
          getMenuAnalytics(),
          getCustomerInsights(),
          getPerformanceMetrics(startDate, endDate)
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
  }, [navigate, timeframe, period]);

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
    { id: 'performance', name: 'Performance', icon: '📈' }
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
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">
                  Timeframe
                </label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg px-3 py-2 text-sangeet-neutral-100 focus:outline-none focus:ring-2 focus:ring-sangeet-400"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">
                  Period
                </label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg px-3 py-2 text-sangeet-neutral-100 focus:outline-none focus:ring-2 focus:ring-sangeet-400"
                >
                  <option value="week">Weekly</option>
                  <option value="month">Monthly</option>
                  <option value="year">Yearly</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleExport('summary', 'json')}
                className="bg-sangeet-400/20 text-sangeet-400 px-4 py-2 rounded-lg hover:bg-sangeet-400/30 transition-colors border border-sangeet-400/30"
              >
                📄 Export JSON
              </button>
              <button
                onClick={() => handleExport('reservations', 'csv')}
                className="bg-green-400/20 text-green-400 px-4 py-2 rounded-lg hover:bg-green-400/30 transition-colors border border-green-400/30"
              >
                📊 Export CSV
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
                  <div className="h-80">
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
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
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
                      <AreaChart data={reservationTrends}>
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
                          name="Total Reservations"
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
                        <BarChart data={reservationTrends}>
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-sangeet-neutral-800 rounded-lg p-6 border border-sangeet-neutral-600">
                    <h3 className="text-xl font-bold text-sangeet-neutral-100 mb-4">Category Performance</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={menuData.categoryPerformance || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="category" stroke="#9CA3AF" />
                          <YAxis yAxisId="left" stroke="#9CA3AF" />
                          <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1F2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px',
                              color: '#F9FAFB'
                            }} 
                          />
                          <Bar yAxisId="left" dataKey="total_orders" fill="#7C3AED" name="Total Orders" />
                          <Bar yAxisId="right" dataKey="total_revenue" fill="#D97706" name="Revenue ($)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-sangeet-neutral-800 rounded-lg p-6 border border-sangeet-neutral-600">
                    <h3 className="text-xl font-bold text-sangeet-neutral-100 mb-4">Popular Items</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {menuData.topSellingItems?.map((item: any, index: any) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-sangeet-neutral-700 rounded-lg">
                          <div>
                            <h4 className="font-medium text-sangeet-neutral-100">{item.name}</h4>
                            <p className="text-sm text-sangeet-neutral-400">{item.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sangeet-400">{Number(item.times_ordered)} orders</p>
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
                    <h3 className="text-xl font-bold text-sangeet-neutral-100 mb-4">Order Types</h3>
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

            {/* Performance Tab */}
            {activeTab === 'performance' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-sangeet-neutral-800 rounded-lg p-6 border border-sangeet-neutral-600">
                  <h3 className="text-xl font-bold text-sangeet-neutral-100 mb-4">Kitchen Performance</h3>
                  <div className="flex items-center gap-4">
                     <div className="text-4xl font-bold text-sangeet-400">
                       {performanceData.averagePreparationTime || '0.0'} min
                     </div>
                     <p className="text-sangeet-neutral-300">Average Preparation Time</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnalyticsReportsPage;
