import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loginUser } from '../services/api';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      toast.error('Please fill in all fields');
      return;
    }

    console.log('🔐 Attempting unified login with:', credentials);
    console.log('🔐 Credentials type:', typeof credentials);
    console.log('🔐 Credentials keys:', Object.keys(credentials));
    setIsLoading(true);

    try {
      console.log('📡 Making API call to login...');
      console.log('📡 API URL:', process.env.REACT_APP_API_URL || 'http://localhost:5001/api');
      const response = await loginUser(credentials);
      console.log('✅ Login response:', response);
      
      const { user, token } = response;
      
      // Store token and user info
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(user));
      
      console.log('💾 Token saved to localStorage');
      console.log('👤 User role:', user.role);
      
      // Role-based redirection
      if (user.role === 'admin') {
        // Admin users go to admin dashboard
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminUser', JSON.stringify(user));
        toast.success(`Welcome back, ${user.first_name}! Redirecting to Admin Dashboard...`);
        navigate('/admin/dashboard');
      } else if (user.role === 'staff') {
        // Staff users go to kitchen display
        localStorage.setItem('kitchenToken', token);
        localStorage.setItem('kitchenUser', JSON.stringify(user));
        toast.success(`Welcome back, ${user.first_name}! Redirecting to Kitchen Display...`);
        navigate('/kitchen/display');
      } else {
        // Unknown role
        toast.error('Access denied. Invalid user role.');
        console.error('Unknown user role:', user.role);
      }
      
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error message:', error.message);
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (role) => {
    if (role === 'admin') {
      setCredentials({
        username: 'admin',
        password: 'admin123'
      });
      toast.success('✅ Admin credentials filled! (Verified working)');
    } else if (role === 'staff') {
      setCredentials({
        username: 'kitchen',
        password: 'kitchen123'
      });
      toast.success('✅ Kitchen staff credentials filled! (Verified working)');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sangeet-neutral-950 via-sangeet-neutral-900 to-sangeet-neutral-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Large Logo Section */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-sangeet-400 to-sangeet-500 rounded-full flex items-center justify-center shadow-2xl"
          >
            <span className="text-6xl">🍽️</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-sangeet-400 mb-2"
          >
            Sangeet Restaurant
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sangeet-neutral-400 text-lg"
          >
            Staff Portal Login
          </motion.p>
        </div>

        {/* Login Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-sangeet-neutral-900 rounded-2xl shadow-2xl border border-sangeet-neutral-700 p-8"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-sangeet-400 mb-2">Welcome Back</h2>
            <p className="text-sangeet-neutral-400">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 placeholder-sangeet-neutral-500 focus:outline-none focus:ring-2 focus:ring-sangeet-400 focus:border-transparent transition-all duration-200"
                placeholder="Enter your username"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 placeholder-sangeet-neutral-500 focus:outline-none focus:ring-2 focus:ring-sangeet-400 focus:border-transparent transition-all duration-200"
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-sangeet-400 to-sangeet-500 text-sangeet-neutral-950 font-bold py-3 px-6 rounded-lg hover:from-sangeet-300 hover:to-sangeet-400 focus:outline-none focus:ring-2 focus:ring-sangeet-400 focus:ring-offset-2 focus:ring-offset-sangeet-neutral-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sangeet-neutral-950 mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Role-based Demo Credentials */}
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-gradient-to-r from-sangeet-400/10 to-sangeet-500/10 rounded-lg border border-sangeet-400/20">
              <h3 className="text-sm font-semibold text-sangeet-400 mb-3 text-center">🔑 Demo Credentials</h3>
              
              {/* Admin Credentials */}
              <div className="bg-sangeet-neutral-800 rounded-lg p-3 mb-3 border border-sangeet-neutral-600">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-sangeet-neutral-300">👨‍💼 Administrator</span>
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('admin')}
                    className="bg-sangeet-400/20 hover:bg-sangeet-400/30 text-sangeet-400 px-3 py-1 rounded text-xs font-medium transition-colors duration-200 border border-sangeet-400/30"
                  >
                    Use Admin
                  </button>
                </div>
                                            <div className="text-xs text-sangeet-neutral-400 space-y-1">
                              <div>Username: <span className="text-sangeet-400 font-mono">admin</span> ✅</div>
                              <div>Password: <span className="text-sangeet-400 font-mono">admin123</span> ✅</div>
                              <div>Access: Full admin dashboard, all management features</div>
                              <div className="text-green-400 text-xs">✓ Verified working</div>
                            </div>
              </div>

              {/* Staff Credentials */}
              <div className="bg-sangeet-neutral-800 rounded-lg p-3 border border-sangeet-neutral-600">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-sangeet-neutral-300">👨‍🍳 Kitchen Staff</span>
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('staff')}
                    className="bg-orange-400/20 hover:bg-orange-400/30 text-orange-400 px-3 py-1 rounded text-xs font-medium transition-colors duration-200 border border-orange-400/30"
                  >
                    Use Staff
                  </button>
                </div>
                                            <div className="text-xs text-sangeet-neutral-400 space-y-1">
                              <div>Username: <span className="text-orange-400 font-mono">kitchen</span> ✅</div>
                              <div>Password: <span className="text-orange-400 font-mono">kitchen123</span> ✅</div>
                              <div>Access: Kitchen display system, order management</div>
                              <div className="text-green-400 text-xs">✓ Verified working</div>
                            </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-sangeet-neutral-500">
                Your dashboard will be determined automatically based on your role
              </p>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sangeet-neutral-500 text-sm">
            © 2024 Sangeet Restaurant. All rights reserved.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
