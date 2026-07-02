import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { toast } from 'react-hot-toast';
import AdminHeader from '../components/AdminHeader';
import { fetchAllOrders, fetchAllReservations } from '../services/api';

const HistoryDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'reservations'
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    loadHistoryData();
  }, [activeTab, filters]);

  const loadHistoryData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'orders') {
        const orders = await fetchAllOrders({ 
          history: true, 
          startDate: filters.startDate, 
          endDate: filters.endDate 
        });
        setData(orders);
      } else {
        const reservations = await fetchAllReservations({ 
          history: true, 
          startDate: filters.startDate, 
          endDate: filters.endDate 
        });
        setData(reservations);
      }
    } catch (error) {
      console.error(`Error loading history for ${activeTab}:`, error);
      toast.error(`Failed to load ${activeTab} history`);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-HK', {
      style: 'currency',
      currency: 'HKD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-sangeet-neutral-900 pb-12">
      <AdminHeader />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2 font-display">History & Archives</h1>
          <p className="text-sangeet-neutral-400 text-lg">Browse completed and cancelled records past 24 hours.</p>
        </motion.div>

        {/* Controls */}
        <div className="bg-sangeet-neutral-800 rounded-2xl shadow-xl border border-sangeet-neutral-700/50 p-6 mb-8 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Tabs */}
            <div className="flex bg-sangeet-neutral-900 p-1.5 rounded-xl self-start">
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'orders'
                    ? 'bg-sangeet-500 text-white shadow-lg'
                    : 'text-sangeet-neutral-400 hover:text-white hover:bg-sangeet-neutral-800/50'
                }`}
              >
                Archived Orders
              </button>
              <button
                onClick={() => setActiveTab('reservations')}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'reservations'
                    ? 'bg-sangeet-500 text-white shadow-lg'
                    : 'text-sangeet-neutral-400 hover:text-white hover:bg-sangeet-neutral-800/50'
                }`}
              >
                Archived Reservations
              </button>
            </div>

            {/* Date Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex flex-col">
                <label className="text-xs text-sangeet-neutral-400 mb-1 ml-1 font-medium">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="px-4 py-2 bg-sangeet-neutral-900 border border-sangeet-neutral-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sangeet-500 transition-all text-sm"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-sangeet-neutral-400 mb-1 ml-1 font-medium">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="px-4 py-2 bg-sangeet-neutral-900 border border-sangeet-neutral-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sangeet-500 transition-all text-sm"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Data Display */}
        <div className="bg-sangeet-neutral-800 rounded-2xl shadow-xl border border-sangeet-neutral-700/50 overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-sangeet-500 border-t-transparent"></div>
            </div>
          ) : data.length === 0 ? (
            <div className="p-12 text-center text-sangeet-neutral-400">
              <p className="text-lg">No {activeTab} found for this date range.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-sangeet-neutral-900/50 border-b border-sangeet-neutral-700">
                    {activeTab === 'orders' ? (
                      <>
                        <th className="p-4 text-sm font-semibold text-sangeet-neutral-300">Order #</th>
                        <th className="p-4 text-sm font-semibold text-sangeet-neutral-300">Date</th>
                        <th className="p-4 text-sm font-semibold text-sangeet-neutral-300">Customer</th>
                        <th className="p-4 text-sm font-semibold text-sangeet-neutral-300">Table</th>
                        <th className="p-4 text-sm font-semibold text-sangeet-neutral-300">Total</th>
                        <th className="p-4 text-sm font-semibold text-sangeet-neutral-300">Status</th>
                      </>
                    ) : (
                      <>
                        <th className="p-4 text-sm font-semibold text-sangeet-neutral-300">Date & Time</th>
                        <th className="p-4 text-sm font-semibold text-sangeet-neutral-300">Customer</th>
                        <th className="p-4 text-sm font-semibold text-sangeet-neutral-300">Phone</th>
                        <th className="p-4 text-sm font-semibold text-sangeet-neutral-300">Guests</th>
                        <th className="p-4 text-sm font-semibold text-sangeet-neutral-300">Status</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {data.map((item, index) => (
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={item.id}
                        className="border-b border-sangeet-neutral-700/50 hover:bg-sangeet-neutral-700/20 transition-colors"
                      >
                        {activeTab === 'orders' ? (
                          <>
                            <td className="p-4 text-white font-medium">{item.id.slice(0, 8)}</td>
                            <td className="p-4 text-sangeet-neutral-300">{format(new Date(item.created_at), 'MMM dd, HH:mm')}</td>
                            <td className="p-4 text-sangeet-neutral-300">{item.customer_name || 'Walk-in'}</td>
                            <td className="p-4 text-sangeet-neutral-300">Table {item.table_number || item.table_id}</td>
                            <td className="p-4 text-white font-medium">{formatCurrency(item.total_amount)}</td>
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                item.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                                item.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
                              }`}>
                                {(item.status || 'unknown').toUpperCase()}
                              </span>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-4 text-white font-medium">
                              {format(new Date(item.date), 'MMM dd, yyyy')} <span className="text-sangeet-neutral-400 ml-2">{item.time}</span>
                            </td>
                            <td className="p-4 text-sangeet-neutral-300">{item.customer_name}</td>
                            <td className="p-4 text-sangeet-neutral-300">{item.customer_phone}</td>
                            <td className="p-4 text-sangeet-neutral-300">{item.number_of_guests} ppl</td>
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                item.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                                item.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 
                                item.status === 'no-show' ? 'bg-purple-500/20 text-purple-400' : 
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                {(item.status || 'unknown').toUpperCase()}
                              </span>
                            </td>
                          </>
                        )}
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryDashboard;
