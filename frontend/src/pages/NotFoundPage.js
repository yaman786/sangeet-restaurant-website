import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { isAuthenticated } from '../utils/auth';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If user is not authenticated and trying to access protected routes,
    // redirect to login instead of showing 404
    const protectedPaths = ['/admin', '/kitchen'];
    const isProtectedRoute = protectedPaths.some(path => location.pathname.startsWith(path));
    
    if (isProtectedRoute && !isAuthenticated()) {
      console.log('🔒 Redirecting unauthenticated user to login');
      navigate('/login', { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sangeet-neutral-950 via-sangeet-neutral-900 to-sangeet-neutral-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md mx-auto"
      >
        {/* Large 404 */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-8xl font-bold text-sangeet-400 mb-4">404</h1>
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-sangeet-400/20 to-sangeet-500/20 rounded-full flex items-center justify-center border border-sangeet-400/30">
            <span className="text-6xl">🍽️</span>
          </div>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-sangeet-neutral-100 mb-4">
            Page Not Found
          </h2>
          <p className="text-sangeet-neutral-400 leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
            {location.pathname.startsWith('/admin') || location.pathname.startsWith('/kitchen') ? 
              ' You may need to log in to access this page.' : ''
            }
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <button
            onClick={handleGoHome}
            className="w-full bg-gradient-to-r from-sangeet-400 to-sangeet-500 text-sangeet-neutral-950 font-bold py-3 px-6 rounded-lg hover:from-sangeet-300 hover:to-sangeet-400 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            🏠 Go to Homepage
          </button>

          {(location.pathname.startsWith('/admin') || location.pathname.startsWith('/kitchen')) && (
            <button
              onClick={handleLogin}
              className="w-full bg-sangeet-neutral-800 text-sangeet-400 font-semibold py-3 px-6 rounded-lg hover:bg-sangeet-neutral-700 transition-all duration-200 border border-sangeet-400/30"
            >
              🔐 Staff Login
            </button>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-sangeet-neutral-500 text-sm"
        >
          <p>© 2024 Sangeet Restaurant. All rights reserved.</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
