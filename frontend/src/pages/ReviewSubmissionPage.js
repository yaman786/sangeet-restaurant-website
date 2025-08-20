import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { submitReview } from '../services/api';

const ReviewSubmissionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get order details from URL params or state
  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get('orderId');
  const tableNumber = searchParams.get('table');
  const customerName = searchParams.get('customerName');
  
  const [formData, setFormData] = useState({
    customer_name: customerName || '',
    review_text: '',
    rating: 0,
    order_id: orderId || null,
    table_number: tableNumber || null
  });
  
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(formData.review_text.length);
  const [validationErrors, setValidationErrors] = useState({});

  // Star rating component
  const StarRating = ({ rating, onRatingChange, onHover, onLeave }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Update character count for review text
    if (name === 'review_text') {
      setCharCount(value.length);
      // Clear validation error when user starts typing
      if (validationErrors.review_text) {
        setValidationErrors(prev => ({ ...prev, review_text: null }));
      }
    }
    
    // Clear validation errors when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous validation errors
    setValidationErrors({});
    
    // Validate customer name
    if (!formData.customer_name.trim()) {
      setValidationErrors(prev => ({ ...prev, customer_name: 'Please enter your name' }));
      return;
    }
    
    // Validate review text
    if (!formData.review_text.trim()) {
      setValidationErrors(prev => ({ ...prev, review_text: 'Please enter your review' }));
      return;
    }
    
    if (formData.review_text.trim().length < 10) {
      setValidationErrors(prev => ({ 
        ...prev, 
        review_text: `Review must be at least 10 characters (currently ${formData.review_text.trim().length})` 
      }));
      return;
    }
    
    // Validate rating
    if (formData.rating === 0) {
      setValidationErrors(prev => ({ ...prev, rating: 'Please select a rating' }));
      return;
    }

    try {
      setIsSubmitting(true);
      
      const reviewData = {
        customer_name: formData.customer_name.trim(),
        review_text: formData.review_text.trim(),
        rating: formData.rating,
        order_id: formData.order_id,
        table_number: formData.table_number
      };

      console.log('=== REVIEW SUBMISSION DEBUG ===');
      console.log('Review data being sent:', reviewData);
      console.log('Form data state:', formData);

      const response = await submitReview(reviewData);
      console.log('Review submission response:', response);
      
      toast.success('Thank you for your review!');
      
      // Redirect to home page or show success message
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting review:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      toast.error(error.response?.data?.error || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="text-center">
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
                   We'd love to hear about your recent dining experience at Sangeet
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

        {/* Review Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Name Input */}
          <div>
            <label htmlFor="customer_name" className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              id="customer_name"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-sangeet-neutral-900 border rounded-lg text-sangeet-neutral-100 placeholder-sangeet-neutral-500 focus:outline-none focus:ring-2 focus:ring-sangeet-400 focus:border-transparent ${
                validationErrors.customer_name 
                  ? 'border-red-500 focus:ring-red-400' 
                  : 'border-sangeet-neutral-700'
              }`}
              placeholder="Enter your name"
              required
            />
            {validationErrors.customer_name && (
              <p className="mt-1 text-sm text-red-400 flex items-center">
                <span className="mr-1">⚠️</span>
                {validationErrors.customer_name}
              </p>
            )}
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-sangeet-neutral-300 mb-3">
              Overall Rating *
            </label>
            <div className="flex flex-col items-center space-y-2">
              <StarRating
                rating={formData.rating}
                onRatingChange={handleRatingChange}
                onHover={setHoveredRating}
                onLeave={() => setHoveredRating(0)}
              />
              <p className="text-sm text-sangeet-neutral-400">
                {formData.rating === 0 && 'Select a rating'}
                {formData.rating === 1 && 'Poor'}
                {formData.rating === 2 && 'Fair'}
                {formData.rating === 3 && 'Good'}
                {formData.rating === 4 && 'Very Good'}
                {formData.rating === 5 && 'Excellent'}
              </p>
            </div>
            {validationErrors.rating && (
              <p className="mt-2 text-sm text-red-400 flex items-center justify-center">
                <span className="mr-1">⚠️</span>
                {validationErrors.rating}
              </p>
            )}
          </div>

          {/* Review Text */}
          <div>
            <label htmlFor="review_text" className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
              Your Review * <span className="text-xs text-sangeet-neutral-500">(Minimum 10 characters)</span>
            </label>
            <textarea
              id="review_text"
              name="review_text"
              value={formData.review_text}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-4 py-3 bg-sangeet-neutral-900 border rounded-lg text-sangeet-neutral-100 placeholder-sangeet-neutral-500 focus:outline-none focus:ring-2 focus:ring-sangeet-400 focus:border-transparent resize-none ${
                validationErrors.review_text 
                  ? 'border-red-500 focus:ring-red-400' 
                  : 'border-sangeet-neutral-700'
              }`}
              placeholder="Tell us about your experience... What did you enjoy? Any suggestions for improvement?"
              required
            />
            <div className="flex justify-between items-center mt-2">
              <div className="text-xs text-sangeet-neutral-500">
                {charCount < 10 ? (
                  <span className="text-red-400">
                    ⚠️ At least {10 - charCount} more characters needed
                  </span>
                ) : (
                  <span className="text-green-400">
                    ✅ {charCount} characters (minimum met)
                  </span>
                )}
              </div>
              <div className="text-xs text-sangeet-neutral-500">
                {charCount}/1000 characters
              </div>
            </div>
            {validationErrors.review_text && (
              <p className="mt-2 text-sm text-red-400 flex items-center">
                <span className="mr-1">⚠️</span>
                {validationErrors.review_text}
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
        </motion.form>

        {/* Back to Home */}
        <div className="text-center">
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
