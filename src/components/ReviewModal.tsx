"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { submitReviewAction } from '@/app/actions/reviewActions';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reviewSchema } from '@/lib/validations';

const ReviewModal = ({ 
  isOpen, 
  onClose, 
  order, 
  customerName, 
  tableNumber,
  onReviewSubmitted 
}: any) => {
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      customer_name: customerName || '',
      review_text: '',
      rating: 0
    }
  });

  const [hoverRating, setHoverRating] = useState(0);
  const [showThankYou, setShowThankYou] = useState(false);

  const onSubmit = async (data: any) => {
    try {
      const result = await submitReviewAction({
        ...data,
        order_id: order?.id || null,
        table_number: tableNumber
      });

      if (result.success) {
        setShowThankYou(true);
        setTimeout(() => {
          setShowThankYou(false);
          onReviewSubmitted();
          onClose();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 3000);
      } else {
        toast.error(result.error || 'Failed to submit review. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    }
  };

  const handleSkip = () => {
    onClose();
    toast.success('Review skipped. You can review later!');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {showThankYou ? (
        // Thank You Modal
        <motion.div
          key="thank-you"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-2xl p-8 border border-sangeet-400 max-w-md w-full text-center"
          >
            <div className="text-6xl mb-4">🎉</div>
                          <h2 className="text-2xl font-bold text-sangeet-400 mb-4">
                Thank You!
              </h2>
              <p className="text-sangeet-neutral-300 mb-6">
                Your review has been submitted successfully. We appreciate your feedback!
              </p>
          </motion.div>
        </motion.div>
      ) : (
        // Original Review Modal
        <motion.div
          key="review"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-2xl p-8 border border-sangeet-neutral-700 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🍽️</div>
              <h2 className="text-2xl font-bold text-sangeet-400 mb-2">
                How was your meal?
              </h2>
              <p className="text-sangeet-neutral-300">
                We'd love to hear about your experience!
              </p>
            </div>

            {/* Star Rating */}
            <div className="mb-6">
                <p className="text-sangeet-neutral-300 text-sm mb-2 text-center">Rate your experience</p>
                <div className="flex justify-center space-x-2">
                  <Controller
                    name="rating"
                    control={control}
                    render={({ field }) => (
                      <>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <motion.button
                            key={star}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            onClick={() => field.onChange(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="text-4xl focus:outline-none"
                          >
                            <span className={star <= (hoverRating || (field.value as number)) ? "text-yellow-400" : "text-gray-500"}>
                              ★
                            </span>
                          </motion.button>
                        ))}
                      </>
                    )}
                  />
                </div>
                {errors.rating && (
                  <p className="mt-2 text-sm text-red-400 text-center">
                    {errors.rating.message as string}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <textarea
                  {...register('review_text')}
                  placeholder="Tell us what you loved (or how we can improve)..."
                  className="w-full bg-sangeet-neutral-900 border border-sangeet-neutral-700 rounded-xl p-4 text-sangeet-neutral-100 placeholder-sangeet-neutral-500 focus:ring-2 focus:ring-sangeet-400 focus:border-transparent outline-none transition-all resize-none h-32"
                />
                {errors.review_text && (
                  <p className="mt-1 text-sm text-red-400 text-left">
                    {errors.review_text.message as string}
                  </p>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 bg-sangeet-neutral-800 text-sangeet-neutral-300 rounded-xl font-medium hover:bg-sangeet-neutral-700 transition-colors disabled:opacity-50"
                >
                  Skip for Now
                </button>
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 bg-sangeet-400 text-sangeet-neutral-950 rounded-xl font-bold hover:bg-sangeet-300 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-sangeet-neutral-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Review'
                  )}
                </button>
              </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-sangeet-neutral-400 hover:text-sangeet-neutral-200 text-2xl transition-colors duration-200"
            >
              ×
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReviewModal;
