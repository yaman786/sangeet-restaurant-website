"use client";
import React, { useState } from 'react';
import { useNavigate, useLocation } from '@/utils/router-mock';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { submitReviewAction } from '@/app/actions/reviewActions';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reviewSchema } from '@/lib/validations';

const ReviewSubmissionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get order details from URL params or state
  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get('orderId');
  const tableNumber = searchParams.get('table');
  const customerName = searchParams.get('customerName');
  
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      customer_name: customerName || '',
      review_text: '',
      rating: 0
    }
  });
  
  const [hoveredRating, setHoveredRating] = useState(0);

  const onSubmit = async (data: any) => {
    try {
      const reviewData = {
        ...data,
        order_id: orderId || null,
        table_number: tableNumber || null
      };

      const result = await submitReviewAction(reviewData);
      
      if (result.success) {
        toast.success('Thank you for your review!');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        toast.error(result.error || 'Failed to submit review. Please try again.');
      }
      
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    }
  };

  // Star rating component
  const StarRating = ({ rating, onChange, onHover, onLeave }: any) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => onHover(star)}
            onMouseLeave={onLeave}
            className="text-3xl transition-colors duration-200 focus:outline-none"
          >
            {star <= (hoveredRating || rating) ? (
              <span className="text-yellow-400">★</span>
            ) : (
              <span className="text-gray-400">☆</span>
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-sangeet-neutral-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto h-16 w-16 bg-sangeet-400 rounded-full flex items-center justify-center mb-4"
          >
            <span className="text-2xl">⭐</span>
          </motion.div>
          
          <h2 className="text-3xl font-bold text-sangeet-400 mb-2">
            Share Your Dining Experience
          </h2>
          <p className="text-sangeet-neutral-300">
            {orderId ? `Review for Order #${orderId}` : "We'd love to hear about your recent dining experience at Sangeet"}
          </p>
          
          {(orderId || tableNumber) && (
            <div className="mt-4 p-3 bg-sangeet-neutral-900 rounded-lg">
              <p className="text-sm text-sangeet-neutral-300">
                {orderId && `Order #${orderId}`}
                {orderId && tableNumber && ' • '}
                {tableNumber && `Table ${tableNumber}`}
              </p>
            </div>
          )}
          
          {/* Helpful Note */}
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-300">
              💡 <strong>When to review:</strong> Please share your experience after you've dined with us. 
              This helps other customers make informed decisions.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Name */}
          <div>
            <label htmlFor="customer_name" className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
              Your Name *
            </label>
            <input
              {...register('customer_name')}
              type="text"
              className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-lg text-sangeet-neutral-100 placeholder-sangeet-neutral-500 focus:outline-none focus:ring-2 focus:ring-sangeet-400 focus:border-transparent"
              placeholder="Enter your name"
            />
            {errors.customer_name && (
              <p className="mt-1 text-sm text-red-400">
                {errors.customer_name.message as string}
              </p>
            )}
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-sangeet-neutral-300 mb-3">
              Overall Rating *
            </label>
            <div className="flex flex-col items-center space-y-2">
              <Controller
                name="rating"
                control={control}
                render={({ field }) => (
                  <StarRating
                    rating={field.value}
                    onChange={field.onChange}
                    onHover={setHoveredRating}
                    onLeave={() => setHoveredRating(0)}
                  />
                )}
              />
            </div>
            {errors.rating && (
              <p className="mt-2 text-sm text-red-400 text-center">
                {errors.rating.message as string}
              </p>
            )}
          </div>

          {/* Review Text */}
          <div>
            <label htmlFor="review_text" className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
              Your Review *
            </label>
            <textarea
              {...register('review_text')}
              rows={4}
              className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-lg text-sangeet-neutral-100 placeholder-sangeet-neutral-500 focus:outline-none focus:ring-2 focus:ring-sangeet-400 focus:border-transparent resize-none"
              placeholder="Tell us about your experience..."
            />
            {errors.review_text && (
              <p className="mt-1 text-sm text-red-400">
                {errors.review_text.message as string}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-sangeet-400 text-sangeet-neutral-950 py-3 px-4 rounded-lg font-semibold hover:bg-sangeet-300 focus:outline-none focus:ring-2 focus:ring-sangeet-400 focus:ring-offset-2 focus:ring-offset-sangeet-neutral-950 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sangeet-neutral-950 mr-2"></div>
                Submitting...
              </div>
            ) : (
              'Submit Review'
            )}
          </motion.button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-sangeet-neutral-400 hover:text-sangeet-400 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ReviewSubmissionPage;
