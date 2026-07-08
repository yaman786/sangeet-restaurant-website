import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import LoginPage from '../pages/LoginPage';
import AdminDashboard from '../pages/AdminDashboard';
import HistoryDashboard from '../pages/HistoryDashboard';
import AdminOrders from '../pages/AdminOrders';
import MenuManagement from '../pages/MenuManagement';
import QRManagement from '../pages/QRManagement';
import ReservationManagementPage from '../pages/ReservationManagementPage';
import StaffManagement from '../pages/StaffManagement';
import RestaurantWebsiteManagementPage from '../pages/RestaurantWebsiteManagementPage';
import AnalyticsReportsPage from '../pages/AnalyticsReportsPage';
import KitchenDisplayPage from '../pages/KitchenDisplayPage';

import ProtectedRoute from '../components/ProtectedRoute';
import StandaloneLayout from '../layouts/StandaloneLayout';

const ANIMATION_CONFIG = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
};

function AnimatedRoute({ children }: { children: React.ReactNode }) {
  return (
    <motion.div {...ANIMATION_CONFIG}>
      {children}
    </motion.div>
  );
}

const AdminRoutes = () => {
  return (
    <StandaloneLayout>
      <AnimatePresence mode="wait">
        <Routes>
          <Route
            path="login"
            element={
              <AnimatedRoute>
                <LoginPage />
              </AnimatedRoute>
            }
          />
          <Route
            path="dashboard"
            element={
              <AnimatedRoute>
                <ProtectedRoute requiredRole={['admin', 'reception', 'waiter']}>
                  <AdminDashboard />
                </ProtectedRoute>
              </AnimatedRoute>
            }
          />
          <Route
            path="history"
            element={
              <AnimatedRoute>
                <ProtectedRoute requiredRole={['admin', 'reception']}>
                  <HistoryDashboard />
                </ProtectedRoute>
              </AnimatedRoute>
            }
          />
          <Route
            path="orders"
            element={
              <AnimatedRoute>
                <ProtectedRoute requiredRole={['admin', 'reception', 'waiter']}>
                  <AdminOrders />
                </ProtectedRoute>
              </AnimatedRoute>
            }
          />
          <Route
            path="menu-management"
            element={
              <AnimatedRoute>
                <ProtectedRoute requiredRole="admin">
                  <MenuManagement />
                </ProtectedRoute>
              </AnimatedRoute>
            }
          />
          <Route
            path="qr-management"
            element={
              <AnimatedRoute>
                <ProtectedRoute requiredRole={['admin']}>
                  <QRManagement />
                </ProtectedRoute>
              </AnimatedRoute>
            }
          />
          <Route
            path="reservations"
            element={
              <AnimatedRoute>
                <ProtectedRoute requiredRole={['admin', 'reception']}>
                  <ReservationManagementPage />
                </ProtectedRoute>
              </AnimatedRoute>
            }
          />
          <Route
            path="staff-management"
            element={
              <AnimatedRoute>
                <ProtectedRoute requiredRole="admin">
                  <StaffManagement />
                </ProtectedRoute>
              </AnimatedRoute>
            }
          />
          <Route
            path="website-management"
            element={
              <AnimatedRoute>
                <ProtectedRoute requiredRole="admin">
                  <RestaurantWebsiteManagementPage />
                </ProtectedRoute>
              </AnimatedRoute>
            }
          />
          <Route
            path="analytics"
            element={
              <AnimatedRoute>
                <ProtectedRoute requiredRole="admin">
                  <AnalyticsReportsPage />
                </ProtectedRoute>
              </AnimatedRoute>
            }
          />
          <Route
            path="kitchen"
            element={
              <AnimatedRoute>
                <ProtectedRoute requiredRole={['admin', 'kitchen', 'waiter']}>
                  <KitchenDisplayPage />
                </ProtectedRoute>
              </AnimatedRoute>
            }
          />
        </Routes>
      </AnimatePresence>
    </StandaloneLayout>
  );
};

export default AdminRoutes;
