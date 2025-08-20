import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';

// Services
import socketService from './services/socketService';
import { clearAllCartData } from './utils/cartUtils';
import toast from 'react-hot-toast';

// Pages - Lazy loaded for better performance
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import QRMenuPage from './pages/QRMenuPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import QRCodeDisplayPage from './pages/QRCodeDisplayPage';
import ReservationsPage from './pages/ReservationsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import QRCartPage from './pages/QRCartPage';
import AdminDashboard from './pages/AdminDashboard';
import MenuManagementPage from './pages/MenuManagementPage';
import QRManagementPage from './pages/QRManagementPage';
import KitchenDisplayPage from './pages/KitchenDisplayPage';
import ReservationManagementPage from './pages/ReservationManagementPage';
import StaffManagementPage from './pages/StaffManagementPage';
import RestaurantWebsiteManagementPage from './pages/RestaurantWebsiteManagementPage';
import AnalyticsReportsPage from './pages/AnalyticsReportsPage';
import LoginPage from './pages/LoginPage';
import ReviewSubmissionPage from './pages/ReviewSubmissionPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import UnifiedOrderPage from './pages/UnifiedOrderPage';
import UnifiedDashboardPage from './pages/UnifiedDashboardPage';

import NotFoundPage from './pages/NotFoundPage';

// Services
import { fetchMenuItems, fetchReviews, fetchEvents } from './services/api';

// Constants
const ANIMATION_CONFIG = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
};

const CONTAINER_CLASSES = 'min-h-screen bg-sangeet-neutral-950 w-full overflow-x-hidden';

/**
 * ScrollToTop component - Scrolls to top on route change
 * @returns {null} - No visual output
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

/**
 * LoadingSpinner component - Reusable loading state
 * @param {string} message - Loading message to display
 * @returns {JSX.Element} Loading spinner component
 */
function LoadingSpinner({ message = 'Loading Authentic Flavors...' }) {
  return (
    <div className="min-h-screen bg-sangeet-neutral-950 flex items-center justify-center">
      <div className="text-center">
        <div className="spinner mx-auto mb-4" />
        <p className="text-sangeet-400">{message}</p>
      </div>
    </div>
  );
}

/**
 * AnimatedRoute wrapper - Provides consistent page transitions
 * @param {React.ReactNode} children - Child components to animate
 * @returns {JSX.Element} Animated route wrapper
 */
function AnimatedRoute({ children }) {
  return (
    <motion.div {...ANIMATION_CONFIG}>
      {children}
    </motion.div>
  );
}

/**
 * Main App component - Handles routing and data loading
 * @returns {JSX.Element} Main application component
 */
