import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { submitReview } from '../services/api';

const ReviewModal = ({ 
  isOpen, 
  onClose, 
  order, 
  customerName, 
  tableNumber,
  onReviewSubmitted 
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitReview({
        customer_name: customerName,
        review_text: reviewText,
        rating: rating,
        order_id: order.id,
        table_number: tableNumber
      });

      toast.success('Thank you for your review! 🎉');
      onReviewSubmitted();
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose();
    toast.success('Review skipped. You can review later!');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
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
            <p className="text-sangeet-neutral-200 font-medium mb-3 text-center">
              Rate your experience
            </p>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-3xl transition-all duration-200 hover:scale-110"
                >
                  <span className={`
                    ${(hoverRating >= star || rating >= star) 
                      ? 'text-yellow-400' 
                      : 'text-sangeet-neutral-600'
                    }
                  `}>
                    ★
                  </span>
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-sangeet-neutral-400 mt-2">
              {rating === 0 && 'Tap to rate'}
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent!'}
            </p>
          </div>

          {/* Review Text */}
          <div className="mb-6">
            <label className="block text-sangeet-neutral-200 font-medium mb-2">
              Tell us more (optional)
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your thoughts about the food, service, or anything else..."
              className="w-full h-24 bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-xl p-3 text-sangeet-neutral-200 placeholder-sangeet-neutral-500 focus:outline-none focus:border-sangeet-400 resize-none"
              maxLength={500}
            />
            <p className="text-xs text-sangeet-neutral-500 text-right mt-1">
              {reviewText.length}/500
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleSkip}
              disabled={isSubmitting}
              className="flex-1 bg-sangeet-neutral-700 hover:bg-sangeet-neutral-600 text-sangeet-neutral-200 font-medium py-3 px-4 rounded-xl transition-colors duration-200 disabled:opacity-50"
            >
              Review Later
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="flex-1 bg-gradient-to-r from-sangeet-400 to-sangeet-500 hover:from-sangeet-500 hover:to-sangeet-600 text-sangeet-neutral-950 font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-sangeet-neutral-950 border-t-transparent rounded-full animate-spin mr-2"></div>
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
    </AnimatePresence>
  );
};

export default ReviewModal;
