const websiteService = require('../services/websiteService');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/website/');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const getRestaurantSettings = async (req, res, next) => {
  try {
    const settings = await websiteService.getRestaurantSettings();
    res.json({
      message: 'Restaurant settings retrieved successfully',
      settings
    });
  } catch (error) {
    next(error);
  }
};

const updateRestaurantSettings = async (req, res, next) => {
  try {
    await websiteService.updateRestaurantSettings(req.user.id, req.body.settings);
    res.json({ message: 'Restaurant settings updated successfully' });
  } catch (error) {
    next(error);
  }
};

const getWebsiteContent = async (req, res, next) => {
  try {
    const content = await websiteService.getWebsiteContent();
    res.json({
      message: 'Website content retrieved successfully',
      content
    });
  } catch (error) {
    next(error);
  }
};

const updateWebsiteContent = async (req, res, next) => {
  try {
    await websiteService.updateWebsiteContent(req.user.id, req.body.content);
    res.json({ message: 'Website content updated successfully' });
  } catch (error) {
    next(error);
  }
};

const getWebsiteMedia = async (req, res, next) => {
  try {
    const media = await websiteService.getWebsiteMedia();
    res.json({
      message: 'Website media retrieved successfully',
      media
    });
  } catch (error) {
    next(error);
  }
};

const uploadWebsiteMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    if (!req.body.media_key) {
      return res.status(400).json({ error: 'Media key is required' });
    }
    const media = await websiteService.uploadWebsiteMedia(req.user.id, req.file, req.body);
    res.json({
      message: 'Media uploaded successfully',
      media
    });
  } catch (error) {
    next(error);
  }
};

const deleteWebsiteMedia = async (req, res, next) => {
  try {
    await websiteService.deleteWebsiteMedia(req.params.id);
    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getWebsiteStats = async (req, res, next) => {
  try {
    const stats = await websiteService.getWebsiteStats();
    res.json({
      message: 'Website stats retrieved successfully',
      stats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRestaurantSettings,
  updateRestaurantSettings,
  getWebsiteContent,
  updateWebsiteContent,
  getWebsiteMedia,
  uploadWebsiteMedia: [upload.single('image'), uploadWebsiteMedia],
  deleteWebsiteMedia,
  getWebsiteStats
};
