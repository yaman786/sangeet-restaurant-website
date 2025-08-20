const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
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
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
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

// Get all restaurant settings
const getRestaurantSettings = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT setting_key, setting_value, setting_type, description FROM restaurant_settings ORDER BY setting_key'
    );

    // Convert settings to object format
    const settings = {};
    result.rows.forEach(row => {
      let value = row.setting_value;
      
      // Parse JSON and boolean values
      if (row.setting_type === 'json' && value) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          console.error('Error parsing JSON setting:', row.setting_key, e);
        }
      } else if (row.setting_type === 'boolean') {
        value = value === 'true';
      }
      
      settings[row.setting_key] = {
        value,
        type: row.setting_type,
        description: row.description
      };
    });

    res.json({
      message: 'Restaurant settings retrieved successfully',
      settings
    });
  } catch (error) {
    console.error('Error fetching restaurant settings:', error);
    res.status(500).json({ error: 'Failed to fetch restaurant settings' });
  }
};

// Update restaurant settings
const updateRestaurantSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    const userId = req.user.id;

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const [key, data] of Object.entries(settings)) {
        let value = data.value;
        
        // Convert objects/arrays to JSON strings
        if (typeof value === 'object') {
          value = JSON.stringify(value);
        } else if (typeof value === 'boolean') {
          value = value.toString();
        }

        await client.query(
          `INSERT INTO restaurant_settings (setting_key, setting_value, setting_type, updated_by) 
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (setting_key) 
           DO UPDATE SET setting_value = $2, updated_at = CURRENT_TIMESTAMP, updated_by = $4`,
          [key, value, data.type || 'text', userId]
        );
      }

      await client.query('COMMIT');
      res.json({ message: 'Restaurant settings updated successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating restaurant settings:', error);
    res.status(500).json({ error: 'Failed to update restaurant settings' });
  }
};

// Get all website content
const getWebsiteContent = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT section_key, title, content, content_type, is_active, display_order 
       FROM website_content 
       WHERE is_active = true 
       ORDER BY display_order, section_key`
    );

    // Convert to object format
    const content = {};
    result.rows.forEach(row => {
      content[row.section_key] = {
        title: row.title,
        content: row.content,
        content_type: row.content_type,
        is_active: row.is_active,
        display_order: row.display_order
      };
    });

    res.json({
      message: 'Website content retrieved successfully',
      content
    });
  } catch (error) {
    console.error('Error fetching website content:', error);
    res.status(500).json({ error: 'Failed to fetch website content' });
  }
};

// Update website content
const updateWebsiteContent = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.id;

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const [key, data] of Object.entries(content)) {
        await client.query(
          `INSERT INTO website_content (section_key, title, content, content_type, is_active, display_order, updated_by) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (section_key) 
           DO UPDATE SET 
             title = $2, 
             content = $3, 
             content_type = $4, 
             is_active = $5, 
             display_order = $6, 
             updated_at = CURRENT_TIMESTAMP, 
             updated_by = $7`,
          [
            key, 
            data.title, 
            data.content, 
            data.content_type || 'text', 
            data.is_active !== false, 
            data.display_order || 0, 
            userId
          ]
        );
      }

      await client.query('COMMIT');
      res.json({ message: 'Website content updated successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating website content:', error);
    res.status(500).json({ error: 'Failed to update website content' });
  }
};

// Get website media/images
const getWebsiteMedia = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, media_key, file_name, file_path, file_type, alt_text, caption, is_active, display_order
       FROM website_media 
       WHERE is_active = true 
       ORDER BY media_key, display_order`
    );

    res.json({
      message: 'Website media retrieved successfully',
      media: result.rows
    });
  } catch (error) {
    console.error('Error fetching website media:', error);
    res.status(500).json({ error: 'Failed to fetch website media' });
  }
};

// Upload website media
const uploadWebsiteMedia = async (req, res) => {
  try {
    const { media_key, alt_text, caption } = req.body;
    const file = req.file;
    const userId = req.user.id;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!media_key) {
      return res.status(400).json({ error: 'Media key is required' });
    }

    // Create relative file path
    const relativePath = `/uploads/website/${file.filename}`;

    // Save to database
    const result = await pool.query(
      `INSERT INTO website_media (media_key, file_name, file_path, file_type, file_size, alt_text, caption, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, media_key, file_name, file_path, alt_text, caption`,
      [media_key, file.originalname, relativePath, file.mimetype, file.size, alt_text || '', caption || '', userId]
    );

    res.json({
      message: 'Media uploaded successfully',
      media: result.rows[0]
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ error: 'Failed to upload media' });
  }
};

// Delete website media
const deleteWebsiteMedia = async (req, res) => {
  try {
    const { id } = req.params;

    // Get media info first
    const mediaResult = await pool.query(
      'SELECT file_path FROM website_media WHERE id = $1',
      [id]
    );

    if (mediaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Media not found' });
    }

    const media = mediaResult.rows[0];
    
    // Delete from database (soft delete)
    await pool.query(
      'UPDATE website_media SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    // Optionally delete physical file
    try {
      const fullPath = path.join(__dirname, '../../', media.file_path);
      await fs.unlink(fullPath);
    } catch (fileError) {
      console.warn('Could not delete physical file:', fileError.message);
    }

    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ error: 'Failed to delete media' });
  }
};

// Get website stats/overview
const getWebsiteStats = async (req, res) => {
  try {
    const [settingsCount, contentCount, mediaCount] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM restaurant_settings'),
      pool.query('SELECT COUNT(*) as count FROM website_content WHERE is_active = true'),
      pool.query('SELECT COUNT(*) as count FROM website_media WHERE is_active = true')
    ]);

    const stats = {
      total_settings: parseInt(settingsCount.rows[0].count),
      total_content_sections: parseInt(contentCount.rows[0].count),
      total_media_files: parseInt(mediaCount.rows[0].count)
    };

    res.json({
      message: 'Website stats retrieved successfully',
      stats
    });
  } catch (error) {
    console.error('Error fetching website stats:', error);
    res.status(500).json({ error: 'Failed to fetch website stats' });
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
