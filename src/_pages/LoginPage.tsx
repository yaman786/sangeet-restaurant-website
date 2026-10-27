"use client";
import React, { useState } from 'react';
import { useNavigate } from '@/utils/router-mock';
import { motion } from 'framer-motion';
import { loginUser, requestForgotPassword } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/validations';
import toast from 'react-hot-toast';
import Image from 'next/image';

import logoImage from '../assets/images/logo.png';

const LoginPage = () => {
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: ''
    }
  });

  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) {
      toast.error('Please enter your username or email');
      return;
    }
    setForgotSubmitting(true);
    setForgotMessage(null);
    try {
      const res = await requestForgotPassword(forgotIdentifier.trim());
      setForgotMessage(res?.message || 'Password reset request recorded. Please contact your manager or admin.');
      toast.success('Request received');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to submit request';
      toast.error(msg);
      setForgotMessage(msg);
    } finally {
      setForgotSubmitting(false);
    }
  };

  const onSubmit = async (data: any) => {
    setError('');

    try {
      const response = await loginUser(data);
      const { user } = response as any;

      login(user);
      const nameToDisplay = user.full_name?.split(' ')[0] || user.username || 'Admin';
      toast.success(`Welcome back, ${nameToDisplay}!`);

      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'kitchen') {
        navigate('/kitchen/display');
      } else if (user.role === 'waiter' || user.role === 'staff') {
        navigate('/admin/orders');
      } else if (user.role === 'reception') {
        navigate('/admin/reservations');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-sangeet-neutral-950 via-sangeet-neutral-900 to-sangeet-neutral-800 flex items-center justify-center p-4">
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
            <div className="relative w-full h-full">
              <Image 
                src={(logoImage as any).src || logoImage} 
                alt="Sangeet Restaurant Logo" 
                fill
                sizes="128px"
                className="object-contain rounded-full"
              />
            </div>
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                Username or Email
              </label>
              <input
                type="text"
                id="username"
                {...register('username')}
                className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 placeholder-sangeet-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-sangeet-400 focus:border-transparent transition-all duration-200"
                placeholder="Enter your username or email"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-400">{errors.username.message as string}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-sangeet-neutral-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotMessage(null);
                    setShowForgotModal(true);
                  }}
                  className="text-xs text-sangeet-400 hover:text-sangeet-300 hover:underline transition-all duration-150"
                  data-testid="forgot-password-link"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                id="password"
                {...register('password')}
                className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 placeholder-sangeet-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-sangeet-400 focus:border-transparent transition-all duration-200"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message as string}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-linear-to-r from-sangeet-400 to-sangeet-500 text-sangeet-neutral-950 font-bold py-3 px-6 rounded-lg hover:from-sangeet-300 hover:to-sangeet-400 focus:outline-hidden focus:ring-2 focus:ring-sangeet-400 focus:ring-offset-2 focus:ring-offset-sangeet-neutral-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
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
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-sangeet-neutral-500 text-xs">
            © 2024 Sangeet Restaurant. All rights reserved.
          </p>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-password-title"
          data-testid="forgot-password-modal"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-sangeet-neutral-900 border border-sangeet-neutral-700 rounded-2xl shadow-2xl p-6 relative"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sangeet-400/10 border border-sangeet-400/30 flex items-center justify-center text-xl">
                  🔑
                </div>
                <div>
                  <h3 id="forgot-password-title" className="text-lg font-bold text-sangeet-100">
                    Staff Password Assistance
                  </h3>
                  <p className="text-xs text-sangeet-neutral-400">
                    Sangeet Restaurant Portal Security
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-sangeet-neutral-400 hover:text-sangeet-100 p-1 rounded-md transition-colors"
                aria-label="Close"
                data-testid="close-forgot-modal"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-sangeet-neutral-300 leading-relaxed mb-4">
              Staff accounts are managed by restaurant administration. An on-duty Administrator can reset your password immediately inside <span className="text-sangeet-400 font-medium">Admin &gt; Staff Management</span>.
            </p>

            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label htmlFor="forgot-identifier" className="block text-xs font-medium text-sangeet-neutral-300 mb-1">
                  Your Username or Registered Email
                </label>
                <input
                  id="forgot-identifier"
                  type="text"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  placeholder="e.g. raj_waiter or staff@sangeet.hk"
                  className="w-full px-3 py-2.5 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sm text-sangeet-neutral-100 placeholder-sangeet-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-sangeet-400 focus:border-transparent transition-all"
                  required
                />
              </div>

              {forgotMessage && (
                <div className="p-3 bg-sangeet-neutral-800/80 border border-sangeet-400/30 rounded-lg text-xs text-sangeet-300 leading-relaxed">
                  {forgotMessage}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 text-xs font-medium text-sangeet-neutral-300 hover:text-white bg-sangeet-neutral-800 rounded-lg hover:bg-sangeet-neutral-700 transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={forgotSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-sangeet-neutral-950 bg-sangeet-400 hover:bg-sangeet-300 rounded-lg transition-colors disabled:opacity-50 shadow-md"
                  data-testid="submit-forgot-password"
                >
                  {forgotSubmitting ? 'Submitting...' : 'Notify Admin'}
                </button>
              </div>
            </form>

            <div className="mt-4 pt-3 border-t border-sangeet-neutral-800 text-[11px] text-sangeet-neutral-400 flex items-center justify-between">
              <span>📞 Manager: +852 26568820</span>
              <span>📧 info@sangeet.hk</span>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
