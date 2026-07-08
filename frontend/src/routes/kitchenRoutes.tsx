import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import LoginPage from '../pages/LoginPage';
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

const KitchenRoutes = () => {
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
            path="display"
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

export default KitchenRoutes;