function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const location = useLocation();

  // Memoized route checks for performance
  const isQRRoute = useMemo(() => {
    return location.pathname.startsWith('/qr/');
  }, [location.pathname]);

  // Memoized data loading function
  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [menuData, reviewsData, eventsData] = await Promise.all([
        fetchMenuItems(),
        fetchReviews(),
        fetchEvents()
      ]);
      
      setMenuItems(menuData || []);
      setReviews(reviewsData || []);
      setEvents(eventsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      console.log('Using fallback data - API may not be available');
      
      // Fallback data if API fails
      setMenuItems([
        {
          id: 1,
          name: "Butter Chicken",
          description: "Creamy tomato-based curry with tender chicken",
          price: 18.99,
          category_name: "Main Course",
          image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
          is_vegetarian: false,
          is_spicy: false,
          is_popular: true,
          preparation_time: 20
        },
        {
          id: 2,
          name: "Paneer Tikka",
          description: "Grilled cottage cheese with aromatic spices",
          price: 16.99,
          category_name: "Appetizers",
          image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
          is_vegetarian: true,
          is_spicy: false,
          is_popular: true,
          preparation_time: 15
        }
      ]);
      
      setReviews([
        {
          id: 1,
          customer_name: "Anika Sharma",
          review_text: "Sangeet offers an unparalleled dining experience. The Butter Chicken is a must-try! ★★★★★",
          rating: 5,
          image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
          is_verified: true
        },
        {
          id: 2,
          customer_name: "Rohan Kapoor",
          review_text: "The ambiance is lovely, and the food is generally good. I especially enjoyed the momos. ★★★★",
          rating: 4,
          image_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
          is_verified: true
        }
      ]);
      
      setEvents([
        {
          id: 1,
          title: "Diwali Celebration",
          description: "A night of music, dance, and special dishes to celebrate the Festival of Lights",
          date: "2024-11-12T00:00:00.000Z",
          image_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
          is_featured: true
        },
        {
          id: 2,
          title: "Holi Festival",
          description: "Join us for a colorful celebration with traditional sweets and special menu",
          date: "2025-03-08T00:00:00.000Z",
          image_url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop",
          is_featured: true
        }
      ]);
      
      // Don't show error, just use fallback data
      console.log('Using fallback data successfully');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Global order deletion listener - clears cart data when order is deleted
  useEffect(() => {
    // Connect to socket service
    
    socketService.connect();
    
    // Check socket connection status
    setTimeout(() => {
      
    }, 1000);

    // Listen for order deletion events globally
    const handleOrderDeleted = (data) => {
      
      
      // Clear all cart data when any order is deleted
      const success = clearAllCartData();
      
      if (success) {
        
        toast.success('Order has been cancelled. Your cart has been cleared.');
      } else {
        
      }
    };

    socketService.onOrderDeleted(handleOrderDeleted);

    // Cleanup function
    return () => {
      socketService.removeListener('order-deleted');
    };
  }, []);

  // Show loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-sangeet-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={loadData}
            className="bg-sangeet-400 text-sangeet-neutral-950 px-4 py-2 rounded-lg hover:bg-sangeet-300 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // QR Ordering Experience (Standalone)
  if (isQRRoute) {
    return (
      <div className={CONTAINER_CLASSES}>
        <ScrollToTop />
        <AnimatePresence mode="wait">
          <Routes>
            <Route
              path="/qr/:qrCode"
              element={
                <AnimatedRoute>
                  <QRMenuPage />
                </AnimatedRoute>
              }
            />
            <Route
              path="/qr/:qrCode/cart"
              element={
                <AnimatedRoute>
                  <QRCartPage />
                </AnimatedRoute>
              }
            />
            <Route
              path="/order-success"
              element={
                <AnimatedRoute>
                  <OrderSuccessPage />
                </AnimatedRoute>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>
    );
  }

  // Kitchen Experience (Standalone)
  if (location.pathname.startsWith('/kitchen/')) {
    return (
      <div className={CONTAINER_CLASSES}>
        <ScrollToTop />
        <AnimatePresence mode="wait">
          <Routes>
            <Route
              path="/kitchen/login"
              element={
                <AnimatedRoute>
                  <LoginPage />
                </AnimatedRoute>
              }
            />
            <Route
              path="/kitchen/display"
              element={
                <ErrorBoundary>
                  <AnimatedRoute>
                    <ProtectedRoute requiredRole="kitchen">
                      <KitchenDisplayPage />
                    </ProtectedRoute>
                  </AnimatedRoute>
                </ErrorBoundary>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>
    );
  }

  // Standalone Pages Experience (No Header/Footer)
  if (location.pathname === '/order' || location.pathname === '/dashboard') {
    return (
      <div className={CONTAINER_CLASSES}>
        <ScrollToTop />
        <AnimatePresence mode="wait">
          <Routes>
            <Route
              path="/order"
              element={
                <UnifiedOrderPage />
              }
            />
            <Route
              path="/dashboard"
              element={
                <UnifiedDashboardPage />
              }
            />
          </Routes>
        </AnimatePresence>
      </div>
    );
  }

  // Login Experience (Standalone)
  if (location.pathname === '/login') {
    return (
      <div className={CONTAINER_CLASSES}>
        <ScrollToTop />
        <AnimatePresence mode="wait">
          <Routes>
            <Route
              path="/login"
              element={
                <AnimatedRoute>
                  <LoginPage />
                </AnimatedRoute>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>
    );
  }

  // Admin Dashboard Experience (Standalone)
  if (location.pathname.startsWith('/admin/')) {
    return (
      <div className={CONTAINER_CLASSES}>
        <ScrollToTop />
        <AnimatePresence mode="wait">
          <Routes>
            <Route
              path="/admin/login"
              element={
                <AnimatedRoute>
                  <LoginPage />
                </AnimatedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <AnimatedRoute>
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                </AnimatedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ErrorBoundary>
                  <AnimatedRoute>
                    {(() => {
              
                      return <AdminOrdersPage />;
                    })()}
                  </AnimatedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/admin/menu-management"
              element={
                <AnimatedRoute>
                  <MenuManagementPage />
                </AnimatedRoute>
              }
            />
            <Route
              path="/admin/qr-management"
              element={
                <AnimatedRoute>
                  <QRManagementPage />
                </AnimatedRoute>
              }
            />
            <Route
              path="/admin/reservations"
              element={
                <ErrorBoundary>
                  <AnimatedRoute>
                    <ReservationManagementPage />
                  </AnimatedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/admin/staff-management"
              element={
                <ErrorBoundary>
                  <AnimatedRoute>
                    <StaffManagementPage />
                  </AnimatedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/admin/website-management"
              element={
                <ErrorBoundary>
                  <AnimatedRoute>
                    <RestaurantWebsiteManagementPage />
                  </AnimatedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ErrorBoundary>
                  <AnimatedRoute>
                    <AnalyticsReportsPage />
                  </AnimatedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/admin/kitchen"
              element={
                <ErrorBoundary>
                  <AnimatedRoute>
                    <KitchenDisplayPage />
                  </AnimatedRoute>
                </ErrorBoundary>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>
    );
  }

  // Regular Website Experience (With Header/Footer)
  return (
    <div className={CONTAINER_CLASSES}>
      <ScrollToTop />
      <Header />
      
      <AnimatePresence mode="wait">
        <Routes>
          <Route 
            path="/" 
            element={
              <AnimatedRoute>
                <HomePage 
                  menuItems={menuItems}
                  reviews={reviews}
                  events={events}
                />
              </AnimatedRoute>
            } 
          />
          <Route 
            path="/menu" 
            element={
              <AnimatedRoute>
                <MenuPage />
              </AnimatedRoute>
            } 
          />
          <Route 
            path="/admin/orders" 
            element={
              <AnimatedRoute>
                <AdminOrdersPage />
              </AnimatedRoute>
            } 
          />
          <Route 
            path="/kitchen" 
            element={
              <AnimatedRoute>
                <KitchenDisplayPage />
              </AnimatedRoute>
            } 
          />
          <Route 
            path="/qr-codes" 
            element={
              <AnimatedRoute>
                <QRCodeDisplayPage />
              </AnimatedRoute>
            } 
          />
          <Route 
            path="/reservations" 
            element={
              <AnimatedRoute>
                <ReservationsPage />
              </AnimatedRoute>
            } 
          />
          <Route 
            path="/about" 
            element={
              <AnimatedRoute>
                <AboutPage />
              </AnimatedRoute>
            } 
          />
          <Route 
            path="/contact" 
            element={
              <AnimatedRoute>
                <ContactPage />
              </AnimatedRoute>
            } 
          />
          <Route 
            path="/review" 
            element={
              <AnimatedRoute>
                <ReviewSubmissionPage />
              </AnimatedRoute>
            } 
          />
          <Route 
            path="/order-success" 
            element={
              <AnimatedRoute>
                <OrderSuccessPage />
              </AnimatedRoute>
            } 
          />
          <Route 
            path="/track-order" 
            element={
              <AnimatedRoute>
                <OrderTrackingPage />
              </AnimatedRoute>
            } 
          />

          <Route 
            path="/login" 
            element={
              <AnimatedRoute>
                <LoginPage />
              </AnimatedRoute>
            } 
          />
          <Route 
            path="*" 
            element={
              <AnimatedRoute>
                <NotFoundPage />
              </AnimatedRoute>
            } 
          />
        </Routes>
      </AnimatePresence>
      
      <Footer />
    </div>
  );
}

export default App; 