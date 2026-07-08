import api, { apiCallWrapper } from './client';
import { ReviewRow } from '../../types';

export const fetchReviews = async (): Promise<ReviewRow[]> => {
  return apiCallWrapper(async () => {
    return await api.get('/reviews');
  }, 'fetchReviews');
};

export const fetchVerifiedReviews = async (): Promise<ReviewRow[]> => {
  return apiCallWrapper(async () => {
    return await api.get('/reviews/verified');
  }, 'fetchVerifiedReviews');
};

export const submitReview = async (reviewData: any) => {
  return apiCallWrapper(async () => {
    return await api.post('/reviews', reviewData);
  }, 'submitReview', false);
};

export const fetchReviewById = async (id: string | number): Promise<ReviewRow> => {
  return apiCallWrapper(async () => {
    return await api.get(`/reviews/${encodeURIComponent(id)}`);
  }, 'fetchReviewById');
};
