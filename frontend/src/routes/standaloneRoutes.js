import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import LoginPage from '../pages/LoginPage';
import UnifiedOrderPage from '../pages/UnifiedOrderPage';
import UnifiedDashboard from '../pages/UnifiedDashboard';
import OrderSuccessPage from '../pages/OrderSuccessPage';

import StandaloneLayout from '../layouts/StandaloneLayout';

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

const StandaloneRoutes = () => {
  return (
    <StandaloneLayout>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/login" element={<AnimatedRoute><LoginPage /></AnimatedRoute>} />
          <Route path="/order" element={<AnimatedRoute><UnifiedOrderPage /></AnimatedRoute>} />
          <Route path="/dashboard" element={<AnimatedRoute><UnifiedDashboard /></AnimatedRoute>} />
          <Route path="/order-success" element={<AnimatedRoute><OrderSuccessPage /></AnimatedRoute>} />
        </Routes>
      </AnimatePresence>
    </StandaloneLayout>
  );
};

export default StandaloneRoutes;
