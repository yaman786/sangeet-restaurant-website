const multer = require('multer');
const path = require('path');
const fs = require('fs');
const imageOptimizer = require('../utils/imageOptimizer');

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Configure multer for temporary storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/temp/');
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
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
const processImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const { media_key = 'general' } = req.body;
    const tempPath = req.file.path;
    const filename = req.file.filename;
    
    // Create organized directory structure
    const outputDir = path.join(__dirname, '../../uploads/website/', media_key);
    ensureDirectoryExists(outputDir);
    
    console.log(`🔄 Processing image for ${media_key}: ${filename}`);
    
    // Optimize image and create multiple sizes
    const optimizedImages = await imageOptimizer.optimizeImage(
      tempPath,
      outputDir,
      filename
    );
    
    // Clean up temporary file
    fs.unlinkSync(tempPath);
    
    // Add optimized image info to request
    req.optimizedImages = optimizedImages;
    req.imageMetadata = {
      originalName: req.file.originalname,
      filename: filename,
      mediaKey: media_key,
      sizes: Object.keys(optimizedImages),
      directory: outputDir
    };
    
    console.log(`✅ Image processing complete: ${filename}`);
    next();
    
  } catch (error) {
    console.error('Error processing image:', error);
    
    // Clean up temp file on error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Failed to process image',
      details: error.message 
    });
  }
};

/**
 * Serve optimized images with proper headers
 */
const serveOptimizedImage = (req, res, next) => {
  const { size = 'medium', filename } = req.params;
  const { media_key = 'general' } = req.query;
  
  const imagePath = path.join(__dirname, '../../uploads/website/', media_key, `${size}_${filename}`);
  
  // Check if optimized version exists
  if (fs.existsSync(imagePath)) {
    // Set caching headers for production
    res.set({
      'Cache-Control': 'public, max-age=31536000', // 1 year
      'ETag': `"${fs.statSync(imagePath).mtime.getTime()}"`,
      'Expires': new Date(Date.now() + 31536000000).toUTCString()
    });
    
    return res.sendFile(imagePath);
  }
  
  // Fallback to original if optimized version doesn't exist
  next();
};

module.exports = {
  upload,
  processImage,
  serveOptimizedImage,
  ensureDirectoryExists
};
