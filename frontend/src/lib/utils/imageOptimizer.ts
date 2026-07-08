import logger from './logger';
import sharp from 'sharp';
import path from 'path';
import { promises as fs } from 'fs';
import type { ImageSizes, OptimizedImages } from '../types';

/**
 * Image optimization utility for restaurant website
 */
class ImageOptimizer {
  readonly sizes: ImageSizes = {
    thumbnail: { width: 150, height: 150 },
    small: { width: 400, height: 300 },
    medium: { width: 800, height: 600 },
    large: { width: 1200, height: 900 },
    hero: { width: 1920, height: 1080 }
  };

  /**
   * Optimize and create multiple sizes of an image
   */
  async optimizeImage(inputPath: string, outputDir: string, filename: string): Promise<OptimizedImages> {
    try {
      const image = sharp(inputPath);
      const metadata = await image.metadata();
      
      logger.info(`📸 Processing image: ${filename} (${metadata.width}x${metadata.height})`);
      
      const optimizedImages: OptimizedImages = {};

      // Create optimized versions for each size
      for (const [sizeName, dimensions] of Object.entries(this.sizes)) {
        const outputPath = path.join(outputDir, `${sizeName}_${filename}`);
        
        await image
          .resize(dimensions.width, dimensions.height, {
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ 
            quality: 85,
            progressive: true
          })
          .toFile(outputPath);
        
        optimizedImages[sizeName] = outputPath;
        logger.info(`✅ Created ${sizeName}: ${dimensions.width}x${dimensions.height}`);
      }

      // Create WebP versions for modern browsers
      const webpPath = path.join(outputDir, `webp_${filename.replace(/\.[^/.]+$/, '.webp')}`);
      await image
        .resize(800, 600, { fit: 'cover' })
        .webp({ quality: 80 })
        .toFile(webpPath);
      
      optimizedImages.webp = webpPath;

      return optimizedImages;
    } catch (error) {
      logger.error('Error optimizing image:', error);
      throw error;
    }
  }

  /**
   * Generate responsive image HTML
   */
  generateResponsiveImageHtml(baseUrl: string, filename: string, alt = ''): string {
    const webpSrc = `${baseUrl}/webp_${filename.replace(/\.[^/.]+$/, '.webp')}`;
    const jpegSrc = `${baseUrl}/medium_${filename}`;
    
    return `
      <picture>
        <source srcset="${webpSrc}" type="image/webp">
        <img 
          src="${jpegSrc}"
          srcset="
            ${baseUrl}/small_${filename} 400w,
            ${baseUrl}/medium_${filename} 800w,
            ${baseUrl}/large_${filename} 1200w
          "
          sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
          alt="${alt}"
          loading="lazy"
        >
      </picture>
    `;
  }

  /**
   * Clean up old image files
   */
  async cleanupOldImages(directory: string, maxAge = 30): Promise<void> {
    try {
      const files = await fs.readdir(directory);
      const now = Date.now();
      const maxAgeMs = maxAge * 24 * 60 * 60 * 1000; // Convert days to milliseconds

      for (const file of files) {
        const filePath = path.join(directory, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAgeMs) {
          await fs.unlink(filePath);
          logger.info(`🗑️ Cleaned up old image: ${file}`);
        }
      }
    } catch (error) {
      logger.error('Error cleaning up images:', error);
    }
  }
}

export default new ImageOptimizer();
