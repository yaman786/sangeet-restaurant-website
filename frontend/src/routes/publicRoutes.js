import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import HomePage from '../pages/HomePage';
import MenuPage from '../pages/MenuPage';
import QRCodeDisplayPage from '../pages/QRCodeDisplayPage';
import ReservationsPage from '../pages/ReservationsPage';
import AboutPage from '../pages/AboutPage';
import ContactPage from '../pages/ContactPage';
import LocationPage from '../pages/LocationPage';
import ReviewSubmissionPage from '../pages/ReviewSubmissionPage';
import OrderTrackingPage from '../pages/OrderTrackingPage';
import NotFoundPage from '../pages/NotFoundPage';

import PublicLayout from '../layouts/PublicLayout';
import { fetchMenuItems, fetchReviews, fetchEvents } from '../services/api';

const ANIMATION_CONFIG = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
};

function AnimatedRoute({ children }) {
  return (
    <motion.div {...ANIMATION_CONFIG}>
      {children}
    </motion.div>
  );
}

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

const PublicRoutes = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

      setMenuItems([
        {
          id: 1, name: "Butter Chicken", description: "Creamy tomato-based curry with tender chicken", price: 18.99,
          category_name: "Main Course", image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
          is_vegetarian: false, is_spicy: false, is_popular: true, preparation_time: 20
        }
      ]);
      setReviews([
        {
          id: 1, customer_name: "Anika Sharma", review_text: "Sangeet offers an unparalleled dining experience. The Butter Chicken is a must-try! ★★★★★",
          rating: 5, image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face", is_verified: true
        }
      ]);
      setEvents([
        {
          id: 1, title: "Diwali Celebration", description: "A night of music, dance, and special dishes to celebrate the Festival of Lights",
          date: "2024-11-12T00:00:00.000Z", image_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop", is_featured: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="min-h-screen bg-sangeet-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={loadData} className="bg-sangeet-400 text-sangeet-neutral-950 px-4 py-2 rounded-lg hover:bg-sangeet-300 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <PublicLayout>
      <AnimatePresence mode="wait">
        <Routes>
          <Route
            path="/"
            element={
              <AnimatedRoute>
                <HomePage menuItems={menuItems} reviews={reviews} events={events} />
              </AnimatedRoute>
            }
          />
          <Route path="/menu" element={<AnimatedRoute><MenuPage /></AnimatedRoute>} />
          <Route path="/qr-codes" element={<AnimatedRoute><QRCodeDisplayPage /></AnimatedRoute>} />
          <Route path="/reservations" element={<AnimatedRoute><ReservationsPage /></AnimatedRoute>} />
          <Route path="/about" element={<AnimatedRoute><AboutPage /></AnimatedRoute>} />
          <Route path="/contact" element={<AnimatedRoute><ContactPage /></AnimatedRoute>} />
          <Route path="/location" element={<AnimatedRoute><LocationPage /></AnimatedRoute>} />
          <Route path="/review" element={<AnimatedRoute><ReviewSubmissionPage /></AnimatedRoute>} />
          <Route path="/track-order" element={<AnimatedRoute><OrderTrackingPage /></AnimatedRoute>} />
          <Route path="*" element={<AnimatedRoute><NotFoundPage /></AnimatedRoute>} />
        </Routes>
      </AnimatePresence>
    </PublicLayout>
  );
};

export default PublicRoutes;
