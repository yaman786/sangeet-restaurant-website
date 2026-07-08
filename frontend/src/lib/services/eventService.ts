import pool from '@/lib/db';
import { NotFoundError, ValidationError } from '@/lib/errors';
import type { EventRow } from '@/lib/types';

class EventService {
  async getAllEvents(): Promise<EventRow[]> {
    const result = await pool.query('SELECT * FROM events ORDER BY date ASC');
    return result.rows;
  }

  async getFeaturedEvents(): Promise<EventRow[]> {
    const result = await pool.query('SELECT * FROM events WHERE is_featured = true ORDER BY date ASC');
    return result.rows;
  }

  async getUpcomingEvents(): Promise<EventRow[]> {
    const today = new Date().toISOString().split('T')[0];
    const result = await pool.query('SELECT * FROM events WHERE date >= $1 ORDER BY date ASC', [today]);
    return result.rows;
  }

  async getEventById(id: string): Promise<EventRow> {
    const result = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
    if (result.rows.length === 0) throw new NotFoundError('Event');
    return result.rows[0];
  }

  async createEvent(data: Record<string, any>): Promise<EventRow> {
    const { title, description, date, image_url, is_featured } = data;
    const result = await pool.query(
      `INSERT INTO events (title, description, date, image_url, is_featured)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, description, date, image_url || null, is_featured || false]
    );
    return result.rows[0];
  }

  async updateEvent(id: string, data: Record<string, any>): Promise<EventRow> {
    const { title, description, date, image_url, is_featured } = data;
    const result = await pool.query(
      `UPDATE events SET title = $1, description = $2, date = $3, image_url = $4, is_featured = $5
       WHERE id = $6 RETURNING *`,
      [title, description, date, image_url || null, is_featured || false, id]
    );
    if (result.rows.length === 0) throw new NotFoundError('Event');
    return result.rows[0];
  }

  async deleteEvent(id: string): Promise<EventRow> {
    const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) throw new NotFoundError('Event');
    return result.rows[0];
  }

  async getEventsByDateRange(start_date: string, end_date: string): Promise<EventRow[]> {
    if (!start_date || !end_date) throw new ValidationError('Start date and end date are required');
    const result = await pool.query('SELECT * FROM events WHERE date BETWEEN $1 AND $2 ORDER BY date ASC', [start_date, end_date]);
    return result.rows;
  }

  async getEventStats(): Promise<Record<string, number>> {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_events,
        COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_events,
        COUNT(CASE WHEN date >= CURRENT_DATE THEN 1 END) as upcoming_events,
        COUNT(CASE WHEN date < CURRENT_DATE THEN 1 END) as past_events
      FROM events
    `);
    const r = result.rows[0];
    return {
      total_events: parseInt(r.total_events, 10),
      featured_events: parseInt(r.featured_events, 10),
      upcoming_events: parseInt(r.upcoming_events, 10),
      past_events: parseInt(r.past_events, 10)
    };
  }
}

export default new EventService();
