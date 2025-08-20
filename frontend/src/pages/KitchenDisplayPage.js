import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import OrderQueue from '../components/OrderQueue';
import CustomDropdown from '../components/CustomDropdown';
import { logout } from '../utils/auth';
import { isNewItem, getTimeSinceAdded, sortItemsByNewness } from '../utils/itemUtils';

const KitchenDisplayPage = () => {
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    preparing: 0,
    ready: 0,
    completed: 0
  });
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'pending', 'preparing', 'ready', 'completed'
  const [sortBy, setSortBy] = useState('priority'); // 'priority', 'time', 'table', 'customer', 'amount'
  const [soundEnabled, setSoundEnabled] = useState(true);

  const sortOptions = [
    { value: 'priority', label: 'Priority (Pending → Ready)' },
    { value: 'time', label: 'Time (Newest First)' },
    { value: 'time-oldest', label: 'Time (Oldest First)' },
    { value: 'table', label: 'Table Number' },
    { value: 'customer', label: 'Customer Name' },
    { value: 'amount', label: 'Amount (High to Low)' },
    { value: 'amount-low', label: 'Amount (Low to High)' }
  ];
  // eslint-disable-next-line no-unused-vars
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [kitchenUser, setKitchenUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'admin' or 'kitchen'
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin or kitchen user is logged in (admin takes priority)
    const adminToken = localStorage.getItem('adminToken');
    const kitchenToken = localStorage.getItem('kitchenToken');
    const adminUser = localStorage.getItem('adminUser');
    const kitchenUser = localStorage.getItem('kitchenUser');
    
    console.log('🔍 Kitchen Display Auth Check:');
    console.log('Admin Token:', adminToken ? 'Present' : 'Not found');
    console.log('Kitchen Token:', kitchenToken ? 'Present' : 'Not found');
    console.log('Admin User:', adminUser ? 'Present' : 'Not found');
    console.log('Kitchen User:', kitchenUser ? 'Present' : 'Not found');
    
    if (adminToken && adminUser) {
      try {
        const userData = JSON.parse(adminUser);
        console.log('👑 Setting as Admin:', userData.username, userData.role);
        setKitchenUser(userData);
        setUserType('admin');
      } catch (error) {
        console.error('Error parsing admin user data:', error);
        navigate('/login');
      }
    } else if (kitchenToken && kitchenUser) {
      try {
        const userData = JSON.parse(kitchenUser);
        console.log('👨‍🍳 Setting as Kitchen Staff:', userData.username, userData.role);
        setKitchenUser(userData);
        setUserType('kitchen');
      } catch (error) {
        console.error('Error parsing kitchen user data:', error);
        navigate('/login');
      }
    } else {
      console.log('❌ No valid tokens found, redirecting to login');
      navigate('/login');
    }
  }, [navigate]);

  const handleStatsUpdate = (stats) => {
    setOrderStats(stats);
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    toast.success(soundEnabled ? 'Sound disabled' : 'Sound enabled');
  };

  const handleLogoutOrBack = () => {
    if (userType === 'admin') {
      // Admin: Just go back to dashboard, do NOT clear session
      navigate('/admin/dashboard');
    } else {
      // Kitchen staff: Logout completely using universal logout
      logout(navigate);
    }
  };

  if (!kitchenUser) {
    return (
      <div className="min-h-screen bg-sangeet-neutral-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sangeet-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sangeet-neutral-950">
      {/* Kitchen Header */}
      <header className="bg-sangeet-neutral-900 border-b border-sangeet-neutral-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-sangeet-400/20 rounded-lg flex items-center justify-center">
                <span className="text-lg">🍳</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-sangeet-neutral-100">
                  {userType === 'admin' ? 'Kitchen Display (Admin View)' : 'Kitchen Display (Staff)'}
                </h1>
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-sangeet-neutral-400">
                    {kitchenUser.username}
                  </p>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                    userType === 'admin' 
                      ? 'bg-sangeet-400 text-sangeet-neutral-950' 
                      : 'bg-orange-400 text-white'
                  }`}>
                    {userType === 'admin' ? 'Admin' : 'Staff'}
                  </span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-3">
              {/* Live Updates Indicator */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400 font-medium">Live Updates</span>
              </div>
              
              {/* Connection Status */}
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-xs text-sangeet-neutral-400">
                  {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              {/* Sound Toggle */}
              <button
                onClick={toggleSound}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  soundEnabled 
                    ? 'bg-sangeet-400 text-sangeet-neutral-950' 
                    : 'bg-sangeet-neutral-700 text-sangeet-neutral-300'
                }`}
              >
                {soundEnabled ? '🔊' : '🔇'}
              </button>

              {/* Navigation based on user type */}
              {userType === 'admin' ? (
                <button
                  onClick={handleLogoutOrBack}
                  className="px-3 py-1.5 bg-sangeet-400 text-sangeet-neutral-950 rounded-md text-sm font-medium hover:bg-sangeet-300 transition-colors"
                >
                  ← Back to Dashboard
                </button>
              ) : (
                <button
                  onClick={handleLogoutOrBack}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Interactive Filter Cards - Kitchen Focused */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setActiveFilter('all')}
            className={`rounded-lg p-3 border transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-xl ${
              activeFilter === 'all'
                ? 'bg-sangeet-400/20 border-sangeet-400/50 shadow-lg'
                : 'bg-sangeet-neutral-900 border-sangeet-neutral-700 hover:bg-sangeet-neutral-800 hover:border-sangeet-neutral-600'
            }`}
          >
            <h3 className={`text-xs font-medium ${
              activeFilter === 'all' ? 'text-sangeet-400' : 'text-sangeet-neutral-400'
            }`}>All Orders</h3>
            <p className={`text-xl font-bold ${
              activeFilter === 'all' ? 'text-sangeet-400' : 'text-sangeet-neutral-100'
            }`}>{orderStats.total}</p>
          </motion.button>
          
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => setActiveFilter('pending')}
            className={`rounded-lg p-3 border transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-xl ${
              activeFilter === 'pending'
                ? 'bg-yellow-400/20 border-yellow-400/50 shadow-lg'
                : 'bg-yellow-900/20 border-yellow-500/30 hover:bg-yellow-900/30 hover:border-yellow-400/50'
            }`}
          >
            <h3 className={`text-xs font-medium ${
              activeFilter === 'pending' ? 'text-yellow-300' : 'text-yellow-400'
            }`}>Pending</h3>
            <p className={`text-xl font-bold ${
              activeFilter === 'pending' ? 'text-yellow-300' : 'text-yellow-400'
            }`}>{orderStats.pending}</p>
          </motion.button>
          
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => setActiveFilter('preparing')}
            className={`rounded-lg p-3 border transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-xl ${
              activeFilter === 'preparing'
                ? 'bg-orange-400/20 border-orange-400/50 shadow-lg'
                : 'bg-orange-900/20 border-orange-500/30 hover:bg-orange-900/30 hover:border-orange-400/50'
            }`}
          >
            <h3 className={`text-xs font-medium ${
              activeFilter === 'preparing' ? 'text-orange-300' : 'text-orange-400'
            }`}>Preparing</h3>
            <p className={`text-xl font-bold ${
              activeFilter === 'preparing' ? 'text-orange-300' : 'text-orange-400'
            }`}>{orderStats.preparing}</p>
          </motion.button>
          
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => setActiveFilter('ready')}
            className={`rounded-lg p-3 border transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-xl ${
              activeFilter === 'ready'
                ? 'bg-green-400/20 border-green-400/50 shadow-lg'
                : 'bg-green-900/20 border-green-500/30 hover:bg-green-900/30 hover:border-green-400/50'
            }`}
          >
            <h3 className={`text-xs font-medium ${
              activeFilter === 'ready' ? 'text-green-300' : 'text-green-400'
            }`}>Ready</h3>
            <p className={`text-xl font-bold ${
              activeFilter === 'ready' ? 'text-green-300' : 'text-green-400'
            }`}>{orderStats.ready}</p>
          </motion.button>
          
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => setActiveFilter('completed')}
            className={`rounded-lg p-3 border transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-xl ${
              activeFilter === 'completed'
                ? 'bg-gray-400/20 border-gray-400/50 shadow-lg'
                : 'bg-gray-900/20 border-gray-500/30 hover:bg-gray-900/30 hover:border-gray-400/50'
            }`}
          >
            <h3 className={`text-xs font-medium ${
              activeFilter === 'completed' ? 'text-gray-300' : 'text-gray-400'
            }`}>Completed</h3>
            <p className={`text-xl font-bold ${
              activeFilter === 'completed' ? 'text-gray-300' : 'text-gray-400'
            }`}>{orderStats.completed}</p>
          </motion.button>
        </div>

        {/* Sort Options - Only show when "All Orders" is selected */}
        {activeFilter === 'all' && (
          <div className="mb-4 bg-sangeet-neutral-900 border-2 border-sangeet-neutral-600 rounded-xl p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sangeet-400 text-lg">📊</span>
                  <span className="text-sm font-bold text-sangeet-neutral-100">Sort Orders</span>
                </div>
                <CustomDropdown
                  value={sortBy}
                  onChange={setSortBy}
                  options={sortOptions}
                  className="min-w-[280px]"
                />
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-sangeet-400 rounded-full animate-pulse shadow-lg"></div>
                <span className="text-xs text-sangeet-neutral-300 font-semibold bg-sangeet-neutral-800 px-3 py-1 rounded-full">
                  {sortBy === 'priority' && '🔄 Priority workflow'}
                  {sortBy === 'time' && '⏰ Latest orders first'}
                  {sortBy === 'time-oldest' && '⏰ First-come-first-served'}
                  {sortBy === 'table' && '🪑 Table grouping'}
                  {sortBy === 'customer' && '👤 Alphabetical order'}
                  {sortBy === 'amount' && '💰 Premium orders first'}
                  {sortBy === 'amount-low' && '💰 Quick orders first'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Order Queue - Kitchen Optimized */}
        <div className="bg-sangeet-neutral-900 rounded-lg border border-sangeet-neutral-700">
          <OrderQueue 
            onStatsUpdate={handleStatsUpdate}
            soundEnabled={soundEnabled}
            kitchenMode={true}
            activeFilter={activeFilter}
            sortBy={sortBy}
          />
        </div>
      </div>
    </div>
  );
};

export default KitchenDisplayPage; 