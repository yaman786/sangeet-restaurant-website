import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
// Real-time notifications temporarily disabled during socket reset
// import RealTimeNotifications from './RealTimeNotifications';
import { logout } from '../utils/auth';

const AdminHeader = ({ title, subtitle, showBackButton = true, onBackClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      // Default back navigation logic
      if (location.pathname.includes('/admin/menu-management')) {
        navigate('/admin/dashboard');
      } else if (location.pathname.includes('/admin/qr-management')) {
        navigate('/admin/dashboard');
      } else if (location.pathname.includes('/admin/kitchen')) {
        navigate('/admin/dashboard');
      } else if (location.pathname.includes('/admin/orders')) {
        navigate('/admin/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    }
  };

  const getPageTitle = () => {
    if (title) return title;
    
    if (location.pathname.includes('/admin/menu-management')) {
      return 'Menu Management';
    } else if (location.pathname.includes('/admin/qr-management')) {
      return 'QR Code Management';
    } else if (location.pathname.includes('/admin/kitchen')) {
      return 'Kitchen Display';
    } else if (location.pathname.includes('/admin/orders')) {
      return 'Order Management';
    } else {
      return 'Admin Dashboard';
    }
  };

  const getPageSubtitle = () => {
    if (subtitle) return subtitle;
    
    if (location.pathname.includes('/admin/menu-management')) {
      return 'Manage menu items and categories';
    } else if (location.pathname.includes('/admin/qr-management')) {
      return 'Generate and manage QR codes';
    } else if (location.pathname.includes('/admin/kitchen')) {
      return 'Real-time kitchen order management';
    } else if (location.pathname.includes('/admin/orders')) {
      return 'Manage orders and monitor operations';
    } else {
      return 'Restaurant management dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-sangeet-neutral-900 to-sangeet-neutral-800 border-b border-sangeet-neutral-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-sangeet-400 to-sangeet-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl">🍽️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-sangeet-400">{getPageTitle()}</h1>
              <p className="text-sangeet-neutral-400 text-sm">{getPageSubtitle()}</p>
            </div>
          </div>

          {/* Navigation and Actions */}
          <div className="flex items-center space-x-4">
            {/* Back Button */}
            {showBackButton && location.pathname !== '/admin/dashboard' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackClick}
                className="flex items-center space-x-2 px-4 py-2 bg-sangeet-400 text-sangeet-neutral-950 rounded-lg font-medium hover:bg-sangeet-300 transition-colors shadow-md"
              >
                <span className="text-lg">←</span>
                <span>Go Back</span>
              </motion.button>
            )}

            {/* Real-time Notifications (disabled for clean socket reset) */}
            {/* <RealTimeNotifications /> */}

            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center space-x-2 text-sangeet-neutral-300 hover:text-sangeet-400 transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-sangeet-400 to-sangeet-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-sangeet-neutral-950">A</span>
                </div>
                <span className="hidden md:block">Admin</span>
                <span className="text-xs">▼</span>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-sangeet-neutral-800 rounded-lg shadow-xl border border-sangeet-neutral-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-2">
                  <button
                    onClick={() => navigate('/admin/dashboard')}
                    className="w-full text-left px-4 py-2 text-sangeet-neutral-300 hover:bg-sangeet-neutral-700 hover:text-sangeet-400 transition-colors"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => logout(navigate)}
                    className="w-full text-left px-4 py-2 text-sangeet-neutral-300 hover:bg-sangeet-neutral-700 hover:text-sangeet-400 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
