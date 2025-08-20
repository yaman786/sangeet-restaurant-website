import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

/**
 * ContactPage Component
 * Mobile-first contact page with responsive design
 * Features: Contact form, location info, business hours
 * Optimized for touch interactions and mobile performance
 */
const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Message sent successfully! We will get back to you soon.');
      reset();
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCall = () => {
    window.location.href = 'tel:+85223456789';
  };

  const handleEmail = () => {
    window.location.href = 'mailto:info@sangeethk.com';
  };

  const handleDirections = () => {
    const address = encodeURIComponent('Wanchai, Hong Kong');
    const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-sangeet-neutral-950">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-sangeet-neutral-950 via-sangeet-neutral-900 to-sangeet-neutral-950 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 md:mb-12"
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-sangeet-400/20 to-sangeet-red-500/20 backdrop-blur-md border border-sangeet-400/30 rounded-full px-4 md:px-6 py-2 mb-4">
              <span className="text-xl md:text-2xl">📞</span>
              <span className="text-sangeet-400 font-semibold text-sm md:text-base">Contact Us</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-sangeet-400 mb-3 md:mb-4">Get in Touch</h1>
            <p className="text-sangeet-neutral-400 text-base md:text-lg max-w-2xl mx-auto">
              Get in touch with us for reservations, feedback, or any questions
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6 md:space-y-8"
          >
            <div className="bg-sangeet-neutral-900 p-6 md:p-8 rounded-xl shadow-lg border border-sangeet-neutral-800">
              <h3 className="text-xl md:text-2xl font-bold text-sangeet-400 mb-6">Contact Information</h3>
              <div className="space-y-4 md:space-y-6">
                <motion.div 
                  className="flex items-start space-x-4 p-3 rounded-lg hover:bg-sangeet-neutral-800 transition-colors cursor-pointer touch-manipulation"
                  onClick={handleDirections}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-sangeet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sangeet-400 font-semibold mb-1">Address</h4>
                    <p className="text-sangeet-neutral-300 text-sm md:text-base">Wanchai, Hong Kong</p>
                    <p className="text-sangeet-neutral-400 text-xs md:text-sm">Central District</p>
                  </div>
                </motion.div>

                <motion.div 
                  className="flex items-start space-x-4 p-3 rounded-lg hover:bg-sangeet-neutral-800 transition-colors cursor-pointer touch-manipulation"
                  onClick={handleCall}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-sangeet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sangeet-400 font-semibold mb-1">Phone</h4>
                    <p className="text-sangeet-neutral-300 text-sm md:text-base">+852 2345 6789</p>
                    <p className="text-sangeet-neutral-400 text-xs md:text-sm">Tap to call</p>
                  </div>
                </motion.div>

                <motion.div 
                  className="flex items-start space-x-4 p-3 rounded-lg hover:bg-sangeet-neutral-800 transition-colors cursor-pointer touch-manipulation"
                  onClick={handleEmail}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-sangeet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sangeet-400 font-semibold mb-1">Email</h4>
                    <p className="text-sangeet-neutral-300 text-sm md:text-base">info@sangeethk.com</p>
                    <p className="text-sangeet-neutral-400 text-xs md:text-sm">Tap to email</p>
                  </div>
                </motion.div>

                <div className="flex items-start space-x-4 p-3 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-sangeet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sangeet-400 font-semibold mb-1">Hours</h4>
                    <p className="text-sangeet-neutral-300 text-sm md:text-base">
                      Monday - Sunday<br />
                      6:00 PM - 11:00 PM
                    </p>
                    <p className="text-sangeet-neutral-400 text-xs md:text-sm">Last seating at 10:30 PM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-sangeet-neutral-900 p-6 md:p-8 rounded-xl shadow-lg border border-sangeet-neutral-800">
              <h3 className="text-xl md:text-2xl font-bold text-sangeet-400 mb-6">Location</h3>
              <div className="relative h-48 md:h-64 rounded-lg overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=800&h=400&fit=crop"
                  alt="Wanchai, Hong Kong - Sangeet Restaurant Location"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-sangeet-neutral-900/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-sangeet-neutral-900/90 backdrop-blur-md rounded-lg p-4 border border-sangeet-neutral-700">
                    <h4 className="text-sangeet-400 font-bold text-base md:text-lg mb-1">📍 Sangeet Restaurant</h4>
                    <p className="text-sangeet-neutral-300 text-sm">Wanchai, Hong Kong</p>
                    <motion.button
                      onClick={handleDirections}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="mt-2 bg-sangeet-400 text-sangeet-neutral-950 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-sangeet-300 transition-colors touch-manipulation"
                    >
                      Get Directions
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-sangeet-neutral-900 p-6 md:p-8 rounded-xl shadow-lg border border-sangeet-neutral-800">
              <h3 className="text-xl md:text-2xl font-bold text-sangeet-400 mb-6">Send us a Message</h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sangeet-neutral-300 text-sm font-medium mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      {...register('firstName', { required: 'First name is required' })}
                      className="w-full px-4 py-3 rounded-lg bg-sangeet-neutral-800 border border-sangeet-neutral-600 text-sangeet-neutral-100 placeholder-sangeet-neutral-400 focus:outline-none focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400 focus:ring-offset-2 focus:ring-offset-sangeet-neutral-900 transition-all duration-200 text-sm md:text-base"
                      placeholder="Your first name"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-red-400 text-xs">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sangeet-neutral-300 text-sm font-medium mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      {...register('lastName', { required: 'Last name is required' })}
                      className="w-full px-4 py-3 rounded-lg bg-sangeet-neutral-800 border border-sangeet-neutral-600 text-sangeet-neutral-100 placeholder-sangeet-neutral-400 focus:outline-none focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400 focus:ring-offset-2 focus:ring-offset-sangeet-neutral-900 transition-all duration-200 text-sm md:text-base"
                      placeholder="Your last name"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-red-400 text-xs">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sangeet-neutral-300 text-sm font-medium mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className="w-full px-4 py-3 rounded-lg bg-sangeet-neutral-800 border border-sangeet-neutral-600 text-sangeet-neutral-100 placeholder-sangeet-neutral-400 focus:outline-none focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400 focus:ring-offset-2 focus:ring-offset-sangeet-neutral-900 transition-all duration-200 text-sm md:text-base"
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-red-400 text-xs">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sangeet-neutral-300 text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    {...register('phone')}
                    className="w-full px-4 py-3 rounded-lg bg-sangeet-neutral-800 border border-sangeet-neutral-600 text-sangeet-neutral-100 placeholder-sangeet-neutral-400 focus:outline-none focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400 focus:ring-offset-2 focus:ring-offset-sangeet-neutral-900 transition-all duration-200 text-sm md:text-base"
                    placeholder="+852 2345 6789"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sangeet-neutral-300 text-sm font-medium mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    {...register('subject', { required: 'Subject is required' })}
                    className="w-full px-4 py-3 rounded-lg bg-sangeet-neutral-800 border border-sangeet-neutral-600 text-sangeet-neutral-100 focus:outline-none focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400 focus:ring-offset-2 focus:ring-offset-sangeet-neutral-900 transition-all duration-200 text-sm md:text-base"
                  >
                    <option value="">Select a subject</option>
                    <option value="reservation">Reservation Request</option>
                    <option value="feedback">Feedback</option>
                    <option value="general">General Inquiry</option>
                    <option value="catering">Catering Services</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.subject && (
                    <p className="mt-1 text-red-400 text-xs">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sangeet-neutral-300 text-sm font-medium mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    {...register('message', { required: 'Message is required' })}
                    className="w-full px-4 py-3 rounded-lg bg-sangeet-neutral-800 border border-sangeet-neutral-600 text-sangeet-neutral-100 placeholder-sangeet-neutral-400 focus:outline-none focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400 focus:ring-offset-2 focus:ring-offset-sangeet-neutral-900 transition-all duration-200 text-sm md:text-base resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-red-400 text-xs">{errors.message.message}</p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-sangeet-400 to-sangeet-500 text-sangeet-neutral-950 px-6 py-3 rounded-lg font-semibold hover:from-sangeet-300 hover:to-sangeet-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-sangeet-300 focus:ring-offset-2 focus:ring-offset-sangeet-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation text-sm md:text-base"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage; 