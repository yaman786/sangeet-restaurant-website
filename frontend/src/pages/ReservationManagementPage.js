import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AdminHeader from '../components/AdminHeader';
import { fetchAllReservations, updateReservationStatus, deleteReservation, fetchReservationStats, fetchTables, updateReservation } from '../services/api';

const ReservationManagementPage = () => {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  });
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'pending', 'confirmed', 'completed', 'cancelled'
  const [filters, setFilters] = useState({
    status: '',
    date: '',
    guests: '',
    showPendingOnly: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [connectionStatus, setConnectionStatus] = useState('connected');

  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [reservationsData, statsData, tablesData] = await Promise.all([
        fetchAllReservations(),
        fetchReservationStats(),
        fetchTables()
      ]);
      console.log('Loaded stats:', statsData);
      console.log('Loaded reservations:', reservationsData);
      setReservations(reservationsData);
      setStats(statsData);
      setTables(tablesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleStatusUpdate = async (reservationId, newStatus) => {
    try {
      await updateReservationStatus(reservationId, newStatus);
      
      // Update local state directly
      setReservations(prev => prev.map(res => 
        res.id === reservationId ? { ...res, status: newStatus } : res
      ));
      
      toast.success(`Reservation ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };



  const handleDelete = async (reservationId) => {
    try {
      await deleteReservation(reservationId);
      
      // Update local state directly
      setReservations(prev => prev.filter(res => res.id !== reservationId));
      
      setShowDeleteModal(false);
      setSelectedReservation(null);
      toast.success('Reservation deleted');
    } catch (error) {
      console.error('Error deleting reservation:', error);
      toast.error('Failed to delete reservation');
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleAssignTable = async (reservationId, tableId) => {
    if (!tableId) return;
    
    try {
      await updateReservation(reservationId, { table_id: parseInt(tableId) });
      
      // Update local state directly
      setReservations(prev => prev.map(res => 
        res.id === reservationId ? { ...res, table_id: parseInt(tableId) } : res
      ));
      
      toast.success('Table assigned successfully');
    } catch (error) {
      console.error('Error assigning table:', error);
      toast.error('Failed to assign table');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'confirmed': return 'bg-gradient-to-r from-blue-500 to-indigo-500';
      case 'completed': return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'cancelled': return 'bg-gradient-to-r from-red-500 to-pink-500';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'completed': return '🎉';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // eslint-disable-next-line no-unused-vars
  const getTableNumber = (tableId) => {
    const table = tables.find(t => t.id === tableId);
    return table ? table.table_number : 'Not assigned';
  };

  // Filter reservations based on activeFilter
  const filteredReservations = reservations.filter(reservation => {
    // Apply activeFilter first
    if (activeFilter !== 'all' && reservation.status !== activeFilter) return false;
    
    // Apply other filters if needed
    if (filters.date && reservation.date !== filters.date) return false;
    if (filters.table_id && reservation.table_id !== parseInt(filters.table_id)) return false;
    if (filters.guests && reservation.guests < parseInt(filters.guests)) return false;
    return true;
  });

  // Include all filtered reservations in main workflow
  const activeReservations = filteredReservations;

  // Calculate real-time stats from reservations data
  const realTimeStats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    completed: reservations.filter(r => r.status === 'completed').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReservations = activeReservations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(activeReservations.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sangeet-neutral-950 via-sangeet-neutral-900 to-sangeet-neutral-950">
      <AdminHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Interactive Filter Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setActiveFilter('all')}
            className={`rounded-xl p-6 border transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-xl ${
              activeFilter === 'all'
                ? 'bg-sangeet-400/20 border-sangeet-400/50 shadow-lg'
                : 'bg-sangeet-neutral-900 border-sangeet-neutral-700 hover:bg-sangeet-neutral-800 hover:border-sangeet-neutral-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  activeFilter === 'all' ? 'text-sangeet-400' : 'text-sangeet-neutral-400'
                }`}>All Reservations</p>
                <p className={`text-3xl font-bold ${
                  activeFilter === 'all' ? 'text-sangeet-400' : 'text-sangeet-neutral-100'
                }`}>
                  {isLoading ? '...' : realTimeStats.total}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                activeFilter === 'all' ? 'bg-sangeet-400/30' : 'bg-sangeet-400/20'
              }`}>
                <span className="text-xl">🍽️</span>
              </div>
            </div>
          </motion.button>
          
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => setActiveFilter('pending')}
            className={`rounded-xl p-6 border transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-xl ${
              activeFilter === 'pending'
                ? 'bg-yellow-400/20 border-yellow-400/50 shadow-lg'
                : 'bg-yellow-900/20 border-yellow-500/30 hover:bg-yellow-900/30 hover:border-yellow-400/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  activeFilter === 'pending' ? 'text-yellow-300' : 'text-yellow-400'
                }`}>Pending</p>
                <p className={`text-3xl font-bold ${
                  activeFilter === 'pending' ? 'text-yellow-300' : 'text-yellow-400'
                }`}>
                  {isLoading ? '...' : realTimeStats.pending}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                activeFilter === 'pending' ? 'bg-yellow-400/30' : 'bg-yellow-400/20'
              }`}>
                <span className="text-xl">⏳</span>
              </div>
            </div>
          </motion.button>
          
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => setActiveFilter('confirmed')}
            className={`rounded-xl p-6 border transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-xl ${
              activeFilter === 'confirmed'
                ? 'bg-blue-400/20 border-blue-400/50 shadow-lg'
                : 'bg-blue-900/20 border-blue-500/30 hover:bg-blue-900/30 hover:border-blue-400/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  activeFilter === 'confirmed' ? 'text-blue-300' : 'text-blue-400'
                }`}>Confirmed</p>
                <p className={`text-3xl font-bold ${
                  activeFilter === 'confirmed' ? 'text-blue-300' : 'text-blue-400'
                }`}>
                  {isLoading ? '...' : realTimeStats.confirmed}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                activeFilter === 'confirmed' ? 'bg-blue-400/30' : 'bg-blue-400/20'
              }`}>
                <span className="text-xl">✅</span>
              </div>
            </div>
          </motion.button>
          
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => setActiveFilter('completed')}
            className={`rounded-xl p-6 border transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-xl ${
              activeFilter === 'completed'
                ? 'bg-green-400/20 border-green-400/50 shadow-lg'
                : 'bg-green-900/20 border-green-500/30 hover:bg-green-900/30 hover:border-green-400/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  activeFilter === 'completed' ? 'text-green-300' : 'text-green-400'
                }`}>Completed</p>
                <p className={`text-3xl font-bold ${
                  activeFilter === 'completed' ? 'text-green-300' : 'text-green-400'
                }`}>
                  {isLoading ? '...' : realTimeStats.completed}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                activeFilter === 'completed' ? 'bg-green-400/30' : 'bg-green-400/20'
              }`}>
                <span className="text-xl">🎉</span>
              </div>
            </div>
          </motion.button>
          
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => setActiveFilter('cancelled')}
            className={`rounded-xl p-6 border transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-xl ${
              activeFilter === 'cancelled'
                ? 'bg-red-400/20 border-red-400/50 shadow-lg'
                : 'bg-red-900/20 border-red-500/30 hover:bg-red-900/30 hover:border-red-400/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  activeFilter === 'cancelled' ? 'text-red-300' : 'text-red-400'
                }`}>Cancelled</p>
                <p className={`text-3xl font-bold ${
                  activeFilter === 'cancelled' ? 'text-red-300' : 'text-red-400'
                }`}>
                  {isLoading ? '...' : realTimeStats.cancelled}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                activeFilter === 'cancelled' ? 'bg-red-400/30' : 'bg-red-400/20'
              }`}>
                <span className="text-xl">❌</span>
              </div>
            </div>
          </motion.button>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 gap-8">
          {/* All Reservations */}
          <div className="w-full">
            {/* Restaurant Controls Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-sangeet-neutral-900 rounded-xl p-6 border border-sangeet-neutral-700 shadow-lg mb-6"
            >
                              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-2xl font-bold text-sangeet-neutral-100">All Reservations</h2>
                    <span className="px-3 py-1 bg-sangeet-400/20 rounded-full text-sangeet-neutral-100 text-sm font-medium">
                      {activeReservations.length} items
                    </span>
                  </div>
                
                
              </div>


            </motion.div>

            {/* Reservations Display */}
                        <AnimatePresence mode="wait">
              {activeReservations.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-sangeet-neutral-900 rounded-xl p-12 border border-sangeet-neutral-700 shadow-lg text-center"
                >
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold text-sangeet-neutral-100 mb-2">No Reservations Found</h3>
                  <p className="text-sangeet-neutral-400">No reservations match your current filters</p>
                </motion.div>
              ) : (
                <motion.div
                  key="table"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-sangeet-neutral-900 rounded-xl border-2 border-amber-500/30 shadow-xl overflow-hidden"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-amber-500/10 border-b border-amber-500/20">
                        <tr>
                          <th className="px-6 py-4 text-left text-amber-400 font-semibold border-r border-amber-500/20">Customer</th>
                          <th className="px-6 py-4 text-left text-amber-400 font-semibold border-r border-amber-500/20">Date & Time</th>
                          <th className="px-6 py-4 text-left text-amber-400 font-semibold border-r border-amber-500/20">Guests</th>
                          <th className="px-6 py-4 text-left text-amber-400 font-semibold border-r border-amber-500/20">Status</th>
                          <th className="px-6 py-4 text-left text-amber-400 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-500/10">
                        {currentReservations.map((reservation) => (
                          <tr key={reservation.id} className="hover:bg-amber-500/5 transition-colors">
                            <td className="px-6 py-4 border-r border-amber-500/10">
                              <div>
                                <div className="text-sangeet-neutral-100 font-medium">{reservation.customer_name}</div>
                                <div className="text-sangeet-neutral-400 text-sm">{reservation.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 border-r border-amber-500/10">
                              <div className="text-sangeet-neutral-100">
                                {formatDate(reservation.date)}<br/>
                                <span className="text-sangeet-neutral-400">{formatTime(reservation.time)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sangeet-neutral-100 border-r border-amber-500/10">{reservation.guests}</td>
                            <td className="px-6 py-4 border-r border-amber-500/10">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(reservation.status)}`}>
                                {getStatusIcon(reservation.status)} {reservation.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                {reservation.status !== 'completed' && reservation.status !== 'cancelled' && (
                                  <select
                                    value={reservation.status}
                                    onChange={(e) => handleStatusUpdate(reservation.id, e.target.value)}
                                    className="px-3 py-1 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded text-sangeet-neutral-100 text-sm"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="completed">Completed</option>
                                  </select>
                                )}

                                <button
                                  onClick={() => {
                                    setSelectedReservation(reservation);
                                    setShowDeleteModal(true);
                                  }}
                                  className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded text-sm font-medium"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center items-center space-x-2 mt-6"
              >
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  ← Previous
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                          : 'bg-white/10 text-white/80 hover:bg-white/20'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  Next →
                </button>
              </motion.div>
            )}
          </div>


        </div>
      </div>

      {/* Informative Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedReservation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-sangeet-neutral-900 rounded-2xl border border-sangeet-neutral-700 shadow-2xl max-w-lg w-full p-6"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🗑️</span>
                </div>
                <h3 className="text-xl font-bold text-sangeet-neutral-100 mb-2">Delete Reservation</h3>
                <p className="text-sangeet-neutral-400">
                  Are you sure you want to permanently delete this reservation?
                </p>
              </div>

              {/* Reservation Details */}
              <div className="bg-sangeet-neutral-800 rounded-xl p-4 mb-6 border border-sangeet-neutral-600">
                <h4 className="text-sangeet-neutral-100 font-semibold mb-3 text-center">Reservation Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-sangeet-neutral-400">Customer:</span>
                    <span className="text-sangeet-neutral-100 font-medium">{selectedReservation.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sangeet-neutral-400">Date:</span>
                    <span className="text-sangeet-neutral-100">{formatDate(selectedReservation.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sangeet-neutral-400">Time:</span>
                    <span className="text-sangeet-neutral-100">{formatTime(selectedReservation.time)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sangeet-neutral-400">Guests:</span>
                    <span className="text-sangeet-neutral-100">{selectedReservation.guests} people</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sangeet-neutral-400">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedReservation.status)}`}>
                      {getStatusIcon(selectedReservation.status)} {selectedReservation.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sangeet-neutral-400">Contact:</span>
                    <span className="text-sangeet-neutral-100">{selectedReservation.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sangeet-neutral-400">Email:</span>
                    <span className="text-sangeet-neutral-100">{selectedReservation.email}</span>
                  </div>
                  {selectedReservation.special_requests && (
                    <div className="mt-3 pt-3 border-t border-sangeet-neutral-600">
                      <div className="flex justify-between">
                        <span className="text-sangeet-neutral-400">Special Requests:</span>
                        <span className="text-sangeet-neutral-100 text-xs max-w-32 text-right">{selectedReservation.special_requests}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Warning Message */}
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6">
                <div className="flex items-center space-x-2">
                  <span className="text-red-400">⚠️</span>
                  <span className="text-red-300 text-sm font-medium">This action cannot be undone</span>
                </div>
                <p className="text-red-300/80 text-xs mt-1">
                  The reservation will be permanently removed from the system.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedReservation(null);
                  }}
                  className="flex-1 px-4 py-3 bg-sangeet-neutral-800 text-sangeet-neutral-300 rounded-lg hover:bg-sangeet-neutral-700 hover:text-sangeet-neutral-100 transition-all duration-300 border border-sangeet-neutral-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(selectedReservation.id)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
                >
                  Delete Reservation
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReservationManagementPage;
