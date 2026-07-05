import api, { apiCallWrapper } from './client';

export const fetchReviews = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/reviews');
  }, 'fetchReviews');
};

export const fetchVerifiedReviews = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/reviews/verified');
  }, 'fetchVerifiedReviews');
};

export const submitReview = async (reviewData) => {
  return apiCallWrapper(async () => {
    return await api.post('/reviews', reviewData);
  }, 'submitReview', false);
};

export const fetchReviewById = async (id) => {
  return apiCallWrapper(async () => {
    return await api.get(`/reviews/${encodeURIComponent(id)}`);
  }, 'fetchReviewById');
};
