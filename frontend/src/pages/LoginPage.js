import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loginUser } from '../services/api';
import toast from 'react-hot-toast';
import logoImage from '../assets/images/logo.png';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
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

    setIsLoading(true);
    setError('');

    try {
      const response = await loginUser(credentials);
      const { user, token } = response;

      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Show success message
      toast.success(`Welcome back, ${user.first_name}!`);

      // Redirect based on user role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'staff') {
        navigate('/admin/orders');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Demo credentials function removed

  return (
    <div className="min-h-screen bg-gradient-to-br from-sangeet-neutral-950 via-sangeet-neutral-900 to-sangeet-neutral-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Large Logo Section */}
        <div className="text-center mb-6">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-32 h-32 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-2xl p-2"
          >
            <img 
              src={logoImage} 
              alt="Sangeet Restaurant Logo" 
              className="w-full h-full object-contain rounded-full"
            />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-sangeet-400 mb-1"
          >
            Sangeet Restaurant
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sangeet-neutral-400 text-base"
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
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-sangeet-400 mb-1">Welcome Back</h2>
            <p className="text-sangeet-neutral-400 text-sm">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}
          </form>

                      {/* Demo credentials section removed */}
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-sangeet-neutral-500 text-xs">
            © 2024 Sangeet Restaurant. All rights reserved.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
