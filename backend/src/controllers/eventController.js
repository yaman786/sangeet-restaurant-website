const pool = require('../config/database');

// Get all events
const getAllEvents = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM events ORDER BY date ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

// Get featured events
const getFeaturedEvents = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM events WHERE is_featured = true ORDER BY date ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching featured events:', error);
    res.status(500).json({ error: 'Failed to fetch featured events' });
  }
};

// Get upcoming events
const getUpcomingEvents = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const result = await pool.query(
      'SELECT * FROM events WHERE date >= $1 ORDER BY date ASC',
      [today]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming events' });
  }
};

// Get single event
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM events WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

// Create new event (Admin only)
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      image_url,
      is_featured
    } = req.body;

    const result = await pool.query(
      `INSERT INTO events 
       (title, description, date, image_url, is_featured)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, description, date, image_url || null, is_featured || false]
    );

    res.status(201).json({
      message: 'Event created successfully',
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

// Update event (Admin only)
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      date,
      image_url,
      is_featured
    } = req.body;

    const result = await pool.query(
      `UPDATE events 
       SET title = $1, description = $2, date = $3, image_url = $4, is_featured = $5
       WHERE id = $6
       RETURNING *`,
      [title, description, date, image_url || null, is_featured || false, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({
      message: 'Event updated successfully',
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

// Delete event (Admin only)
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM events WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

// Get events by date range
const getEventsByDateRange = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const result = await pool.query(
      'SELECT * FROM events WHERE date BETWEEN $1 AND $2 ORDER BY date ASC',
      [start_date, end_date]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching events by date range:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

// Get event statistics
const getEventStats = async (req, res) => {
  try {
    const statsResult = await pool.query(
      `SELECT 
        COUNT(*) as total_events,
        COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_events,
        COUNT(CASE WHEN date >= CURRENT_DATE THEN 1 END) as upcoming_events,
        COUNT(CASE WHEN date < CURRENT_DATE THEN 1 END) as past_events
       FROM events`
    );

    res.json(statsResult.rows[0]);
  } catch (error) {
    console.error('Error fetching event statistics:', error);
    res.status(500).json({ error: 'Failed to fetch event statistics' });
  }
};

module.exports = {
  getAllEvents,
  getFeaturedEvents,
  getUpcomingEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsByDateRange,
  getEventStats
}; 