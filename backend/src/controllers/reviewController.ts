import { Request, Response, NextFunction } from 'express';
import reviewService from '../services/reviewService';

export const getAllReviews = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const reviews = await reviewService.getAllReviews(); res.json(reviews); } catch (error) { next(error); }
};
export const getVerifiedReviews = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const reviews = await reviewService.getVerifiedReviews(); res.json(reviews); } catch (error) { next(error); }
};
export const createReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const review = await reviewService.createReview(req.body); res.status(201).json({ message: 'Review submitted successfully', review }); } catch (error) { next(error); }
};
export const getReviewById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const review = await reviewService.getReviewById(req.params.id); res.json(review); } catch (error) { next(error); }
};
export const updateReviewVerification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const review = await reviewService.updateReviewVerification(req.params.id, req.body.is_verified); res.json({ message: 'Review verification status updated successfully', review }); } catch (error) { next(error); }
};
export const deleteReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { await reviewService.deleteReview(req.params.id); res.json({ message: 'Review deleted successfully' }); } catch (error) { next(error); }
};
export const getReviewStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const stats = await reviewService.getReviewStats(); res.json(stats); } catch (error) { next(error); }
};
