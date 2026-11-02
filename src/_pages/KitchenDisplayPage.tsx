"use client";
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from '@/utils/router-mock';
import OrderQueue from '../components/OrderQueue';
import { useAuth } from '../contexts/AuthContext';

import { pusherClient } from '../lib/services/pusherClient';
import type { OrderStation } from '../lib/utils/menuSection';

const KitchenDisplayPage = ({ defaultStation = 'kot' as OrderStation }: { defaultStation?: OrderStation }) => {
  const [station, setStation] = useState<OrderStation>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('station');
      if (q === 'kot' || q === 'bot' || q === 'all') return q;
    }
    return defaultStation;
  });
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
    queueMicrotask(() => {
      setKitchenUser(authUser);
      setUserType(authUser?.role === 'admin' ? 'admin' : 'kitchen');
    });
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
                <span className="text-lg">{station === 'bot' ? '🍷' : '🍳'}</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-sangeet-neutral-100">
                  {station === 'bot'
                    ? 'Bar Display — BOT (Drinks)'
                    : station === 'kot'
                      ? 'Kitchen Display — KOT (Food)'
                      : 'Master Station Display (KOT + BOT)'}
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

              {/* Navigation */}
              <button
                onClick={() => {
                  window.location.href = '/admin/dashboard';
                }}
                className="px-3 py-1.5 bg-sangeet-400 text-sangeet-neutral-950 rounded-md text-sm font-medium hover:bg-sangeet-300 transition-colors"
              >
                ← Go Back
              </button>
              {userType !== 'admin' && (
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
        {/* Station Switcher (KOT vs BOT vs All) */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-sangeet-neutral-900 border border-sangeet-neutral-700 rounded-xl p-3">
          <div className="inline-flex rounded-lg bg-sangeet-neutral-950 p-1 border border-sangeet-neutral-800">
            <button
              type="button"
              data-testid="station-tab-kot"
              onClick={() => setStation('kot')}
              className={`px-4 py-2 rounded-md text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                station === 'kot'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-sangeet-neutral-400 hover:text-white'
              }`}
            >
              🍳 Kitchen (KOT)
            </button>
            <button
              type="button"
              data-testid="station-tab-bot"
              onClick={() => setStation('bot')}
              className={`px-4 py-2 rounded-md text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                station === 'bot'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-sangeet-neutral-400 hover:text-white'
              }`}
            >
              🍷 Bar &amp; Drinks (BOT)
            </button>
            <button
              type="button"
              data-testid="station-tab-all"
              onClick={() => setStation('all')}
              className={`px-4 py-2 rounded-md text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                station === 'all'
                  ? 'bg-sangeet-400 text-sangeet-neutral-950 shadow-md'
                  : 'text-sangeet-neutral-400 hover:text-white'
              }`}
            >
              📋 All Stations
            </button>
          </div>

          {/* Queue Filter Pills */}
          <div className="inline-flex rounded-lg bg-sangeet-neutral-950 p-1 border border-sangeet-neutral-800">
            <button
              type="button"
              data-testid="station-filter-preparing"
              onClick={() => setActiveFilter('preparing')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === 'preparing'
                  ? 'bg-sangeet-neutral-800 text-orange-400 border border-orange-500/40'
                  : 'text-sangeet-neutral-400 hover:text-white'
              }`}
            >
              🔥 To Prepare ({orderStats.preparing})
            </button>
            <button
              type="button"
              data-testid="station-filter-ready"
              onClick={() => setActiveFilter('ready')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === 'ready'
                  ? 'bg-sangeet-neutral-800 text-green-400 border border-green-500/40'
                  : 'text-sangeet-neutral-400 hover:text-white'
              }`}
            >
              ✅ Ready ({orderStats.ready})
            </button>
            <button
              type="button"
              data-testid="station-filter-all"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-sangeet-neutral-800 text-sangeet-400 border border-sangeet-400/40'
                  : 'text-sangeet-neutral-400 hover:text-white'
              }`}
            >
              All Active ({orderStats.total})
            </button>
          </div>
        </div>

        {/* Station Status Metric */}
        <div className="mb-4">
          <div
            className={`rounded-lg p-4 flex items-center justify-between border ${
              station === 'bot'
                ? 'bg-purple-900/20 border-purple-500/30'
                : 'bg-orange-900/20 border-orange-500/30'
            }`}
          >
            <div>
              <h2
                className={`font-bold text-lg ${
                  station === 'bot' ? 'text-purple-300' : 'text-orange-400'
                }`}
              >
                {station === 'bot'
                  ? 'Active Bar Queue (BOT)'
                  : station === 'kot'
                    ? 'Active Kitchen Queue (KOT)'
                    : 'Active Master Queue (KOT + BOT)'}
              </h2>
              <p
                className={`text-sm ${
                  station === 'bot' ? 'text-purple-200/80' : 'text-orange-300'
                }`}
              >
                {station === 'bot'
                  ? 'Drink tickets currently waiting to be poured / packed'
                  : 'Food tickets currently being cooked / packed'}
              </p>
            </div>
            <div className="text-right">
              <p
                className={`text-3xl font-black ${
                  station === 'bot' ? 'text-purple-300' : 'text-orange-400'
                }`}
              >
                {orderStats.preparing}
              </p>
              <p
                className={`text-xs uppercase tracking-wider font-bold ${
                  station === 'bot' ? 'text-purple-200/80' : 'text-orange-300'
                }`}
              >
                {station === 'bot' ? 'To Pour' : 'To Cook'}
              </p>
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
                className="w-full px-4 py-2 pl-10 bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-lg text-sangeet-neutral-300 focus:outline-hidden focus:border-sangeet-400 placeholder-sangeet-neutral-500"
              />
              <span className="absolute left-3 top-2.5 text-sangeet-neutral-500">
                🔍
              </span>
            </div>

          </div>
        </div>

        {/* Order Queue - Station Optimized */}
        <div className="bg-sangeet-neutral-900 rounded-lg border border-sangeet-neutral-700">
          <OrderQueue 
            onStatsUpdate={handleStatsUpdate}
            soundEnabled={soundEnabled}
            kitchenMode={true}
            station={station}
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