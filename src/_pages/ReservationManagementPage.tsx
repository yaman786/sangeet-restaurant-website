"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';
import AdminHeader from '../components/AdminHeader';
import { fetchAllReservations, updateReservationStatus, deleteReservation, fetchReservationStats, fetchTables, updateReservation, createReservation } from '../services/api';
import { pusherClient as socketService } from '@/lib/services/pusherClient';
import { formatRestaurantTime } from '@/lib/utils/timeUtils';
import ShiftManagerModal from './ShiftManagerModal';

const ReservationManagementPage = () => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
   
  const [stats, setStats] = useState<any>({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  });
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'pending', 'confirmed', 'completed', 'cancelled'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'datetime', direction: 'asc' });
  const [filters, setFilters] = useState<any>({
    status: '',
    date: '',
    guests: '',
    showPendingOnly: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignTableModal, setShowAssignTableModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [notifyGuestOnShift, setNotifyGuestOnShift] = useState<boolean>(true);
   
  const [showAddReservationModal, setShowAddReservationModal] = useState(false);
  const [showShiftManager, setShowShiftManager] = useState(false);
  const [newReservationData, setNewReservationData] = useState<any>({
    customer_name: '',
    email: '',
    phone: '',
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    guests: 2,
    table_id: '',
    special_requests: '',
    status: 'confirmed'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connected');

  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async (isBackgroundPoll = false) => {
    try {
      if (!isBackgroundPoll) setIsLoading(true);
      
      const queryParams: any = {};
      // Industry Standard: Default to fetching today + upcoming reservations, not the entire historical DB
      queryParams.startDate = new Date().toISOString().split('T')[0];

      const [reservationsData, statsData, tablesData] = await Promise.all([
        fetchAllReservations(queryParams),
        fetchReservationStats(),
        fetchTables()
      ]);
      setReservations(reservationsData);
      setStats(statsData);
      setTables(tablesData);
    } catch (error: any) {
      console.error('Error loading data:', error);
      if (!isBackgroundPoll) {
        toast.error('Failed to load data');
      }
    } finally {
      if (!isBackgroundPoll) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadData(false);
    });
    // Removed 60-second polling to save bandwidth and prevent server crashes
  }, [loadData]);

  // Real-time Pusher Subscription
  useEffect(() => {
    // 1. Initialize Pusher
    socketService.init();

    // 2. Setup connection status listener
    socketService.onConnectionStateChange((status) => {
      setConnectionStatus(status);
      // Smart Sync: Re-fetch data if connection is restored
      if (status === 'connected') {
        loadData(true);
      }
    });

    // 3. Subscribe to admin-channel
    const channel = socketService.subscribeToAdminChannel();

    // 4. Listen for new reservations
    channel.bind('new-reservation', (data: any) => {
      setReservations(prev => {
        // Prevent duplicates
        if (prev.some(r => r.id === data.id)) return prev;
        return [data, ...prev];
      });
      toast.custom(
        (t) => (
          <div className="bg-sangeet-neutral-800 border-l-4 border-sangeet-400 p-4 rounded-lg shadow-xl flex items-start space-x-3">
            <span className="text-2xl mt-1">📅</span>
            <div>
              <h4 className="text-sangeet-400 font-bold">New Reservation</h4>
              <p className="text-sm text-sangeet-neutral-300">
                {data.customer_name} for {data.guests} guests at {data.time}
              </p>
            </div>
          </div>
        ),
        { duration: 5000, position: 'top-right' }
      );
      socketService.playNotificationSound('notification');
    });

    // 5. Listen for reservation updates/deletes
    channel.bind('reservation-status-update', (data: any) => {
      if (data.deleted) {
        setReservations(prev => prev.filter(r => r.id !== data.id));
      } else {
        setReservations(prev => {
          const index = prev.findIndex(r => r.id === data.id);
          if (index !== -1) {
            const newArray = [...prev];
            newArray[index] = data;
            return newArray;
          }
          return [data, ...prev];
        });
      }
    });

    return () => {
      channel.unbind('new-reservation');
      channel.unbind('reservation-status-update');
      // Intentionally not disconnecting entirely as other components might use it
    };
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    queueMicrotask(() => {
      setCurrentPage(1);
    });
  }, [filters]);

  const handleAddReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReservationData.customer_name || !newReservationData.phone || !newReservationData.date || !newReservationData.time) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const assignedTableId = newReservationData.table_id ? parseInt(newReservationData.table_id, 10) : null;
      const payload: any = {
        ...newReservationData,
        status: assignedTableId ? 'confirmed' : 'pending',
        table_id: assignedTableId || undefined
      };

      const createdRes = await createReservation(payload);
      const actualRes = (createdRes as any)?.reservation || createdRes;
      
      if (assignedTableId) {
        const tableObj = tables.find(t => t.id === assignedTableId);
        actualRes.tables = tableObj;
      }
      
      // Update local state directly
      setReservations(prev => [actualRes, ...prev]);
      
      // Reset form & close modal
      setNewReservationData({
        customer_name: '',
        email: '',
        phone: '',
        date: new Date().toISOString().split('T')[0],
        time: '19:00',
        guests: 2,
        table_id: '',
        special_requests: '',
        status: 'confirmed'
      });
      setShowAddReservationModal(false);
      toast.success(assignedTableId ? 'Reservation confirmed and table assigned!' : 'Reservation created as pending (awaiting table assignment)');
    } catch (error: any) {
      console.error('Error adding reservation:', error);
      toast.error(error.response?.data?.error || 'Failed to add reservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (reservationId: any, newStatus: string) => {
    try {
      const reservation = reservations.find(r => r.id === reservationId);
      if (newStatus === 'confirmed' && !reservation.table_id) {
        setSelectedReservation(reservation);
        setSelectedTableId('');
        setNotifyGuestOnShift(true);
        setShowAssignTableModal(true);
        return; // intercept and open modal
      }

      await updateReservationStatus(reservationId, newStatus);
      
      // Update local state directly
      setReservations(prev => prev.map(res => 
        res.id === reservationId ? { ...res, status: newStatus } : res
      ));
      
      toast.success(`Reservation ${newStatus}`);
    } catch (error: any) {
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
      const destTableId = parseInt(selectedTableId, 10);
      const isPending = selectedReservation.status === 'pending';
      const targetStatus = isPending ? 'confirmed' : selectedReservation.status;
      const isTableShift = Boolean(selectedReservation.table_id && selectedReservation.table_id !== destTableId);
      
      // Use full updateReservation with notify_guest flag
      await updateReservation(selectedReservation.id, {
        status: targetStatus,
        table_id: destTableId,
        notify_guest: notifyGuestOnShift
      } as any);
      
      const assignedTable = tables.find(t => t.id === destTableId);

      // Update local state directly
      setReservations(prev => prev.map(res => 
        res.id === selectedReservation.id ? { 
          ...res, 
          status: targetStatus, 
          table_id: destTableId,
          tables: assignedTable || res.tables
        } : res
      ));
      
      setShowAssignTableModal(false);
      setSelectedReservation(null);
      setSelectedTableId('');
      
      if (isTableShift) {
        toast.success(`Table shifted to Table ${assignedTable?.table_number || destTableId}${notifyGuestOnShift && selectedReservation.email ? ' & notification email sent!' : '!'}`);
      } else {
        toast.success(`Reservation confirmed & Table ${assignedTable?.table_number || destTableId} assigned!`);
      }
    } catch (error: any) {
      console.error('Error assigning table:', error);
      toast.error(error.response?.data?.error || 'Failed to assign table');
    }
  };



  const handleDelete = async (reservationId: any) => {
    try {
      await deleteReservation(reservationId);
      
      // Update local state directly
      setReservations(prev => prev.filter(res => res.id !== reservationId));
      
      setShowDeleteModal(false);
      setSelectedReservation(null);
      toast.success('Reservation deleted');
    } catch (error: any) {
      console.error('Error deleting reservation:', error);
      toast.error('Failed to delete reservation');
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-linear-to-r from-yellow-500 to-orange-500';
      case 'confirmed': return 'bg-linear-to-r from-blue-500 to-indigo-500';
      case 'completed': return 'bg-linear-to-r from-green-500 to-emerald-500';
      case 'cancelled': return 'bg-linear-to-r from-red-500 to-pink-500';
      default: return 'bg-linear-to-r from-gray-500 to-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'completed': return '🎉';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  const formatDate = (dateString: string) => {
    return formatRestaurantTime(dateString, 'ddd, MMM D');
  };

  const formatTime = (timeString: string) => {
    return formatRestaurantTime(timeString, 'h:mm A');
  };

   
  const getTableNumber = (tableId: string | number | null | undefined, reservationTables?: any) => {
    if (reservationTables?.table_number) {
      return `Table ${reservationTables.table_number}${reservationTables.table_name ? ` (${reservationTables.table_name})` : ''}`;
    }
    if (!tableId) return null;
    const table = tables.find(t => String(t.id) === String(tableId) || String(t.table_number) === String(tableId));
    return table ? `Table ${table.table_number}${table.table_name ? ` (${table.table_name})` : ''}` : `Table ${tableId}`;
  };

  // Filter reservations based on activeFilter and search
  const filteredReservations = reservations.filter((reservation: any) => {
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

  const handleSort = (key: string) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedReservations = [...filteredReservations].sort((a: any, b: any) => {
    if (sortConfig.key === 'customer') {
      const nameA = a.customer_name?.toLowerCase() || '';
      const nameB = b.customer_name?.toLowerCase() || '';
      return sortConfig.direction === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    }
    if (sortConfig.key === 'datetime') {
      const dateAStr = a.date ? (a.date.includes('T') ? a.date.split('T')[0] : a.date) : '';
      const dateBStr = b.date ? (b.date.includes('T') ? b.date.split('T')[0] : b.date) : '';
      const dateA = new Date(`${dateAStr}T${a.time || '00:00:00'}`) as any;
      const dateB = new Date(`${dateBStr}T${b.time || '00:00:00'}`) as any;
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
    pending: reservations.filter((r: any) => r.status === 'pending').length,
    confirmed: reservations.filter((r: any) => r.status === 'confirmed').length,
    completed: reservations.filter((r: any) => r.status === 'completed').length,
    cancelled: reservations.filter((r: any) => r.status === 'cancelled').length
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReservations = activeReservations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(activeReservations.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-linear-to-br from-sangeet-neutral-950 via-sangeet-neutral-900 to-sangeet-neutral-950">
      <AdminHeader title="Reservations" subtitle="Manage reservations" />
      
      <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 py-6">
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
                  
                  <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-4 w-full lg:w-auto">
                    <div className="flex gap-4">
                      <button
                        onClick={() => setShowShiftManager(true)}
                        className={`px-4 py-2 bg-sangeet-neutral-800 hover:bg-sangeet-neutral-700 text-sangeet-neutral-100 rounded-lg shadow transition-colors flex items-center justify-center border border-sangeet-neutral-700 font-medium`}
                      >
                        <span className="mr-2">⚙️</span>
                        Shift & Pacing Settings
                      </button>
                      
                      <button
                        onClick={() => setShowAddReservationModal(true)}
                        className="w-full lg:w-auto px-4 py-2 bg-sangeet-400 hover:bg-[#B8972E] text-black font-semibold rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all flex items-center justify-center space-x-2"
                      >
                        <span className="text-xl leading-none">+</span>
                        <span>Add Reservation</span>
                      </button>
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
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-amber-500/10 border-b border-amber-500/20">
                        <tr>
                          <th 
                            className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-amber-400 border-r border-amber-500/10 cursor-pointer hover:bg-amber-500/20 transition-colors"
                            onClick={() => handleSort('customer')}
                          >
                            <div className="flex items-center space-x-1">
                              <span>Customer</span>
                              {sortConfig.key === 'customer' ? (sortConfig.direction === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />) : <ArrowUpDown size={13} className="opacity-50" />}
                            </div>
                          </th>
                          <th 
                            className="px-3.5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-amber-400 border-r border-amber-500/10 cursor-pointer hover:bg-amber-500/20 transition-colors whitespace-nowrap"
                            onClick={() => handleSort('datetime')}
                          >
                            <div className="flex items-center space-x-1">
                              <span>Date & Time</span>
                              {sortConfig.key === 'datetime' ? (sortConfig.direction === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />) : <ArrowUpDown size={13} className="opacity-50" />}
                            </div>
                          </th>
                          <th 
                            className="px-3 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-amber-400 border-r border-amber-500/10 cursor-pointer hover:bg-amber-500/20 transition-colors whitespace-nowrap"
                            onClick={() => handleSort('guests')}
                          >
                            <div className="flex items-center justify-center space-x-1">
                              <span>Guests</span>
                              {sortConfig.key === 'guests' ? (sortConfig.direction === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />) : <ArrowUpDown size={13} className="opacity-50" />}
                            </div>
                          </th>
                          <th className="px-3 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-amber-400 border-r border-amber-500/10 whitespace-nowrap">
                            Table
                          </th>
                          <th className="px-3 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-amber-400 border-r border-amber-500/10 whitespace-nowrap">
                            Status
                          </th>
                          <th className="px-3.5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-amber-400 whitespace-nowrap">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-500/10 text-xs">
                        {currentReservations.map((reservation) => (
                          <tr key={reservation.id} className="hover:bg-amber-500/5 transition-colors">
                            <td className="px-4 py-3 border-r border-amber-500/10">
                              <div className="max-w-[190px]">
                                <div className="text-sangeet-neutral-100 font-semibold text-sm truncate" title={reservation.customer_name}>
                                  {reservation.customer_name}
                                </div>
                                <div className="text-sangeet-neutral-400 text-xs truncate" title={reservation.email || reservation.phone}>
                                  {reservation.email || reservation.phone || 'No contact'}
                                </div>
                              </div>
                            </td>
                            <td className="px-3.5 py-3 border-r border-amber-500/10 whitespace-nowrap">
                              <div className="text-sangeet-neutral-200 text-xs font-medium">
                                {formatDate(reservation.date)}
                              </div>
                              <div className="text-amber-400 font-bold text-xs mt-0.5">
                                {formatTime(reservation.time)}
                              </div>
                            </td>
                            <td className="px-3 py-3 text-center border-r border-amber-500/10 whitespace-nowrap">
                              <span className="px-2.5 py-1 rounded-lg bg-sangeet-neutral-800 border border-sangeet-neutral-700 text-sangeet-neutral-200 font-bold text-xs inline-flex items-center gap-1 shadow-2xs">
                                👥 {reservation.guests}
                              </span>
                            </td>
                            <td className="px-3 py-3 border-r border-amber-500/10 whitespace-nowrap">
                              {reservation.table_id || reservation.tables?.table_number ? (
                                <button
                                  onClick={() => {
                                    setSelectedReservation(reservation);
                                    setSelectedTableId(String(reservation.table_id || ''));
                                    setNotifyGuestOnShift(true);
                                    setShowAssignTableModal(true);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/60 text-amber-300 font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer group"
                                  title="Click to shift or reassign table"
                                >
                                  <span>🪑 Table {getTableNumber(reservation.table_id, reservation.tables)}</span>
                                  <span className="text-[10px] text-amber-400/80 group-hover:text-amber-200 underline">Shift</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedReservation(reservation);
                                    setSelectedTableId('');
                                    setNotifyGuestOnShift(true);
                                    setShowAssignTableModal(true);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-sangeet-neutral-950 font-bold text-xs inline-flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                                  title="Assign table to confirm booking"
                                >
                                  <span>⚡ + Assign Table</span>
                                </button>
                              )}
                            </td>
                            <td className="px-3 py-3 border-r border-amber-500/10 whitespace-nowrap">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold text-white shadow-2xs ${getStatusColor(reservation.status)}`}>
                                {getStatusIcon(reservation.status)} {reservation.status}
                              </span>
                            </td>
                            <td className="px-3.5 py-3 whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {reservation.status === 'pending' && (
                                  <button
                                    onClick={() => {
                                      setSelectedReservation(reservation);
                                      setSelectedTableId('');
                                      setNotifyGuestOnShift(true);
                                      setShowAssignTableModal(true);
                                    }}
                                    className="px-2 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-sangeet-neutral-950 rounded-md text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                                    title="Confirm & Assign Table"
                                  >
                                    <span>⚡ Confirm</span>
                                  </button>
                                )}

                                {reservation.status !== 'completed' && reservation.status !== 'cancelled' && (
                                  <select
                                    value={reservation.status}
                                    onChange={(e) => handleStatusUpdate(reservation.id, e.target.value)}
                                    className="px-2 py-1 bg-sangeet-neutral-800 hover:bg-sangeet-neutral-750 border border-sangeet-neutral-700 rounded-md text-sangeet-neutral-200 text-xs focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
                                  >
                                    {reservation.status === 'pending' && (
                                      <>
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirm (with Table)</option>
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
                                    setShowDetailsModal(true);
                                  }}
                                  className="px-2.5 py-1 bg-sangeet-neutral-800 hover:bg-sangeet-neutral-700 text-amber-300 border border-amber-400/30 hover:border-amber-400/60 rounded-md text-xs font-semibold transition-all cursor-pointer"
                                  title="View details"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedReservation(reservation);
                                    setShowDeleteModal(true);
                                  }}
                                  className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/60 rounded-md text-xs font-semibold transition-all cursor-pointer"
                                  title="Delete reservation"
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
                          ? 'bg-linear-to-r from-blue-500 to-purple-600 text-white shadow-lg'
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

      {/* Add Reservation Modal */}
      <AnimatePresence>
        {showAddReservationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-sangeet-neutral-900 rounded-2xl border border-sangeet-neutral-700 shadow-2xl max-w-2xl w-full my-8 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-sangeet-neutral-700 flex justify-between items-center bg-sangeet-neutral-900/50">
                <h3 className="text-xl font-bold text-sangeet-neutral-100 flex items-center gap-2">
                  <span className="text-sangeet-400">📅</span> Manual Reservation Entry
                </h3>
                <button
                  onClick={() => setShowAddReservationModal(false)}
                  className="text-sangeet-neutral-400 hover:text-white transition-colors p-1"
                >
                  ✕
                </button>
              </div>

              <div className="p-6">
                <form onSubmit={handleAddReservationSubmit} className="space-y-6">
                  {/* Customer Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">
                        Customer Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newReservationData.customer_name}
                        onChange={(e) => setNewReservationData({ ...newReservationData, customer_name: e.target.value })}
                        className="w-full px-4 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-lg text-sangeet-neutral-100 focus:outline-none focus:border-sangeet-400 focus:ring-1 focus:ring-sangeet-400"
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">
                        Phone Number <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={newReservationData.phone}
                        onChange={(e) => setNewReservationData({ ...newReservationData, phone: e.target.value })}
                        className="w-full px-4 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-lg text-sangeet-neutral-100 focus:outline-none focus:border-sangeet-400 focus:ring-1 focus:ring-sangeet-400"
                        placeholder="e.g. 555-0123"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        value={newReservationData.email}
                        onChange={(e) => setNewReservationData({ ...newReservationData, email: e.target.value })}
                        className="w-full px-4 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-lg text-sangeet-neutral-100 focus:outline-none focus:border-sangeet-400 focus:ring-1 focus:ring-sangeet-400"
                        placeholder="e.g. john@example.com"
                      />
                    </div>
                  </div>

                  <div className="border-t border-sangeet-neutral-800 my-4"></div>

                  {/* Booking Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">
                        Date <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={newReservationData.date}
                        onChange={(e) => setNewReservationData({ ...newReservationData, date: e.target.value })}
                        className="w-full px-4 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-lg text-sangeet-neutral-100 focus:outline-none focus:border-sangeet-400 focus:ring-1 focus:ring-sangeet-400 [color-scheme:dark]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">
                        Time <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="time"
                        required
                        value={newReservationData.time}
                        onChange={(e) => setNewReservationData({ ...newReservationData, time: e.target.value })}
                        className="w-full px-4 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-lg text-sangeet-neutral-100 focus:outline-none focus:border-sangeet-400 focus:ring-1 focus:ring-sangeet-400 [color-scheme:dark]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">
                        Guests <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        required
                        value={newReservationData.guests}
                        onChange={(e) => setNewReservationData({ ...newReservationData, guests: parseInt(e.target.value) || 1 })}
                        className="w-full px-4 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-lg text-sangeet-neutral-100 focus:outline-none focus:border-sangeet-400 focus:ring-1 focus:ring-sangeet-400"
                      />
                    </div>
                  </div>

                  {/* Table Assignment (Recommended) */}
                  <div>
                    <label className="block text-sm font-medium text-amber-400 mb-1">
                      Assign Table (Direct Confirmation)
                    </label>
                    <select
                      value={newReservationData.table_id || ''}
                      onChange={(e) => setNewReservationData({ ...newReservationData, table_id: e.target.value })}
                      className="w-full px-4 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-lg text-sangeet-neutral-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm"
                    >
                      <option value="">-- No table assigned (Save as Pending) --</option>
                      {tables
                        .filter(t => t.is_active && t.capacity >= (newReservationData.guests || 1))
                        .map(t => (
                          <option key={t.id} value={t.id}>
                            Table {t.table_number} (Capacity: {t.capacity} seats{t.table_name ? ` • ${t.table_name}` : ''})
                          </option>
                        ))}
                    </select>
                    <p className="text-[11px] text-sangeet-neutral-400 mt-1">
                      Selecting a table immediately confirms the reservation. Leaving it blank saves it as pending for later table assignment.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={newReservationData.special_requests}
                      onChange={(e) => setNewReservationData({ ...newReservationData, special_requests: e.target.value })}
                      className="w-full px-4 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-lg text-sangeet-neutral-100 focus:outline-none focus:border-sangeet-400 focus:ring-1 focus:ring-sangeet-400 resize-none"
                      placeholder="e.g. Anniversary dinner, window seat preferred..."
                    ></textarea>
                  </div>

                  <div className="flex items-center space-x-3 pt-6 border-t border-sangeet-neutral-800">
                    <button
                      type="button"
                      onClick={() => setShowAddReservationModal(false)}
                      className="flex-1 px-4 py-3 bg-sangeet-neutral-800 hover:bg-sangeet-neutral-700 text-sangeet-neutral-300 font-medium rounded-lg transition-colors border border-sangeet-neutral-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-3 bg-sangeet-400 hover:bg-[#B8972E] text-black font-semibold rounded-lg transition-colors shadow-[0_0_15px_rgba(212,175,55,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <span>Create Reservation</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Informative Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedReservation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-sangeet-neutral-900 rounded-2xl border border-sangeet-neutral-700 shadow-2xl max-w-lg w-full p-6"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-linear-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
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
                  className="flex-1 px-4 py-3 bg-linear-to-r from-red-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
                >
                  Delete Reservation
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign / Shift Table Modal */}
      <AnimatePresence>
        {showAssignTableModal && selectedReservation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-sangeet-neutral-900 rounded-2xl border border-amber-500/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)] max-w-lg w-full p-6 text-left"
            >
              <div className="flex items-center gap-4 mb-5 pb-4 border-b border-amber-500/10">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-amber-500/20 text-sangeet-neutral-950 font-bold shrink-0">
                  🪑
                </div>
                <div>
                  <h3 className="text-xl font-bold text-sangeet-neutral-100">
                    {selectedReservation.table_id ? 'Shift / Reassign Seating' : 'Assign Table & Confirm'}
                  </h3>
                  <p className="text-sangeet-neutral-400 text-xs mt-0.5">
                    {selectedReservation.customer_name} • {selectedReservation.guests} Guests • {formatDate(selectedReservation.date)} at {formatTime(selectedReservation.time)}
                  </p>
                </div>
              </div>

              {/* Current Seating Badge if Shifting */}
              {selectedReservation.table_id && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 mb-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-semibold">Current Seating:</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                      Table {getTableNumber(selectedReservation.table_id, selectedReservation.tables)}
                    </span>
                  </div>
                  <span className="text-sangeet-neutral-400">Moving to new table below ↓</span>
                </div>
              )}

              {/* Table Selection */}
              <div className="bg-sangeet-neutral-800/80 rounded-xl p-4 mb-4 border border-sangeet-neutral-700">
                <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
                  Select Destination Table (Min. {selectedReservation.guests} seats)
                </label>
                <select
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  className="w-full bg-sangeet-neutral-900 border border-sangeet-neutral-600 text-sangeet-neutral-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                >
                  <option value="">-- Choose an available table --</option>
                  {tables
                    .filter(t => t.is_active && t.capacity >= selectedReservation.guests)
                    .map(t => (
                      <option key={t.id} value={t.id} disabled={t.id === selectedReservation.table_id}>
                        Table {t.table_number} — Capacity: {t.capacity} seats {t.table_name ? `(${t.table_name})` : ''} {t.id === selectedReservation.table_id ? '(Current Table)' : ''}
                      </option>
                    ))}
                </select>
                {tables.filter(t => t.is_active && t.capacity >= selectedReservation.guests).length === 0 && (
                  <p className="text-red-400 text-xs mt-2">No active tables found with capacity for {selectedReservation.guests} guests.</p>
                )}
              </div>

              {/* Guest Email Notification Toggle */}
              {selectedReservation.email && (
                <div className="bg-sangeet-neutral-800/50 rounded-xl p-3.5 mb-5 border border-sangeet-neutral-700/60 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="notifyGuestOnShift"
                    checked={notifyGuestOnShift}
                    onChange={(e) => setNotifyGuestOnShift(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-amber-500 bg-sangeet-neutral-900 border-sangeet-neutral-600 focus:ring-amber-400 cursor-pointer accent-amber-500"
                  />
                  <label htmlFor="notifyGuestOnShift" className="text-xs text-sangeet-neutral-300 leading-relaxed cursor-pointer select-none">
                    <strong className="text-amber-400 font-semibold block mb-0.5">Send Automatic Guest Update Email</strong>
                    Notify <span className="text-sangeet-neutral-200">{selectedReservation.email}</span> with a professional email regarding this seating arrangement.
                  </label>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => {
                    setShowAssignTableModal(false);
                    setSelectedReservation(null);
                    setSelectedTableId('');
                  }}
                  className="flex-1 px-4 py-3 bg-sangeet-neutral-800 text-sangeet-neutral-300 rounded-xl hover:bg-sangeet-neutral-700 hover:text-sangeet-neutral-100 transition-all text-sm font-medium border border-sangeet-neutral-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignTable}
                  disabled={!selectedTableId}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-sangeet-neutral-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all text-sm"
                >
                  {selectedReservation.table_id ? '🔄 Confirm Table Shift' : '⚡ Assign & Confirm'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedReservation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-sangeet-neutral-900 rounded-2xl border border-sangeet-neutral-700 shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-sangeet-neutral-700 flex justify-between items-center bg-sangeet-neutral-950">
                <h3 className="text-xl font-bold text-sangeet-neutral-100 flex items-center gap-2">
                  <span className="text-sangeet-400">📋</span> Reservation Details
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-sangeet-neutral-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sangeet-neutral-400 text-xs uppercase tracking-wider mb-1">Customer</p>
                    <p className="text-sangeet-neutral-100 font-medium text-lg">{selectedReservation.customer_name}</p>
                    <p className="text-sangeet-neutral-300 text-sm">{selectedReservation.email}</p>
                    <p className="text-sangeet-neutral-300 text-sm">{selectedReservation.phone}</p>
                  </div>
                  <div>
                    <p className="text-sangeet-neutral-400 text-xs uppercase tracking-wider mb-1">Status & Table</p>
                    <div className="mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getStatusColor(selectedReservation.status)}`}>
                        {selectedReservation.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-1">
                      {selectedReservation.table_id || selectedReservation.tables?.table_number ? (
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs">
                            🪑 Table {getTableNumber(selectedReservation.table_id, selectedReservation.tables)}
                          </span>
                          <button
                            onClick={() => {
                              setShowDetailsModal(false);
                              setSelectedTableId(String(selectedReservation.table_id || ''));
                              setNotifyGuestOnShift(true);
                              setShowAssignTableModal(true);
                            }}
                            className="text-xs px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded border border-amber-500/40 transition-colors"
                          >
                            🔄 Shift Table
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setShowDetailsModal(false);
                            setSelectedTableId('');
                            setNotifyGuestOnShift(true);
                            setShowAssignTableModal(true);
                          }}
                          className="text-xs px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-sangeet-neutral-950 font-bold rounded-lg shadow-sm"
                        >
                          ⚡ Assign Table Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 p-4 bg-sangeet-neutral-950 rounded-xl border border-sangeet-neutral-800">
                  <div>
                    <p className="text-sangeet-neutral-400 text-xs uppercase tracking-wider mb-1">Date & Time</p>
                    <p className="text-sangeet-neutral-100 font-medium">{formatDate(selectedReservation.date)}</p>
                    <p className="text-sangeet-400 font-bold">{formatTime(selectedReservation.time)}</p>
                  </div>
                  <div>
                    <p className="text-sangeet-neutral-400 text-xs uppercase tracking-wider mb-1">Party Size</p>
                    <p className="text-sangeet-neutral-100 font-medium text-xl">{selectedReservation.guests} <span className="text-sm text-sangeet-neutral-400 font-normal">guests</span></p>
                  </div>
                </div>

                {selectedReservation.special_requests && (
                  <div>
                    <p className="text-sangeet-neutral-400 text-xs uppercase tracking-wider mb-2">Special Requests</p>
                    <div className="p-4 bg-blue-900/10 border-l-4 border-blue-500 rounded-r-lg">
                      <p className="text-blue-200 italic text-sm">{selectedReservation.special_requests}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-sangeet-neutral-800 bg-sangeet-neutral-950 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-2 bg-sangeet-neutral-800 hover:bg-sangeet-neutral-700 text-white font-medium rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ShiftManagerModal 
        isOpen={showShiftManager}
        onClose={() => setShowShiftManager(false)}
      />
    </div>
  );
};

export default ReservationManagementPage;
