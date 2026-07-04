const pool = require('../config/database');
const { NotFoundError, ValidationError } = require('../utils/errors');

class EventService {
  async getAllEvents() {
    const result = await pool.query('SELECT * FROM events ORDER BY date ASC');
    return result.rows;
  }

  async getFeaturedEvents() {
    const result = await pool.query('SELECT * FROM events WHERE is_featured = true ORDER BY date ASC');
    return result.rows;
  }

  async getUpcomingEvents() {
    const today = new Date().toISOString().split('T')[0];
    const result = await pool.query(
      'SELECT * FROM events WHERE date >= $1 ORDER BY date ASC',
      [today]
    );
    return result.rows;
  }

  async getEventById(id) {
    const result = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      throw new NotFoundError('Event');
    }
    
    return result.rows[0];
  }

  async createEvent(data) {
    const { title, description, date, image_url, is_featured } = data;

    const result = await pool.query(
      `INSERT INTO events 
       (title, description, date, image_url, is_featured)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, description, date, image_url || null, is_featured || false]
    );

    return result.rows[0];
  }

  async updateEvent(id, data) {
    const { title, description, date, image_url, is_featured } = data;

    const result = await pool.query(
      `UPDATE events 
       SET title = $1, description = $2, date = $3, image_url = $4, is_featured = $5
       WHERE id = $6
       RETURNING *`,
      [title, description, date, image_url || null, is_featured || false, id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Event');
    }

    return result.rows[0];
  }

  async deleteEvent(id) {
    const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      throw new NotFoundError('Event');
    }

    return result.rows[0];
  }

  async getEventsByDateRange(start_date, end_date) {
    if (!start_date || !end_date) {
      throw new ValidationError('Start date and end date are required');
    }

    const result = await pool.query(
      'SELECT * FROM events WHERE date BETWEEN $1 AND $2 ORDER BY date ASC',
      [start_date, end_date]
    );

    return result.rows;
  }

  async getEventStats() {
    const statsResult = await pool.query(
      `SELECT 
        COUNT(*) as total_events,
        COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_events,
        COUNT(CASE WHEN date >= CURRENT_DATE THEN 1 END) as upcoming_events,
        COUNT(CASE WHEN date < CURRENT_DATE THEN 1 END) as past_events
       FROM events`
    );

    return statsResult.rows[0];
  }
}

module.exports = new EventService();
