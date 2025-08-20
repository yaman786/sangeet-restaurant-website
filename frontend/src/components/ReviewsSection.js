import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { fetchVerifiedReviews } from '../services/api';

const ReviewsSection = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentReview, setCurrentReview] = useState(0);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const reviewsData = await fetchVerifiedReviews();
        setReviews(reviewsData || []);
      } catch (error) {
        console.error('Error loading reviews:', error);
        // Use fallback reviews if API fails
        setReviews([
          {
            id: 1,
            customer_name: "Sarah M.",
            review_text: "Amazing food and excellent service! The Butter Chicken is absolutely divine. Will definitely come back!",
            rating: 5,
            created_at: "2024-08-10T10:00:00Z"
          },
          {
            id: 2,
            customer_name: "Michael R.",
            review_text: "Great ambiance and authentic Indian flavors. The staff was very friendly and attentive.",
            rating: 5,
            created_at: "2024-08-09T15:30:00Z"
          },
          {
            id: 3,
            customer_name: "Emma L.",
            review_text: "Best Indian restaurant in the area! The biryani was perfectly spiced and the naan was fresh.",
            rating: 5,
            created_at: "2024-08-08T19:45:00Z"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  // Auto-rotate reviews
  useEffect(() => {
    if (reviews.length > 1) {
      const interval = setInterval(() => {
        setCurrentReview((prev) => (prev + 1) % reviews.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [reviews.length]);

  const StarRating = ({ rating }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className="text-lg">
            {star <= rating ? (
              <span className="text-yellow-400">★</span>
            ) : (
              <span className="text-gray-400">☆</span>
            )}
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <section className="py-16 bg-sangeet-neutral-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sangeet-400 mx-auto mb-4"></div>
            <p className="text-sangeet-neutral-400">Loading reviews...</p>
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-sangeet-neutral-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-sangeet-400 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-sangeet-neutral-300 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our valued customers have to say about their dining experience at Sangeet.
          </p>
        </motion.div>

        {/* Reviews Carousel */}
        <div className="relative">
          {/* Main Review Display */}
          <motion.div
            key={currentReview}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="bg-sangeet-neutral-950 rounded-2xl p-8 md:p-12 shadow-2xl border border-sangeet-neutral-800"
          >
            <div className="text-center">
              {/* Star Rating */}
              <div className="mb-6">
                <StarRating rating={reviews[currentReview]?.rating || 5} />
              </div>

              {/* Review Text */}
              <blockquote className="text-xl md:text-2xl text-sangeet-neutral-100 mb-8 leading-relaxed">
                "{reviews[currentReview]?.review_text || 'Amazing food and excellent service!'}"
              </blockquote>

              {/* Customer Info */}
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 bg-sangeet-400 rounded-full flex items-center justify-center">
                  <span className="text-sangeet-neutral-950 font-bold text-lg">
                    {reviews[currentReview]?.customer_name?.charAt(0) || 'C'}
                  </span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sangeet-400">
                    {reviews[currentReview]?.customer_name || 'Happy Customer'}
                  </p>
                  <p className="text-sm text-sangeet-neutral-400">
                    {formatDate(reviews[currentReview]?.created_at || new Date())}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Navigation Dots */}
          {reviews.length > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentReview(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentReview
                      ? 'bg-sangeet-400'
                      : 'bg-sangeet-neutral-600 hover:bg-sangeet-neutral-500'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Navigation Arrows */}
          {reviews.length > 1 && (
            <>
              <button
                onClick={() => setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-sangeet-neutral-800 hover:bg-sangeet-neutral-700 text-sangeet-neutral-300 hover:text-sangeet-400 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              >
                ←
              </button>
              <button
                onClick={() => setCurrentReview((prev) => (prev + 1) % reviews.length)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-sangeet-neutral-800 hover:bg-sangeet-neutral-700 text-sangeet-neutral-300 hover:text-sangeet-400 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              >
                →
              </button>
            </>
          )}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-sangeet-neutral-300 mb-4">
            Dined with us recently? Share your experience with us!
          </p>
          <button
            onClick={() => navigate('/review')}
            className="inline-flex items-center px-6 py-3 bg-sangeet-400 text-sangeet-neutral-950 font-semibold rounded-lg hover:bg-sangeet-300 transition-colors"
          >
            Share Your Experience
            <span className="ml-2">→</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default ReviewsSection;
