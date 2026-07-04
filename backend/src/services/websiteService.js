const pool = require('../config/database');
const { NotFoundError } = require('../utils/errors');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

class WebsiteService {
  async getRestaurantSettings() {
    const result = await pool.query(
      'SELECT setting_key, setting_value, setting_type, description FROM restaurant_settings ORDER BY setting_key'
    );
    const settings = {};
    result.rows.forEach(row => {
      let value = row.setting_value;
      if (row.setting_type === 'json' && value) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          logger.warn('Error parsing JSON setting:', row.setting_key, e.message);
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
    return settings;
  }

  async updateRestaurantSettings(userId, settings) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const [key, data] of Object.entries(settings)) {
        let value = data.value;
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
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getWebsiteContent() {
    const result = await pool.query(
      `SELECT section_key, title, content, content_type, is_active, display_order 
       FROM website_content 
       WHERE is_active = true 
       ORDER BY display_order, section_key`
    );
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
    return content;
  }

  async updateWebsiteContent(userId, content) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const [key, data] of Object.entries(content)) {
        await client.query(
          `INSERT INTO website_content (section_key, title, content, content_type, is_active, display_order, updated_by) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (section_key) 
           DO UPDATE SET 
             title = $2, content = $3, content_type = $4, is_active = $5, display_order = $6, updated_at = CURRENT_TIMESTAMP, updated_by = $7`,
          [key, data.title, data.content, data.content_type || 'text', data.is_active !== false, data.display_order || 0, userId]
        );
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getWebsiteMedia() {
    const result = await pool.query(
      `SELECT id, media_key, file_name, file_path, file_type, alt_text, caption, is_active, display_order
       FROM website_media 
       WHERE is_active = true 
       ORDER BY media_key, display_order`
    );
    return result.rows;
  }

  async uploadWebsiteMedia(userId, file, data) {
    const { media_key, alt_text, caption } = data;
    const relativePath = `/uploads/website/${file.filename}`;
    const result = await pool.query(
      `INSERT INTO website_media (media_key, file_name, file_path, file_type, file_size, alt_text, caption, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, media_key, file_name, file_path, alt_text, caption`,
      [media_key, file.originalname, relativePath, file.mimetype, file.size, alt_text || '', caption || '', userId]
    );
    return result.rows[0];
  }

  async deleteWebsiteMedia(id) {
    const mediaResult = await pool.query('SELECT file_path FROM website_media WHERE id = $1', [id]);
    if (mediaResult.rows.length === 0) throw new NotFoundError('Media');

    const media = mediaResult.rows[0];
    await pool.query('UPDATE website_media SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);

    try {
      const fullPath = path.join(__dirname, '../../', media.file_path);
      await fs.unlink(fullPath);
    } catch (fileError) {
      logger.warn('Could not delete physical file:', fileError.message);
    }
    return { success: true };
  }

  async getWebsiteStats() {
    const [settingsCount, contentCount, mediaCount] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM restaurant_settings'),
      pool.query('SELECT COUNT(*) as count FROM website_content WHERE is_active = true'),
      pool.query('SELECT COUNT(*) as count FROM website_media WHERE is_active = true')
    ]);

    return {
      total_settings: parseInt(settingsCount.rows[0].count),
      total_content_sections: parseInt(contentCount.rows[0].count),
      total_media_files: parseInt(mediaCount.rows[0].count)
    };
  }
}

module.exports = new WebsiteService();
