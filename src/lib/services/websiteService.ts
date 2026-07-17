import { prisma } from '@/lib/db';
import { NotFoundError } from '@/lib/errors';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';

class WebsiteService {
  async getRestaurantSettings(): Promise<Record<string, any>> {
    const rows = await prisma.restaurant_settings.findMany({
      orderBy: { setting_key: 'asc' }
    });
    const settings: Record<string, any> = {};
    rows.forEach(row => {
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
    const upserts = [];
    for (const [key, data] of Object.entries(settings)) {
      let value = data.value;
      if (typeof value === 'object') value = JSON.stringify(value);
      else if (typeof value === 'boolean') value = value.toString();
      
      const valStr = String(value);
      upserts.push(prisma.restaurant_settings.upsert({
        where: { setting_key: key },
        update: { setting_value: valStr, updated_at: new Date(), updated_by: userId },
        create: { setting_key: key, setting_value: valStr, setting_type: data.type || 'text', updated_by: userId }
      }));
    }
    await prisma.$transaction(upserts);
  }

  async getWebsiteContent(): Promise<Record<string, any>> {
    const rows = await prisma.website_content.findMany({
      where: { is_active: true },
      orderBy: [{ display_order: 'asc' }, { section_key: 'asc' }]
    });
    const content: Record<string, any> = {};
    rows.forEach(row => {
      content[row.section_key] = {
        title: row.title, content: row.content, content_type: row.content_type,
        is_active: row.is_active, display_order: row.display_order
      };
    });
    return content;
  }

  async updateWebsiteContent(userId: number, content: Record<string, any>): Promise<void> {
    const upserts = [];
    for (const [key, data] of Object.entries(content)) {
      upserts.push(prisma.website_content.upsert({
        where: { section_key: key },
        update: {
          title: data.title, content: data.content, content_type: data.content_type || 'text',
          is_active: data.is_active !== false, display_order: data.display_order || 0,
          updated_at: new Date(), updated_by: userId
        },
        create: {
          section_key: key, title: data.title, content: data.content, content_type: data.content_type || 'text',
          is_active: data.is_active !== false, display_order: data.display_order || 0,
          updated_by: userId
        }
      }));
    }
    await prisma.$transaction(upserts);
  }

  async getWebsiteMedia(): Promise<any[]> {
    return prisma.website_media.findMany({
      where: { is_active: true },
      orderBy: [{ media_key: 'asc' }, { display_order: 'asc' }]
    });
  }

  async uploadWebsiteMedia(userId: number, file: any, data: Record<string, any>): Promise<any> {
    const { media_key, alt_text, caption } = data;
    const relativePath = `/uploads/website/${file.filename}`;
    
    return prisma.website_media.create({
      data: {
        media_key, file_name: file.originalname, file_path: relativePath,
        file_type: file.mimetype, file_size: file.size,
        alt_text: alt_text || '', caption: caption || '',
        updated_by: userId
      }
    });
  }

  async deleteWebsiteMedia(id: string): Promise<{ success: boolean }> {
    const mediaId = parseInt(id, 10);
    const media = await prisma.website_media.findUnique({ where: { id: mediaId } });
    if (!media) throw new NotFoundError('Media');

    await prisma.website_media.update({
      where: { id: mediaId },
      data: { is_active: false, updated_at: new Date() }
    });

    try {
      const fullPath = path.join(__dirname, '../../', media.file_path);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    } catch (fileError: any) {
      logger.warn('Could not delete physical file:', fileError.message);
    }
    return { success: true };
  }

  async getWebsiteStats(): Promise<Record<string, number>> {
    const [settingsCount, contentCount, mediaCount] = await prisma.$transaction([
      prisma.restaurant_settings.count(),
      prisma.website_content.count({ where: { is_active: true } }),
      prisma.website_media.count({ where: { is_active: true } })
    ]);

    return {
      total_settings: settingsCount,
      total_content_sections: contentCount,
      total_media_files: mediaCount
    };
  }

  // --- Banner Methods ---

  async getActiveBanners(): Promise<any[]> {
    const rows = await prisma.restaurant_settings.findMany({
      where: { setting_key: { startsWith: 'banner_' }, setting_type: 'json' },
      orderBy: { updated_at: 'desc' }
    });
    return rows.map(row => {
      try {
        return { id: row.id, ...(row.setting_value ? JSON.parse(row.setting_value) : {}) };
      } catch {
        return { id: row.id, raw: row.setting_value };
      }
    });
  }

  async createBanner(data: Record<string, any>): Promise<any> {
    const bannerKey = `banner_${Date.now()}`;
    const value = JSON.stringify(data);
    const banner = await prisma.restaurant_settings.create({
      data: { setting_key: bannerKey, setting_value: value, setting_type: 'json', description: 'Website banner' }
    });
    return { id: banner.id, ...data };
  }

  async updateBanner(id: string, data: Record<string, any>): Promise<any> {
    const value = JSON.stringify(data);
    try {
      await prisma.restaurant_settings.updateMany({
        where: { id: parseInt(id, 10), setting_key: { startsWith: 'banner_' } },
        data: { setting_value: value, updated_at: new Date() }
      });
      return { id, ...data };
    } catch (e) {
      throw new NotFoundError('Banner');
    }
  }

  async deleteBanner(id: string): Promise<{ success: boolean }> {
    const result = await prisma.restaurant_settings.deleteMany({
      where: { id: parseInt(id, 10), setting_key: { startsWith: 'banner_' } }
    });
    if (result.count === 0) throw new NotFoundError('Banner');
    return { success: true };
  }

  // --- Business Hours Methods ---

  async getBusinessHours(): Promise<any> {
    const setting = await prisma.restaurant_settings.findUnique({
      where: { setting_key: 'opening_hours' }
    });
    if (!setting || !setting.setting_value) return {};
    try {
      return JSON.parse(setting.setting_value);
    } catch {
      return {};
    }
  }

  async updateBusinessHours(data: Record<string, any>): Promise<any> {
    const value = JSON.stringify(data);
    await prisma.restaurant_settings.upsert({
      where: { setting_key: 'opening_hours' },
      update: { setting_value: value, updated_at: new Date() },
      create: { setting_key: 'opening_hours', setting_value: value, setting_type: 'json', description: 'Restaurant opening hours' }
    });
    return data;
  }

  // --- Footer Settings Methods ---

  async getFooterSettings(): Promise<Record<string, any>> {
    const rows = await prisma.restaurant_settings.findMany({
      where: { setting_key: { in: ['footer_description', 'footer_copyright', 'footer_links'] } },
      orderBy: { setting_key: 'asc' }
    });
    const settings: Record<string, any> = {};
    for (const row of rows) {
      const key = row.setting_key.replace('footer_', '');
      try {
        settings[key] = row.setting_value ? JSON.parse(row.setting_value) : '';
      } catch {
        settings[key] = row.setting_value;
      }
    }
    
    if (!settings.description) {
      const content = await prisma.website_content.findUnique({
        where: { section_key: 'footer_description' }
      });
      if (content && content.is_active && content.content) {
        settings.description = content.content;
      }
    }
    return settings;
  }

  async updateFooterSettings(data: Record<string, any>): Promise<Record<string, any>> {
    const upserts = [];
    for (const [key, value] of Object.entries(data)) {
      const settingKey = `footer_${key}`;
      const settingValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      upserts.push(prisma.restaurant_settings.upsert({
        where: { setting_key: settingKey },
        update: { setting_value: settingValue, updated_at: new Date() },
        create: { setting_key: settingKey, setting_value: settingValue, setting_type: 'text', description: 'Footer setting' }
      }));
    }
    await prisma.$transaction(upserts);
    return data;
  }

  // --- SEO Settings Methods ---

  async getSeoSettings(): Promise<Record<string, any>> {
    const rows = await prisma.restaurant_settings.findMany({
      where: { setting_key: { startsWith: 'seo_' } },
      orderBy: { setting_key: 'asc' }
    });
    const settings: Record<string, any> = {};
    for (const row of rows) {
      const key = row.setting_key.replace('seo_', '');
      settings[key] = row.setting_value;
    }
    return settings;
  }

  async updateSeoSettings(data: Record<string, any>): Promise<Record<string, any>> {
    const upserts = [];
    for (const [key, value] of Object.entries(data)) {
      const settingKey = `seo_${key}`;
      upserts.push(prisma.restaurant_settings.upsert({
        where: { setting_key: settingKey },
        update: { setting_value: String(value), updated_at: new Date() },
        create: { setting_key: settingKey, setting_value: String(value), setting_type: 'text', description: 'SEO setting' }
      }));
    }
    await prisma.$transaction(upserts);
    return data;
  }

  // --- Social Links Methods ---

  async getSocialLinks(): Promise<Record<string, string>> {
    const rows = await prisma.restaurant_settings.findMany({
      where: { setting_key: { startsWith: 'social_' } },
      orderBy: { setting_key: 'asc' }
    });
    const links: Record<string, string> = {};
    for (const row of rows) {
      const key = row.setting_key.replace('social_', '');
      links[key] = row.setting_value || '';
    }
    return links;
  }

  async updateSocialLinks(data: Record<string, any>): Promise<Record<string, string>> {
    const upserts = [];
    for (const [key, value] of Object.entries(data)) {
      const settingKey = `social_${key}`;
      upserts.push(prisma.restaurant_settings.upsert({
        where: { setting_key: settingKey },
        update: { setting_value: String(value), updated_at: new Date() },
        create: { setting_key: settingKey, setting_value: String(value), setting_type: 'text', description: 'Social media link' }
      }));
    }
    await prisma.$transaction(upserts);
    return data as Record<string, string>;
  }
}

export default new WebsiteService();
