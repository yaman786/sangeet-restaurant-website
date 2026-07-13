import api, { apiCallWrapper, serverFetch } from './client';
import { ReviewRow } from '@/lib/types';

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

export const submitReview = async (reviewData: Partial<ReviewRow>) => {
  return apiCallWrapper(async () => {
    return await api.post('/reviews', reviewData);
  }, 'submitReview', false);
};

export const fetchReviewById = async (id: string | number): Promise<ReviewRow> => {
  return apiCallWrapper(async () => {
    return await api.get(`/reviews/${encodeURIComponent(id)}`);
  }, 'fetchReviewById');
};

// SERVER COMPONENT FETCHERS
export const serverFetchReviews = async (): Promise<ReviewRow[]> => {
  return serverFetch<ReviewRow[]>('/reviews', { next: { revalidate: 3600 } });
};
