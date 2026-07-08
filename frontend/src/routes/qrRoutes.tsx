import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import QRMenuPage from '../pages/QRMenuPage';
import QRCartPage from '../pages/QRCartPage';
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

const QRRoutes = () => {
  return (
    <StandaloneLayout>
      <AnimatePresence mode="wait">
        <Routes>
          <Route
            path=":qrCode"
            element={
              <AnimatedRoute>
                <QRMenuPage />
              </AnimatedRoute>
            }
          />
          <Route
            path=":qrCode/cart"
            element={
              <AnimatedRoute>
                <QRCartPage />
              </AnimatedRoute>
            }
          />
        </Routes>
      </AnimatePresence>
    </StandaloneLayout>
  );
};

export default QRRoutes;
