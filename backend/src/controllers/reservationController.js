const pool = require('../config/database');
const { sendReservationCreatedEmail, sendReservationConfirmedEmail, sendReservationCancelledEmail, sendTestEmail } = require('../utils/emailService');

// Get all reservations with optional filters
const getAllReservations = async (req, res) => {
  try {
    const { status, date, table_id } = req.query;
    let query = `
      SELECT r.*, rt.table_number, rt.capacity, rt.table_type
      FROM reservations r 
      LEFT JOIN restaurant_tables rt ON r.table_id = rt.id 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND r.status = $${paramCount}`;
      params.push(status);
    }

    if (date) {
      paramCount++;
      query += ` AND r.date = $${paramCount}`;
      params.push(date);
    }

    if (table_id) {
      paramCount++;
      query += ` AND r.table_id = $${paramCount}`;
      params.push(table_id);
    }

    query += ` ORDER BY r.date ASC, r.time ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
};

// Get reservation by ID
const getReservationById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT r.*, rt.table_number, rt.capacity, rt.table_type
      FROM reservations r 
      LEFT JOIN restaurant_tables rt ON r.table_id = rt.id 
      WHERE r.id = $1
    `;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    res.status(500).json({ error: 'Failed to fetch reservation' });
  }
};

// Get available tables for a given date, time, and guest count
const getAvailableTables = async (req, res) => {
  try {
    const { date, time, guests } = req.query;

    if (!date || !time || !guests) {
      return res.status(400).json({ error: 'Date, time, and guests are required' });
    }

    const query = `SELECT * FROM get_available_tables($1, $2, $3)`;
    const result = await pool.query(query, [date, time, guests]);

    res.json({
      available_tables: result.rows,
      total_available: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching available tables:', error);
    res.status(500).json({ error: 'Failed to fetch available tables' });
  }
};

// Get available time slots for a given date
const getAvailableTimeSlots = async (req, res) => {
  try {
    const { date, guests = 4 } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const query = `
      SELECT ts.time_slot, ts.max_reservations,
             COUNT(r.id) as current_reservations,
             (ts.max_reservations - COUNT(r.id)) as available_slots
      FROM reservation_time_slots ts
      LEFT JOIN reservations r ON ts.time_slot = r.time 
        AND r.date = $1 
        AND r.status NOT IN ('cancelled', 'no-show')
      WHERE ts.is_active = true
      GROUP BY ts.id, ts.time_slot, ts.max_reservations
      HAVING (ts.max_reservations - COUNT(r.id)) > 0
      ORDER BY ts.time_slot ASC
    `;
    
    const result = await pool.query(query, [date]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching available time slots:', error);
    res.status(500).json({ error: 'Failed to fetch available time slots' });
  }
};

// Create new reservation
const createReservation = async (req, res) => {
  try {
    const {
      customer_name,
      email,
      phone,
      table_id,
      date,
      time,
      guests,
      special_requests
    } = req.body;

    // Validate required fields
    if (!customer_name || !email || !date || !time || !guests) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // If table_id is not provided, find an available table
    let finalTableId = table_id;
    if (!finalTableId) {
      // Simple query to find available table
      const availableTablesQuery = `
        SELECT rt.id, rt.table_number, rt.capacity
        FROM restaurant_tables rt
        WHERE rt.is_active = true
          AND rt.capacity >= $1
          AND NOT EXISTS (
              SELECT 1 FROM reservations r
              WHERE r.table_id = rt.id
                AND r.date = $2
                AND r.time = $3
                AND r.status NOT IN ('cancelled', 'no-show')
          )
        ORDER BY rt.capacity ASC, rt.table_number ASC
        LIMIT 1
      `;
      const availableResult = await pool.query(availableTablesQuery, [guests, date, time]);
      
      if (availableResult.rows.length === 0) {
        return res.status(400).json({ error: 'No available tables for the selected date and time' });
      }
      
      finalTableId = availableResult.rows[0].id;
    } else {
      // Check table availability with simple query
      const availabilityQuery = `
        SELECT 
          rt.capacity >= $1 as can_accommodate,
          NOT EXISTS (
            SELECT 1 FROM reservations r
            WHERE r.table_id = $2
              AND r.date = $3
              AND r.time = $4
              AND r.status NOT IN ('cancelled', 'no-show')
          ) as is_available
        FROM restaurant_tables rt
        WHERE rt.id = $2 AND rt.is_active = true
      `;
      const availabilityResult = await pool.query(availabilityQuery, [guests, finalTableId, date, time]);
      
      if (availabilityResult.rows.length === 0 || 
          !availabilityResult.rows[0].can_accommodate || 
          !availabilityResult.rows[0].is_available) {
        return res.status(400).json({ error: 'Table not available for the selected date and time' });
      }
    }

    // Create reservation
    const query = `
      INSERT INTO reservations (customer_name, email, phone, table_id, date, time, guests, special_requests, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      customer_name, email, phone, finalTableId, date, time, guests, special_requests
    ]);

    const newReservation = result.rows[0];

    // Send email notification for new reservation
    try {
      await sendReservationCreatedEmail(newReservation);
    } catch (emailError) {
      console.error('Error sending reservation created email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      message: 'Reservation created successfully',
      reservation: newReservation
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ error: 'Failed to create reservation' });
  }
};

// Update reservation
const updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      customer_name,
      email,
      phone,
      table_id,
      date,
      time,
      guests,
      special_requests,
      status
    } = req.body;

    // Check if reservation exists
    const existingReservation = await pool.query('SELECT * FROM reservations WHERE id = $1', [id]);
    if (existingReservation.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    // If date, time, or table changed, check availability
    if (date || time || table_id) {
      const newDate = date || existingReservation.rows[0].date;
      const newTime = time || existingReservation.rows[0].time;
      const newTableId = table_id || existingReservation.rows[0].table_id;
      const newGuests = guests || existingReservation.rows[0].guests;

      const availabilityQuery = `
        SELECT check_table_availability($1, $2, $3, $4, $5)
      `;
      const availabilityResult = await pool.query(availabilityQuery, [newTableId, newDate, newTime, newGuests, id]);
      
      if (!availabilityResult.rows[0].check_table_availability) {
        return res.status(400).json({ error: 'Table not available for the selected date and time' });
      }
    }

    // Update reservation
    const query = `
      UPDATE reservations 
      SET customer_name = COALESCE($1, customer_name),
          email = COALESCE($2, email),
          phone = COALESCE($3, phone),
          table_id = COALESCE($4, table_id),
          date = COALESCE($5, date),
          time = COALESCE($6, time),
          guests = COALESCE($7, guests),
          special_requests = COALESCE($8, special_requests),
          status = COALESCE($9, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
    `;
    const values = [customer_name, email, phone, table_id, date, time, guests, special_requests, status, id];
    const result = await pool.query(query, values);

    res.json({
      message: 'Reservation updated successfully',
      reservation: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).json({ error: 'Failed to update reservation' });
  }
};

// Update reservation status
const updateReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const query = `
      UPDATE reservations 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const updatedReservation = result.rows[0];

    // Send email notification based on status change
            try {
          if (status === 'confirmed') {
            await sendReservationConfirmedEmail(updatedReservation);
          } else if (status === 'cancelled') {
            await sendReservationCancelledEmail(updatedReservation);
          }
        } catch (emailError) {
          console.error('Error sending status update email:', emailError);
          // Don't fail the request if email fails
        }

    res.json({
      message: 'Reservation status updated successfully',
      reservation: updatedReservation
    });
  } catch (error) {
    console.error('Error updating reservation status:', error);
    res.status(500).json({ error: 'Failed to update reservation status' });
  }
};

// Delete reservation
const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'DELETE FROM reservations WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    res.json({
      message: 'Reservation deleted successfully',
      reservation: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({ error: 'Failed to delete reservation' });
  }
};

// Check table availability
const checkAvailability = async (req, res) => {
  try {
    const { table_id, date, time, guests } = req.query;

    if (!table_id || !date || !time || !guests) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const query = `SELECT check_table_availability($1, $2, $3, $4)`;
    const result = await pool.query(query, [table_id, date, time, guests]);

    res.json({
      available: result.rows[0].check_table_availability
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ error: 'Failed to check availability' });
  }
};



// Get reservation statistics
const getReservationStats = async (req, res) => {
  try {
    const { date } = req.query;
    let dateFilter = '';
    let params = [];

    if (date) {
      dateFilter = 'WHERE date = $1';
      params.push(date);
    }

    const query = `
      SELECT 
        COUNT(*) as total_reservations,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_reservations,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_reservations,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_reservations,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_reservations,
        SUM(guests) as total_guests
      FROM reservations
      ${dateFilter}
    `;

    const result = await pool.query(query, params);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching reservation stats:', error);
    res.status(500).json({ error: 'Failed to fetch reservation statistics' });
  }
};



module.exports = {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservation,
  updateReservationStatus,
  deleteReservation,
  checkAvailability,
  getReservationStats,
  getAvailableTables,
  getAvailableTimeSlots
}; 