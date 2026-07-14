import pool from '@/lib/db';
import { NotFoundError } from '@/lib/errors';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';

class WebsiteService {
  async getRestaurantSettings(): Promise<Record<string, any>> {
    const result = await pool.query(
      'SELECT setting_key, setting_value, setting_type, description FROM restaurant_settings ORDER BY setting_key'
    );
    const settings: Record<string, any> = {};
    result.rows.forEach(row => {
      let value: any = row.setting_value;
      if (row.setting_type === 'json' && value) {
        try { value = JSON.parse(value); } catch (e: any) { logger.warn('Error parsing JSON setting:', row.setting_key, e.message); }
      } else if (row.setting_type === 'boolean') {
        value = value === 'true';
      }
      settings[row.setting_key] = { value, type: row.setting_type, description: row.description };
    });
    return settings;
  }

  async updateRestaurantSettings(userId: number, settings: Record<string, any>): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const [key, data] of Object.entries(settings)) {
        let value = data.value;
        if (typeof value === 'object') value = JSON.stringify(value);
        else if (typeof value === 'boolean') value = value.toString();
        
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

  async getWebsiteContent(): Promise<Record<string, any>> {
    const result = await pool.query(
      `SELECT section_key, title, content, content_type, is_active, display_order 
       FROM website_content WHERE is_active = true ORDER BY display_order, section_key`
    );
    const content: Record<string, any> = {};
    result.rows.forEach(row => {
      content[row.section_key] = {
        title: row.title, content: row.content, content_type: row.content_type,
        is_active: row.is_active, display_order: row.display_order
      };
    });
    return content;
  }

  async updateWebsiteContent(userId: number, content: Record<string, any>): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const [key, data] of Object.entries(content)) {
        await client.query(
          `INSERT INTO website_content (section_key, title, content, content_type, is_active, display_order, updated_by) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (section_key) 
           DO UPDATE SET title = $2, content = $3, content_type = $4, is_active = $5, display_order = $6, updated_at = CURRENT_TIMESTAMP, updated_by = $7`,
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

  async getWebsiteMedia(): Promise<any[]> {
    const result = await pool.query(
      `SELECT id, media_key, file_name, file_path, file_type, alt_text, caption, is_active, display_order
       FROM website_media WHERE is_active = true ORDER BY media_key, display_order`
    );
    return result.rows;
  }

  async uploadWebsiteMedia(userId: number, file: any, data: Record<string, any>): Promise<any> {
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

  async deleteWebsiteMedia(id: string): Promise<{ success: boolean }> {
    const mediaResult = await pool.query('SELECT file_path FROM website_media WHERE id = $1', [id]);
    if (mediaResult.rows.length === 0) throw new NotFoundError('Media');

    const media = mediaResult.rows[0];
    await pool.query('UPDATE website_media SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);

    try {
      const fullPath = path.join(__dirname, '../../', media.file_path);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    } catch (fileError: any) {
      logger.warn('Could not delete physical file:', fileError.message);
    }
    return { success: true };
  }

  async getWebsiteStats(): Promise<Record<string, number>> {
    const [settingsCount, contentCount, mediaCount] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM restaurant_settings'),
      pool.query('SELECT COUNT(*) as count FROM website_content WHERE is_active = true'),
      pool.query('SELECT COUNT(*) as count FROM website_media WHERE is_active = true')
    ]);

    return {
      total_settings: parseInt(settingsCount.rows[0].count, 10),
      total_content_sections: parseInt(contentCount.rows[0].count, 10),
      total_media_files: parseInt(mediaCount.rows[0].count, 10)
    };
  }

  // --- Banner Methods ---

  async getActiveBanners(): Promise<any[]> {
    const result = await pool.query(
      `SELECT id, setting_key, setting_value, updated_at
       FROM restaurant_settings
       WHERE setting_key LIKE 'banner_%' AND setting_type = 'json'
       ORDER BY updated_at DESC`
    );
    return result.rows.map(row => {
      try {
        return { id: row.id, ...JSON.parse(row.setting_value) };
      } catch {
        return { id: row.id, raw: row.setting_value };
      }
    });
  }

  async createBanner(data: Record<string, any>): Promise<any> {
    const bannerKey = `banner_${Date.now()}`;
    const value = JSON.stringify(data);
    const result = await pool.query(
      `INSERT INTO restaurant_settings (setting_key, setting_value, setting_type, description)
       VALUES ($1, $2, 'json', 'Website banner')
       RETURNING id, setting_key, setting_value`,
      [bannerKey, value]
    );
    return { id: result.rows[0].id, ...data };
  }

  async updateBanner(id: string, data: Record<string, any>): Promise<any> {
    const value = JSON.stringify(data);
    const result = await pool.query(
      `UPDATE restaurant_settings
       SET setting_value = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND setting_key LIKE 'banner_%'
       RETURNING id, setting_key, setting_value`,
      [value, id]
    );
    if (result.rows.length === 0) throw new NotFoundError('Banner');
    return { id: result.rows[0].id, ...data };
  }

  async deleteBanner(id: string): Promise<{ success: boolean }> {
    const result = await pool.query(
      `DELETE FROM restaurant_settings WHERE id = $1 AND setting_key LIKE 'banner_%' RETURNING id`,
      [id]
    );
    if (result.rows.length === 0) throw new NotFoundError('Banner');
    return { success: true };
  }

  // --- Business Hours Methods ---

  async getBusinessHours(): Promise<any> {
    const result = await pool.query(
      `SELECT setting_value FROM restaurant_settings WHERE setting_key = 'opening_hours'`
    );
    if (result.rows.length === 0) return {};
    try {
      return JSON.parse(result.rows[0].setting_value);
    } catch {
      return {};
    }
  }

  async updateBusinessHours(data: Record<string, any>): Promise<any> {
    const value = JSON.stringify(data);
    await pool.query(
      `INSERT INTO restaurant_settings (setting_key, setting_value, setting_type, description)
       VALUES ('opening_hours', $1, 'json', 'Restaurant opening hours')
       ON CONFLICT (setting_key)
       DO UPDATE SET setting_value = $1, updated_at = CURRENT_TIMESTAMP`,
      [value]
    );
    return data;
  }

  // --- Footer Settings Methods ---

  async getFooterSettings(): Promise<Record<string, any>> {
    const result = await pool.query(
      `SELECT setting_key, setting_value FROM restaurant_settings
       WHERE setting_key IN ('footer_description', 'footer_copyright', 'footer_links')
       ORDER BY setting_key`
    );
    const settings: Record<string, any> = {};
    for (const row of result.rows) {
      const key = row.setting_key.replace('footer_', '');
      try {
        settings[key] = JSON.parse(row.setting_value);
      } catch {
        settings[key] = row.setting_value;
      }
    }
    // Also pull from website_content if footer_description exists there
    if (!settings.description) {
      const contentResult = await pool.query(
        `SELECT content FROM website_content WHERE section_key = 'footer_description' AND is_active = true`
      );
      if (contentResult.rows.length > 0) {
        settings.description = contentResult.rows[0].content;
      }
    }
    return settings;
  }

  async updateFooterSettings(data: Record<string, any>): Promise<Record<string, any>> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const [key, value] of Object.entries(data)) {
        const settingKey = `footer_${key}`;
        const settingValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        await client.query(
          `INSERT INTO restaurant_settings (setting_key, setting_value, setting_type, description)
           VALUES ($1, $2, 'text', 'Footer setting')
           ON CONFLICT (setting_key)
           DO UPDATE SET setting_value = $2, updated_at = CURRENT_TIMESTAMP`,
          [settingKey, settingValue]
        );
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    return data;
  }

  // --- SEO Settings Methods ---

  async getSeoSettings(): Promise<Record<string, any>> {
    const result = await pool.query(
      `SELECT setting_key, setting_value FROM restaurant_settings
       WHERE setting_key LIKE 'seo_%'
       ORDER BY setting_key`
    );
    const settings: Record<string, any> = {};
    for (const row of result.rows) {
      const key = row.setting_key.replace('seo_', '');
      settings[key] = row.setting_value;
    }
    return settings;
  }

  async updateSeoSettings(data: Record<string, any>): Promise<Record<string, any>> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const [key, value] of Object.entries(data)) {
        const settingKey = `seo_${key}`;
        await client.query(
          `INSERT INTO restaurant_settings (setting_key, setting_value, setting_type, description)
           VALUES ($1, $2, 'text', 'SEO setting')
           ON CONFLICT (setting_key)
           DO UPDATE SET setting_value = $2, updated_at = CURRENT_TIMESTAMP`,
          [settingKey, String(value)]
        );
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    return data;
  }

  // --- Social Links Methods ---

  async getSocialLinks(): Promise<Record<string, string>> {
    const result = await pool.query(
      `SELECT setting_key, setting_value FROM restaurant_settings
       WHERE setting_key LIKE 'social_%'
       ORDER BY setting_key`
    );
    const links: Record<string, string> = {};
    for (const row of result.rows) {
      const key = row.setting_key.replace('social_', '');
      links[key] = row.setting_value || '';
    }
    return links;
  }

  async updateSocialLinks(data: Record<string, any>): Promise<Record<string, string>> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const [key, value] of Object.entries(data)) {
        const settingKey = `social_${key}`;
        await client.query(
          `INSERT INTO restaurant_settings (setting_key, setting_value, setting_type, description)
           VALUES ($1, $2, 'text', 'Social media link')
           ON CONFLICT (setting_key)
           DO UPDATE SET setting_value = $2, updated_at = CURRENT_TIMESTAMP`,
          [settingKey, String(value)]
        );
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    return data as Record<string, string>;
  }
}

export default new WebsiteService();
