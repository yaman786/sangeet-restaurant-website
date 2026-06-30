import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'datetime', direction: 'asc' });
  const [filters, setFilters] = useState({
    status: '',
    date: '',
    guests: '',
    showPendingOnly: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignTableModal, setShowAssignTableModal] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [selectedReservation, setSelectedReservation] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [connectionStatus, setConnectionStatus] = useState('connected');

  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async (isBackgroundPoll = false) => {
    try {
      if (!isBackgroundPoll) setIsLoading(true);
      const [reservationsData, statsData, tablesData] = await Promise.all([
        fetchAllReservations(),
        fetchReservationStats(),
        fetchTables()
      ]);
      setReservations(reservationsData);
      setStats(statsData);
      setTables(tablesData);
    } catch (error) {
      console.error('Error loading data:', error);
      if (!isBackgroundPoll) {
        toast.error('Failed to load data');
      }
    } finally {
      if (!isBackgroundPoll) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(false);
    
    // Industry Standard: Auto-refresh fallback polling every 60 seconds (prevents rate limits)
    const pollingInterval = setInterval(() => {
      loadData(true);
    }, 60000);

    return () => clearInterval(pollingInterval);
  }, [loadData]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleStatusUpdate = async (reservationId, newStatus) => {
    try {
      const reservation = reservations.find(r => r.id === reservationId);
      if (newStatus === 'confirmed' && !reservation.table_id) {
        setSelectedReservation(reservation);
        setShowAssignTableModal(true);
        return; // intercept and open modal
      }

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

  const handleAssignTable = async () => {
    if (!selectedTableId) {
      toast.error('Please select a table');
      return;
    }
    
    try {
      // Use full updateReservation instead of updateReservationStatus
      await updateReservation(selectedReservation.id, {
        status: 'confirmed',
        table_id: selectedTableId
      });
      
      // Update local state directly
      setReservations(prev => prev.map(res => 
        res.id === selectedReservation.id ? { ...res, status: 'confirmed', table_id: selectedTableId } : res
      ));
      
      setShowAssignTableModal(false);
      setSelectedReservation(null);
      setSelectedTableId('');
      toast.success('Reservation confirmed and table assigned!');
    } catch (error) {
      console.error('Error assigning table:', error);
      toast.error(error.response?.data?.error || 'Failed to assign table');
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

  // Filter reservations based on activeFilter and search
  const filteredReservations = reservations.filter(reservation => {
    // Apply activeFilter first
    if (activeFilter !== 'all' && reservation.status !== activeFilter) return false;
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = reservation.customer_name?.toLowerCase().includes(query);
      const matchEmail = reservation.email?.toLowerCase().includes(query);
      const matchPhone = reservation.phone?.includes(query);
      if (!matchName && !matchEmail && !matchPhone) return false;
    }
    
    // Apply other filters if needed
    if (filters.date && reservation.date !== filters.date) return false;
    if (filters.table_id && reservation.table_id !== parseInt(filters.table_id)) return false;
    if (filters.guests && reservation.guests < parseInt(filters.guests)) return false;
    return true;
    return true;
  });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedReservations = [...filteredReservations].sort((a, b) => {
    if (sortConfig.key === 'customer') {
      const nameA = a.customer_name?.toLowerCase() || '';
      const nameB = b.customer_name?.toLowerCase() || '';
      return sortConfig.direction === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    }
    if (sortConfig.key === 'datetime') {
      const dateAStr = a.date ? (a.date.includes('T') ? a.date.split('T')[0] : a.date) : '';
      const dateBStr = b.date ? (b.date.includes('T') ? b.date.split('T')[0] : b.date) : '';
      const dateA = new Date(`${dateAStr}T${a.time || '00:00:00'}`);
      const dateB = new Date(`${dateBStr}T${b.time || '00:00:00'}`);
      return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
    }
    if (sortConfig.key === 'guests') {
      return sortConfig.direction === 'asc' ? (a.guests || 0) - (b.guests || 0) : (b.guests || 0) - (a.guests || 0);
    }
    if (sortConfig.key === 'status') {
      const statusA = a.status || '';
      const statusB = b.status || '';
      return sortConfig.direction === 'asc' ? statusA.localeCompare(statusB) : statusB.localeCompare(statusA);
    }
    return 0;
  });

  // Include all filtered and sorted reservations in main workflow
  const activeReservations = sortedReservations;

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
                  
                  <div className="relative w-full lg:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-sangeet-neutral-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search name, email, or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-sangeet-neutral-700 rounded-lg leading-5 bg-sangeet-neutral-800 text-sangeet-neutral-100 placeholder-sangeet-neutral-400 focus:outline-none focus:ring-1 focus:ring-sangeet-400 focus:border-sangeet-400 sm:text-sm transition duration-150 ease-in-out"
                    />
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
                          <th 
                            className="px-6 py-4 text-left text-amber-400 font-semibold border-r border-amber-500/20 cursor-pointer hover:bg-amber-500/20 transition-colors"
                            onClick={() => handleSort('customer')}
                          >
                            <div className="flex items-center space-x-1">
                              <span>Customer</span>
                              {sortConfig.key === 'customer' ? (sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-50" />}
                            </div>
                          </th>
                          <th 
                            className="px-6 py-4 text-left text-amber-400 font-semibold border-r border-amber-500/20 cursor-pointer hover:bg-amber-500/20 transition-colors"
                            onClick={() => handleSort('datetime')}
                          >
                            <div className="flex items-center space-x-1">
                              <span>Date & Time</span>
                              {sortConfig.key === 'datetime' ? (sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-50" />}
                            </div>
                          </th>
                          <th 
                            className="px-6 py-4 text-left text-amber-400 font-semibold border-r border-amber-500/20 cursor-pointer hover:bg-amber-500/20 transition-colors"
                            onClick={() => handleSort('guests')}
                          >
                            <div className="flex items-center space-x-1">
                              <span>Guests</span>
                              {sortConfig.key === 'guests' ? (sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-50" />}
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-amber-400 font-semibold border-r border-amber-500/20">
                            Status
                          </th>
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
                                    {reservation.status === 'pending' && (
                                      <>
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="cancelled">Cancelled</option>
                                      </>
                                    )}
                                    {reservation.status === 'confirmed' && (
                                      <>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                      </>
                                    )}
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

      {/* Assign Table Modal */}
      <AnimatePresence>
        {showAssignTableModal && selectedReservation && (
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
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🪑</span>
                </div>
                <h3 className="text-xl font-bold text-sangeet-neutral-100 mb-2">Assign Table</h3>
                <p className="text-sangeet-neutral-400">
                  Please assign a table with capacity for {selectedReservation.guests} guests to confirm.
                </p>
              </div>

              {/* Table Selection */}
              <div className="bg-sangeet-neutral-800 rounded-xl p-4 mb-6 border border-sangeet-neutral-600">
                <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">Select an Available Table</label>
                <select
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  className="w-full bg-sangeet-neutral-900 border border-sangeet-neutral-600 text-sangeet-neutral-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sangeet-500"
                >
                  <option value="">-- Choose a table --</option>
                  {tables
                    .filter(t => t.capacity >= selectedReservation.guests && t.is_active)
                    .map(t => (
                      <option key={t.id} value={t.id}>
                        Table {t.table_number} (Capacity: {t.capacity})
                      </option>
                    ))}
                </select>
                {tables.filter(t => t.capacity >= selectedReservation.guests && t.is_active).length === 0 && (
                  <p className="text-red-400 text-sm mt-2">No active tables found with enough capacity.</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowAssignTableModal(false);
                    setSelectedReservation(null);
                    setSelectedTableId('');
                  }}
                  className="flex-1 px-4 py-3 bg-sangeet-neutral-800 text-sangeet-neutral-300 rounded-lg hover:bg-sangeet-neutral-700 hover:text-sangeet-neutral-100 transition-all duration-300 border border-sangeet-neutral-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignTable}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-sangeet-500 to-sangeet-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
                >
                  Assign & Confirm
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
