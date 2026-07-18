"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from '@/utils/router-mock';
import OrderQueue from '../components/OrderQueue';
import CustomDropdown from '../components/CustomDropdown';
import { useAuth } from '../contexts/AuthContext';
import { isNewItem, getTimeSinceAdded, sortItemsByNewness } from '../utils/itemUtils';

import { pusherClient } from '../lib/services/pusherClient';

const KitchenDisplayPage = () => {
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    preparing: 0,
    ready: 0,
    completed: 0
  });
  const [activeFilter, setActiveFilter] = useState('preparing'); // 'all', 'preparing', 'ready', 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [kitchenUser, setKitchenUser] = useState<any>(null);
  const [userType, setUserType] = useState<any>(null); // 'admin' or 'kitchen'
  const navigate = useNavigate();

  const { user: authUser, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    setKitchenUser(authUser);
    setUserType(authUser?.role === 'admin' ? 'admin' : 'kitchen');
  }, [isAuthenticated, navigate, authUser]);

  useEffect(() => {
    pusherClient.onConnectionStateChange((status: string) => {
      setConnectionStatus(status);
    });
  }, []);

  const handleStatsUpdate = (stats: any) => {
    setOrderStats(stats);
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    toast.success(soundEnabled ? 'Sound disabled' : 'Sound enabled');
  };

  const handleLogoutOrBack = () => {
    if (userType === 'admin') {
      // Admin: Just go back to dashboard, do NOT clear session
      // Use window.location.href to reliably kill any polling/sockets
      window.location.href = '/admin/dashboard';
    } else {
      // Kitchen staff: Logout completely using universal logout
      logout();
      window.location.href = '/login';
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
                <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className={`text-xs font-medium ${connectionStatus === 'connected' ? 'text-green-400' : 'text-red-400'}`}>
                  Live Updates {connectionStatus === 'connected' ? 'On' : 'Off'}
                </span>
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
                  ← Go Back
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
        {/* Kitchen Status Metric */}
        <div className="mb-4">
          <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4 flex items-center justify-between">
            <div>
              <h2 className="text-orange-400 font-bold text-lg">Active Kitchen Queue</h2>
              <p className="text-orange-300 text-sm">Orders currently being cooked</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-orange-400">{orderStats.preparing}</p>
              <p className="text-orange-300 text-xs uppercase tracking-wider font-bold">To Cook</p>
            </div>
          </div>
        </div>

        {/* Search and Sort Row */}
        <div className="mb-4 bg-sangeet-neutral-900 border-2 border-sangeet-neutral-600 rounded-xl p-4 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-md relative">
              <input
                type="text"
                placeholder="Search by table, customer, or order #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-lg text-sangeet-neutral-300 focus:outline-none focus:border-sangeet-400 placeholder-sangeet-neutral-500"
              />
              <span className="absolute left-3 top-2.5 text-sangeet-neutral-500">
                🔍
              </span>
            </div>

          </div>
        </div>

        {/* Order Queue - Kitchen Optimized */}
        <div className="bg-sangeet-neutral-900 rounded-lg border border-sangeet-neutral-700">
          <OrderQueue 
            onStatsUpdate={handleStatsUpdate}
            soundEnabled={soundEnabled}
            kitchenMode={true}
            activeFilter={activeFilter}
            sortBy="time-oldest"
            searchQuery={searchQuery}
          />
        </div>
      </div>
    </div>
  );
};

export default KitchenDisplayPage; 