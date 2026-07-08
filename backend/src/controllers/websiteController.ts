import { Request, Response, NextFunction } from 'express';
import websiteService from '../services/websiteService';
import multer from 'multer';
import path from 'path';
import type { AuthenticatedRequest } from '../types';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => { cb(null, path.join(__dirname, '../../uploads/website/')); },
  filename: (_req, file, cb) => { const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); }
});

const upload = multer({
  storage, limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) { cb(null, true); } else { cb(new Error('Only image files are allowed')); }
  }
});

export const getRestaurantSettings = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const settings = await websiteService.getRestaurantSettings(); res.json({ message: 'Restaurant settings retrieved successfully', settings }); } catch (error) { next(error); }
};
export const updateRestaurantSettings = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try { await websiteService.updateRestaurantSettings(req.user.id, req.body.settings); res.json({ message: 'Restaurant settings updated successfully' }); } catch (error) { next(error); }
};
export const getWebsiteContent = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const content = await websiteService.getWebsiteContent(); res.json({ message: 'Website content retrieved successfully', content }); } catch (error) { next(error); }
};
export const updateWebsiteContent = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try { await websiteService.updateWebsiteContent(req.user.id, req.body.content); res.json({ message: 'Website content updated successfully' }); } catch (error) { next(error); }
};
export const getWebsiteMedia = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const media = await websiteService.getWebsiteMedia(); res.json({ message: 'Website media retrieved successfully', media }); } catch (error) { next(error); }
};
const uploadWebsiteMedia = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }
    if (!req.body.media_key) { res.status(400).json({ error: 'Media key is required' }); return; }
    const media = await websiteService.uploadWebsiteMedia(req.user.id, req.file, req.body);
    res.json({ message: 'Media uploaded successfully', media });
  } catch (error) { next(error); }
};
export const uploadWebsiteMediaMiddleware = [upload.single('image'), uploadWebsiteMedia] as const;
export const deleteWebsiteMedia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { await websiteService.deleteWebsiteMedia(req.params.id); res.json({ message: 'Media deleted successfully' }); } catch (error) { next(error); }
};
export const getWebsiteStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const stats = await websiteService.getWebsiteStats(); res.json({ message: 'Website stats retrieved successfully', stats }); } catch (error) { next(error); }
};
