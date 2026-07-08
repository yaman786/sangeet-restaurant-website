import { Request, Response, NextFunction, RequestHandler } from 'express';
import { z } from 'zod';
import logger from '../utils/logger';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import imageOptimizer from '../utils/imageOptimizer';

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Configure multer for temporary storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/temp/');
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  }
});

export const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed'));
    }
  }
});

/**
 * Middleware to process and optimize uploaded images
 */
export const processImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.file) {
    return next();
  }

  try {
    const { media_key = 'general' } = req.body as { media_key?: string };
    const tempPath = req.file.path;
    const filename = req.file.filename;
    
    const outputDir = path.join(__dirname, '../../uploads/website/', media_key);
    ensureDirectoryExists(outputDir);
    
    logger.info(`🔄 Processing image for ${media_key}: ${filename}`);
    
    const optimizedImages = await imageOptimizer.optimizeImage(tempPath, outputDir, filename);
    
    fs.unlinkSync(tempPath);
    
    req.optimizedImages = optimizedImages;
    req.imageMetadata = {
      originalName: req.file.originalname,
      filename: filename,
      mediaKey: media_key,
      sizes: Object.keys(optimizedImages),
      directory: outputDir
    };
    
    logger.info(`✅ Image processing complete: ${filename}`);
    next();
    
  } catch (error) {
    logger.error('Error processing image:', error);
    
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Failed to process image',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Serve optimized images with proper headers
 */
export const serveOptimizedImage: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  const { size = 'medium', filename } = req.params;
  const { media_key = 'general' } = req.query as { media_key?: string };
  
  const imagePath = path.join(__dirname, '../../uploads/website/', media_key, `${size}_${filename}`);
  
  if (fs.existsSync(imagePath)) {
    res.set({
      'Cache-Control': 'public, max-age=31536000',
      'ETag': `"${fs.statSync(imagePath).mtime.getTime()}"`,
      'Expires': new Date(Date.now() + 31536000000).toUTCString()
    });
    
    res.sendFile(imagePath);
    return;
  }
  
  next();
};

export { ensureDirectoryExists };
