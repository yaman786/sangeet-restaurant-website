import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../assets/images/logo.png';

// Constants
const RESTAURANT_HOURS = {
  OPEN: 18, // 6 PM
  CLOSE: 23, // 11 PM
  LOCATION: 'Wanchai'
};

const NAVIGATION_ITEMS = [
  { path: '/', label: 'Home' },
  { path: '/menu', label: 'Menu' },
  { path: '/reservations', label: 'Reservations' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' }
];

/**
 * Header component - Main navigation header with responsive design
 * @returns {JSX.Element} Header component
 */
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Memoized restaurant status
  const restaurantStatus = useMemo(() => {
    const currentHour = currentTime.getHours();
    const isOpen = currentHour >= RESTAURANT_HOURS.OPEN && currentHour < RESTAURANT_HOURS.CLOSE;
    
    return {
      isOpen,
      statusText: isOpen ? 'OPEN NOW' : 'CLOSED',
      statusColor: isOpen ? 'text-green-400' : 'text-red-400',
      indicatorColor: isOpen ? 'bg-green-400' : 'bg-red-400',
      openTime: '6:00 PM',
      closeTime: '11:00 PM',
      timeText: isOpen ? 'Closes at 11:00 PM' : 'Opens at 6:00 PM',
      displayTime: isOpen ? 'Closes at 11:00 PM' : 'Opens at 6:00 PM'
    };
  }, [currentTime]);

  // Memoized active path check
  const isActive = useCallback((path) => location.pathname === path, [location.pathname]);

  // Memoized menu toggle handler
  const handleMenuToggle = useCallback(() => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
  }, [isMenuOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('#mobile-menu') && !event.target.closest('button[aria-controls="mobile-menu"]')) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Mobile menu button - Fork, Plate, Knife Sticky Icon - Outside Header */}
      <button
        onClick={handleMenuToggle}
        className="md:hidden fixed left-1/2 transform -translate-x-1/2 top-4 p-3 rounded-xl text-white hover:text-sangeet-400 hover:bg-sangeet-neutral-800/50 focus:outline-none transition-all duration-300 touch-manipulation z-[999999] bg-sangeet-neutral-900/90 backdrop-blur-md border border-sangeet-neutral-700/50 active:scale-95 shadow-lg"
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={isMenuOpen}
        aria-controls="mobile-menu"
        style={{ 
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
          minHeight: '44px',
          minWidth: '44px'
        }}
      >
        <div className="w-7 h-7 flex items-center justify-center relative">
          {/* Plate */}
          <motion.div
            animate={isMenuOpen ? { scale: 0.6, rotate: 15 } : { scale: 1, rotate: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-5 h-5 border-2 border-white rounded-full relative"
          >
            {/* Plate inner circle */}
            <div className="absolute inset-1 border border-white rounded-full opacity-60"></div>
          </motion.div>
          
          {/* Fork */}
          <motion.div
            animate={isMenuOpen ? { x: -10, y: -10, rotate: -45, opacity: 0.5 } : { x: 0, y: 0, rotate: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute left-0 top-0 w-0.5 h-4 bg-white rounded-full"
          >
            {/* Fork tines */}
            <div className="absolute -top-1 left-0 w-0.5 h-1 bg-white rounded-full"></div>
            <div className="absolute -top-1 left-1 w-0.5 h-1 bg-white rounded-full"></div>
            <div className="absolute -top-1 left-2 w-0.5 h-1 bg-white rounded-full"></div>
            <div className="absolute -top-1 left-3 w-0.5 h-1 bg-white rounded-full"></div>
          </motion.div>
          
          {/* Knife */}
          <motion.div
            animate={isMenuOpen ? { x: 10, y: -10, rotate: 45, opacity: 0.5 } : { x: 0, y: 0, rotate: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute right-0 top-0 w-0.5 h-4 bg-white rounded-full"
          >
            {/* Knife blade */}
            <div className="absolute -top-1 right-0 w-2.5 h-0.5 bg-white rounded-full transform rotate-45 origin-left"></div>
          </motion.div>
          
          {/* X overlay when open - Made more visible */}
          <motion.div
            animate={isMenuOpen ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-7 h-0.5 bg-red-500 rounded-full rotate-45 shadow-lg"></div>
            <div className="w-7 h-0.5 bg-red-500 rounded-full -rotate-45 absolute shadow-lg"></div>
          </motion.div>
        </div>
      </button>

      {/* Mobile Navigation Menu - Rendered Outside Header */}
      {isMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998]"
          onClick={() => {
            setIsMenuOpen(false);
          }}
        >
          <motion.nav
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="bg-gradient-to-b from-sangeet-neutral-900 to-sangeet-neutral-950 border-t border-sangeet-neutral-800 fixed top-0 left-0 right-0 z-[99998] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              paddingTop: '4rem',
              minHeight: '50vh'
            }}
          >
            {/* Restaurant Status Banner for Mobile */}
            <div className="px-4 py-3 border-b border-sangeet-neutral-800 bg-sangeet-neutral-800/30">
              <div className="flex items-center justify-between bg-sangeet-neutral-800/50 backdrop-blur-sm rounded-full px-4 py-2 border border-sangeet-neutral-600/30">
                <div className="flex items-center space-x-2">
                  <div 
                    className={`w-3 h-3 rounded-full ${restaurantStatus.indicatorColor} animate-pulse shadow-sm`}
                    aria-hidden="true"
                  />
                  <span className={`text-sm font-semibold ${restaurantStatus.statusColor}`}>
                    {restaurantStatus.statusText}
                  </span>
                </div>
                <div className="text-xs text-sangeet-neutral-400">
                  {restaurantStatus.displayTime}
                </div>
                <div className="text-xs text-sangeet-neutral-400">
                  📍 {RESTAURANT_HOURS.LOCATION}
                </div>
              </div>
            </div>
            
            <div className="px-2 pt-2 pb-3 space-y-1">
              {NAVIGATION_ITEMS.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    setIsMenuOpen(false);
                  }}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 touch-manipulation focus:outline-none focus:ring-2 focus:ring-sangeet-400 focus:ring-offset-2 focus:ring-offset-sangeet-neutral-900 ${
                    isActive(item.path)
                      ? 'text-sangeet-400 bg-sangeet-neutral-800/50 font-semibold shadow-lg'
                      : 'text-sangeet-neutral-300 hover:text-sangeet-400 hover:bg-sangeet-neutral-800/30'
                  }`}
                  aria-current={isActive(item.path) ? 'page' : undefined}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">
                      {item.path === '/' && '🏠'}
                      {item.path === '/menu' && '🍽️'}
                      {item.path === '/reservations' && '📅'}
                      {item.path === '/about' && 'ℹ️'}
                      {item.path === '/contact' && '📞'}
                    </span>
                    <span>{item.label}</span>
                  </div>
                </Link>
              ))}
              
              {/* Quick Actions Section */}
              <div className="mt-6 pt-4 border-t border-sangeet-neutral-700/50">
                <h3 className="px-4 py-2 text-xs font-semibold text-sangeet-neutral-400 uppercase tracking-wider">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <a
                    href="tel:+852-1234-5678"
                    className="block px-4 py-3 rounded-lg text-base font-medium text-sangeet-neutral-300 hover:text-sangeet-400 hover:bg-sangeet-neutral-800/30 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">📞</span>
                      <span>Call Now</span>
                    </div>
                  </a>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-3 rounded-lg text-base font-medium text-sangeet-neutral-300 hover:text-sangeet-400 hover:bg-sangeet-neutral-800/30 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">📍</span>
                      <span>Get Directions</span>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </motion.nav>
        </div>
      )}

      <header className={`bg-gradient-to-r from-sangeet-neutral-950/98 to-sangeet-neutral-900/98 backdrop-blur-2xl md:fixed md:top-0 md:left-0 md:right-0 z-50 border-b border-sangeet-neutral-600/50 shadow-2xl shadow-black/50 md:transition-all md:duration-300 ${
        isScrolled ? 'md:from-sangeet-neutral-950/99 md:to-sangeet-neutral-900/99 md:shadow-2xl' : 'md:from-sangeet-neutral-950/98 md:to-sangeet-neutral-900/98 md:shadow-xl'
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16 relative">
            {/* Logo - Only on Desktop */}
            <Link 
              to="/" 
              className="hidden md:flex items-center"
              aria-label="Sangeet Restaurant Home"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2"
              >
                <img 
                  src={logo} 
                  alt="Sangeet Restaurant Logo" 
                  className="h-8 w-auto"
                />
                <span className="text-xl font-bold text-white hidden lg:block">
                  Sangeet
                </span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {NAVIGATION_ITEMS.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sangeet-400 focus:ring-offset-2 focus:ring-offset-sangeet-neutral-900 ${
                    isActive(item.path)
                      ? 'text-sangeet-400'
                      : 'text-sangeet-neutral-300 hover:text-sangeet-400'
                  }`}
                  aria-current={isActive(item.path) ? 'page' : undefined}
                >
                  {item.label}
                  {isActive(item.path) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-sangeet-neutral-800/50 rounded-lg -z-10"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
              
              {/* Restaurant Status Indicator */}
              <div 
                className="flex items-center space-x-2 lg:space-x-4 bg-sangeet-neutral-800/50 backdrop-blur-sm rounded-full px-3 lg:px-4 py-2 border border-sangeet-neutral-600/30"
                role="status"
                aria-live="polite"
              >
                <div className="flex items-center space-x-2">
                  <div 
                    className={`w-2 lg:w-3 h-2 lg:h-3 rounded-full ${restaurantStatus.indicatorColor} animate-pulse shadow-sm`}
                    aria-hidden="true"
                  />
                  <span className={`text-xs lg:text-sm font-semibold ${restaurantStatus.statusColor}`}>
                    {restaurantStatus.statusText}
                  </span>
                </div>
                <div className="hidden lg:block text-xs text-sangeet-neutral-400">
                  {restaurantStatus.displayTime}
                </div>
                <div className="hidden xl:block text-xs text-sangeet-neutral-400">
                  📍 {RESTAURANT_HOURS.LOCATION}
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Spacer for fixed header on desktop */}
      <div className="hidden md:block h-16"></div>
    </>
  );
};

export default Header; 