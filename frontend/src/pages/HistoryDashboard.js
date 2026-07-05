import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays, isValid, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';
import { X, Eye, User, Phone, Mail, Calendar, Clock, MessageSquare, Tag, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import AdminHeader from '../components/AdminHeader';
import { fetchAllOrders, fetchAllReservations } from '../services/api';

const HistoryDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  
  const [filters, setFilters] = useState({
    startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);

  const { data = [], isLoading: loading } = useQuery({
    queryKey: ['history', activeTab, filters.startDate, filters.endDate],
    queryFn: () => {
      const queryFilters = { history: true, startDate: filters.startDate, endDate: filters.endDate };
      return activeTab === 'orders' ? fetchAllOrders(queryFilters) : fetchAllReservations(queryFilters);
    },
  });

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

  const safeFormatDate = (dateVal, formatStr) => {
    if (!dateVal) return 'N/A';
    const dateObj = new Date(dateVal);
    // Check if valid date
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    return format(dateObj, formatStr);
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
                        <th className="p-4 text-sm font-semibold text-sangeet-neutral-300 text-right">Actions</th>
                      </>
                    ) : (
                      <>
                        <th className="p-4 text-sm font-semibold text-sangeet-neutral-300">Date & Time</th>
                        <th className="p-4 text-sm font-semibold text-sangeet-neutral-300">Customer</th>
                        <th className="p-4 text-sm font-semibold text-sangeet-neutral-300">Phone</th>
                        <th className="p-4 text-sm font-semibold text-sangeet-neutral-300">Guests</th>
                        <th className="p-4 text-sm font-semibold text-sangeet-neutral-300">Status</th>
                        <th className="p-4 text-sm font-semibold text-sangeet-neutral-300 text-right">Actions</th>
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
                            <td className="p-4 text-white font-medium">{(item.id || '').toString().slice(0, 8)}</td>
                            <td className="p-4 text-sangeet-neutral-300">{safeFormatDate(item.created_at, 'MMM dd, HH:mm')}</td>
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
                            <td className="p-4 text-right">
                              <button
                                onClick={() => setSelectedOrder(item)}
                                className="p-2 text-sangeet-neutral-400 hover:text-white hover:bg-sangeet-neutral-700 rounded-lg transition-colors inline-block"
                              >
                                <Eye size={18} />
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-4 text-white font-medium">
                              {safeFormatDate(item.date, 'MMM dd, yyyy')} <span className="text-sangeet-neutral-400 ml-2">{item.time || ''}</span>
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
                            <td className="p-4 text-right">
                              <button
                                onClick={() => setSelectedReservation(item)}
                                className="p-2 text-sangeet-neutral-400 hover:text-white hover:bg-sangeet-neutral-700 rounded-lg transition-colors inline-block"
                              >
                                <Eye size={18} />
                              </button>
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

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-sangeet-neutral-900 rounded-2xl shadow-2xl border border-sangeet-neutral-700 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-sangeet-neutral-800 bg-sangeet-neutral-900/50">
                <div>
                  <h3 className="text-xl font-bold text-white">Order Details</h3>
                  <p className="text-sangeet-neutral-400 text-sm mt-1">ID: {selectedOrder.id}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-sangeet-neutral-400 hover:text-white hover:bg-sangeet-neutral-800 rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-sangeet-neutral-800 p-4 rounded-xl">
                    <p className="text-sm text-sangeet-neutral-400 mb-1">Customer</p>
                    <p className="font-semibold text-white">{selectedOrder.customer_name || 'Walk-in'}</p>
                  </div>
                  <div className="bg-sangeet-neutral-800 p-4 rounded-xl">
                    <p className="text-sm text-sangeet-neutral-400 mb-1">Table</p>
                    <p className="font-semibold text-white">Table {selectedOrder.table_number || selectedOrder.table_id}</p>
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-white mb-4">Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-sangeet-neutral-800/50 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{item.quantity}x {item.menu_item_name || 'Item'}</p>
                          {item.notes && <p className="text-sm text-sangeet-neutral-400 mt-1">Note: {item.notes}</p>}
                        </div>
                        <p className="text-white font-medium">{formatCurrency(item.total_price)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sangeet-neutral-400">No items found.</p>
                  )}
                </div>
                <div className="mt-6 pt-4 border-t border-sangeet-neutral-800 flex justify-between items-center">
                  <p className="text-lg text-sangeet-neutral-300">Total Amount</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(selectedOrder.total_amount)}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reservation Details Modal */}
      <AnimatePresence>
        {selectedReservation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReservation(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-sangeet-neutral-900 rounded-2xl shadow-2xl border border-sangeet-neutral-700 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-sangeet-neutral-800 bg-sangeet-neutral-900/50">
                <h3 className="text-xl font-bold text-white">Reservation Details</h3>
                <button
                  onClick={() => setSelectedReservation(null)}
                  className="p-2 text-sangeet-neutral-400 hover:text-white hover:bg-sangeet-neutral-800 rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4">
                <div className="flex items-center text-sangeet-neutral-300 bg-sangeet-neutral-800 p-4 rounded-xl">
                  <User className="mr-3 text-sangeet-400" size={20} />
                  <div>
                    <p className="text-xs text-sangeet-neutral-500">Name</p>
                    <p className="font-semibold text-white">{selectedReservation.customer_name}</p>
                  </div>
                </div>
                <div className="flex items-center text-sangeet-neutral-300 bg-sangeet-neutral-800 p-4 rounded-xl">
                  <Phone className="mr-3 text-sangeet-400" size={20} />
                  <div>
                    <p className="text-xs text-sangeet-neutral-500">Phone</p>
                    <p className="font-semibold text-white">{selectedReservation.customer_phone}</p>
                  </div>
                </div>
                {selectedReservation.customer_email && (
                  <div className="flex items-center text-sangeet-neutral-300 bg-sangeet-neutral-800 p-4 rounded-xl">
                    <Mail className="mr-3 text-sangeet-400" size={20} />
                    <div>
                      <p className="text-xs text-sangeet-neutral-500">Email</p>
                      <p className="font-semibold text-white">{selectedReservation.customer_email}</p>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center text-sangeet-neutral-300 bg-sangeet-neutral-800 p-4 rounded-xl">
                    <Calendar className="mr-3 text-sangeet-400" size={20} />
                    <div>
                      <p className="text-xs text-sangeet-neutral-500">Date</p>
                      <p className="font-semibold text-white">{safeFormatDate(selectedReservation.date, 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-sangeet-neutral-300 bg-sangeet-neutral-800 p-4 rounded-xl">
                    <Clock className="mr-3 text-sangeet-400" size={20} />
                    <div>
                      <p className="text-xs text-sangeet-neutral-500">Time</p>
                      <p className="font-semibold text-white">{selectedReservation.time || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center text-sangeet-neutral-300 bg-sangeet-neutral-800 p-4 rounded-xl">
                  <Users className="mr-3 text-sangeet-400" size={20} />
                  <div>
                    <p className="text-xs text-sangeet-neutral-500">Guests</p>
                    <p className="font-semibold text-white">{selectedReservation.number_of_guests} People</p>
                  </div>
                </div>
                {selectedReservation.special_requests && (
                  <div className="flex items-start text-sangeet-neutral-300 bg-sangeet-neutral-800 p-4 rounded-xl">
                    <MessageSquare className="mr-3 mt-1 text-sangeet-400" size={20} />
                    <div>
                      <p className="text-xs text-sangeet-neutral-500">Special Requests</p>
                      <p className="font-medium text-white whitespace-pre-wrap">{selectedReservation.special_requests}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HistoryDashboard;
