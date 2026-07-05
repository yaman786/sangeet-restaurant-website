import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reservationSchema } from '../utils/validators';
import { createReservation } from '../services/api';

const ReservationsPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [reservationDetails, setReservationDetails] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      customer_name: '',
      email: '',
      phone: '',
      date: '',
      time: '',
      guests: 2,
      special_requests: ''
    }
  });

  const specialRequests = watch('special_requests');

  // Date constraints
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  // Simple time options
  const timeOptions = [
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00'
  ];

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      await createReservation(data);
      
      setReservationDetails(data);
      setShowSuccess(true);
      
      reset(); // clear form
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error(error.response?.data?.error || 'Failed to create reservation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-sangeet-neutral-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-sangeet-neutral-900 to-sangeet-neutral-950 py-8 sm:py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-sangeet-400/20 to-sangeet-red-500/20 backdrop-blur-md border border-sangeet-400/30 rounded-full px-4 md:px-6 py-2 mb-4"
          >
            <span className="text-xl md:text-2xl">📅</span>
            <span className="text-sangeet-400 font-semibold text-sm md:text-base">Reservations</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-sangeet-400 mb-4 sm:mb-6"
          >
            Make a Reservation
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg md:text-xl text-sangeet-neutral-300 max-w-2xl mx-auto px-2"
          >
            Reserve your table at Sangeet Restaurant. We'll handle the rest and contact you to confirm your table assignment.
          </motion.p>
        </div>
      </div>

      {/* Reservation Form */}
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 md:py-16">
        <motion.div
          id="reservation-form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-sangeet-neutral-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  {...register('customer_name')}
                  className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-xl text-sangeet-neutral-100 placeholder-sangeet-neutral-500 focus:outline-none focus:ring-2 focus:ring-sangeet-400 focus:border-transparent"
                  placeholder="Enter your full name"
                />
                {errors.customer_name && <p className="text-red-500 text-xs mt-1">{errors.customer_name.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-xl text-sangeet-neutral-100 placeholder-sangeet-neutral-500 focus:outline-none focus:ring-2 focus:ring-sangeet-400 focus:border-transparent"
                  placeholder="Enter your email"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-xl text-sangeet-neutral-100 placeholder-sangeet-neutral-500 focus:outline-none focus:ring-2 focus:ring-sangeet-400 focus:border-transparent"
                  placeholder="Enter your phone number"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                  Number of Guests *
                </label>
                <select
                  {...register('guests')}
                  className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-xl text-sangeet-neutral-100 focus:outline-none focus:ring-2 focus:ring-sangeet-400 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
                {errors.guests && <p className="text-red-500 text-xs mt-1">{errors.guests.message}</p>}
              </div>
            </div>

            {/* Reservation Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  {...register('date')}
                  min={today}
                  max={maxDateStr}
                  className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-xl text-sangeet-neutral-100 focus:outline-none focus:ring-2 focus:ring-sangeet-400 focus:border-transparent [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                  Preferred Time *
                </label>
                <select
                  {...register('time')}
                  className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-xl text-sangeet-neutral-100 focus:outline-none focus:ring-2 focus:ring-sangeet-400 focus:border-transparent"
                >
                  <option value="">Select a time</option>
                  {timeOptions.map(time => (
                    <option key={time} value={time}>
                      {formatTime(time)}
                    </option>
                  ))}
                </select>
                {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time.message}</p>}
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                Special Requests
              </label>
              <textarea
                {...register('special_requests')}
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-xl text-sangeet-neutral-100 placeholder-sangeet-neutral-500 focus:outline-none focus:ring-2 focus:ring-sangeet-400 focus:border-transparent resize-none"
                placeholder="Any special requests or dietary requirements..."
              />
              <div className="text-right mt-1">
                <span className={`text-xs ${specialRequests?.length >= 500 ? 'text-red-400' : 'text-sangeet-neutral-500'}`}>
                  {specialRequests?.length || 0} / 500 characters
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-sangeet-400 text-sangeet-neutral-950 py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold hover:bg-sangeet-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sangeet-neutral-950 mr-2"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Reservation'
              )}
            </button>

            {/* Info Message */}
            <div className="text-center text-sm text-sangeet-neutral-400">
              <p>💡 We'll contact you shortly to confirm your table assignment and reservation details.</p>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-sangeet-neutral-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 w-full max-w-sm sm:max-w-md md:max-w-lg shadow-2xl border border-sangeet-neutral-700 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-2"
          >
            {/* Success Icon */}
            <div className="text-center mb-4 sm:mb-6">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-green-500 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl">✅</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-sangeet-400 mb-2">
                Reservation Confirmed!
              </h2>
              <p className="text-sm sm:text-base text-sangeet-neutral-300">
                Thank you for choosing Sangeet Restaurant
              </p>
            </div>

            {/* Reservation Details */}
            {reservationDetails && (
              <div className="bg-sangeet-neutral-800 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-sangeet-400 mb-2 sm:mb-3">Reservation Details</h3>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-sangeet-neutral-400 flex-shrink-0 mr-2">Name:</span>
                    <span className="text-sangeet-neutral-200 text-right break-words">{reservationDetails.customer_name}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-sangeet-neutral-400 flex-shrink-0 mr-2">Date:</span>
                    <span className="text-sangeet-neutral-200 text-right break-words">
                      {new Date(reservationDetails.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-sangeet-neutral-400 flex-shrink-0 mr-2">Time:</span>
                    <span className="text-sangeet-neutral-200 text-right">{formatTime(reservationDetails.time)}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-sangeet-neutral-400 flex-shrink-0 mr-2">Guests:</span>
                    <span className="text-sangeet-neutral-200 text-right">{reservationDetails.guests}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-blue-400 mb-2 flex items-center">
                <span className="mr-2">📞</span>
                What's Next?
              </h3>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-sangeet-neutral-300">
                <p>• We'll contact you within 2 hours to confirm your reservation</p>
                <p>• Please arrive 10 minutes before your scheduled time</p>
                <p>• We look forward to serving you!</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 sm:space-y-4 pt-2">
              <button
                onClick={() => setShowSuccess(false)}
                className="w-full bg-sangeet-neutral-700 hover:bg-sangeet-neutral-600 text-sangeet-neutral-200 py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold transition-colors border border-sangeet-neutral-600 hover:border-sangeet-neutral-500 text-sm sm:text-base"
              >
                📅 Make Another Reservation
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-sangeet-400 hover:bg-sangeet-300 text-sangeet-neutral-950 py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                🏠 Back to Home
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ReservationsPage; 