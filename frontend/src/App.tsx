import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

import socketService from './services/socketService';
import { clearAllCartData } from './utils/cartUtils';

import PublicRoutes from './routes/publicRoutes';
import AdminRoutes from './routes/adminRoutes';
import KitchenRoutes from './routes/kitchenRoutes';
import QRRoutes from './routes/qrRoutes';
import StandaloneLayout from './layouts/StandaloneLayout';
import LoginPage from './pages/LoginPage';
import UnifiedOrderPage from './pages/UnifiedOrderPage';
import UnifiedDashboard from './pages/UnifiedDashboard';
import OrderSuccessPage from './pages/OrderSuccessPage';

const CONTAINER_CLASSES = 'min-h-screen bg-sangeet-neutral-950 w-full overflow-x-hidden';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  // Global order deletion listener - clears cart data when order is deleted
  useEffect(() => {
    socketService.connect();

    const handleOrderDeleted = (data: any) => {
      const success = clearAllCartData();
      if (success) {
        toast.success('Order has been cancelled. Your cart has been cleared.');
      }
    };

    socketService.onOrderDeleted(handleOrderDeleted);

    return () => {
      socketService.removeListener('order-deleted');
    };
  }, []);

  return (
    <div className={CONTAINER_CLASSES}>
      <ScrollToTop />
      
      <Routes>
        {/* Namespaced routes */}
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/kitchen/*" element={<KitchenRoutes />} />
        <Route path="/qr/*" element={<QRRoutes />} />
        
        {/* Standalone pages (login, order, dashboard, etc.) */}
        <Route path="/login" element={<StandaloneLayout><LoginPage /></StandaloneLayout>} />
        <Route path="/order" element={<StandaloneLayout><UnifiedOrderPage /></StandaloneLayout>} />
        <Route path="/dashboard" element={<StandaloneLayout><UnifiedDashboard /></StandaloneLayout>} />
        <Route path="/order-success" element={<StandaloneLayout><OrderSuccessPage /></StandaloneLayout>} />
        
        {/* Everything else goes to public routes which handles the root, menu, about, contact, and 404 */}
        <Route path="/*" element={<PublicRoutes />} />
      </Routes>
    </div>
  );
}

export default App;