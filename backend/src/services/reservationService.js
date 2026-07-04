const pool = require('../config/database');
const { NotFoundError, ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');
const {
  sendReservationCreatedEmail,
  sendReservationConfirmedEmail,
  sendReservationCancelledEmail
} = require('../utils/emailService');

class ReservationService {
  async getAllReservations(filters = {}) {
    const { status, date, table_id, history, startDate, endDate } = filters;
    let query = `
      SELECT r.*, rt.table_number, rt.capacity, rt.table_type
      FROM reservations r 
      LEFT JOIN tables rt ON r.table_id = rt.id 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (history === 'true') {
      query += ` AND r.is_archived = true`;
    } else {
      query += ` AND r.is_archived = false`;
    }

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

    if (startDate && endDate) {
      paramCount++;
      query += ` AND r.date >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
      query += ` AND r.date <= $${paramCount}`;
      params.push(endDate);
    }

    query += ` ORDER BY r.date ASC, r.time ASC`;

    const result = await pool.query(query, params);
    return result.rows;
  }

  async getReservationById(id) {
    const query = `
      SELECT r.*, rt.table_number, rt.capacity, rt.table_type
      FROM reservations r 
      LEFT JOIN tables rt ON r.table_id = rt.id 
      WHERE r.id = $1
    `;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) throw new NotFoundError('Reservation');
    return result.rows[0];
  }

  async getAvailableTables(date, time, guests) {
    if (!date || !time || !guests) {
      throw new ValidationError('Date, time, and guests are required');
    }

    const query = `
      SELECT rt.id, rt.table_number, rt.capacity, rt.table_type
      FROM tables rt
      WHERE rt.is_active = true
        AND rt.capacity >= $3
        AND NOT EXISTS (
            SELECT 1 FROM reservations r
            WHERE r.table_id = rt.id
              AND r.date = $1
              AND r.time = $2
              AND r.status NOT IN ('cancelled', 'no-show')
        )
      ORDER BY rt.capacity ASC, rt.table_number ASC
    `;
    const result = await pool.query(query, [date, time, guests]);
    return {
      available_tables: result.rows,
      total_available: result.rows.length
    };
  }

  async getAvailableTimeSlots(date) {
    if (!date) throw new ValidationError('Date is required');

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
    return result.rows;
  }

  async createReservation(data) {
    const { customer_name, email, phone, table_id, date, time, guests, special_requests } = data;

    if (!customer_name || !email || !date || !time || !guests) {
      throw new ValidationError('Missing required fields');
    }

    let finalTableId = table_id;
    if (!finalTableId) {
      const availableTablesQuery = `
        SELECT rt.id, rt.table_number, rt.capacity
        FROM tables rt
        WHERE rt.is_active = true
          AND rt.capacity >= $1
          AND NOT EXISTS (
              SELECT 1 FROM reservations r
              WHERE r.table_id = rt.id
                AND r.date = $2
                AND r.status NOT IN ('cancelled', 'no-show')
                AND r.time::time < ($3::time + interval '2 hours')
                AND ($3::time < r.time::time + interval '2 hours')
          )
        ORDER BY rt.capacity ASC, rt.table_number ASC
        LIMIT 1
      `;
      const availableResult = await pool.query(availableTablesQuery, [guests, date, time]);
      
      if (availableResult.rows.length === 0) {
        throw new ValidationError('No available tables for the selected date and time');
      }
      finalTableId = availableResult.rows[0].id;
    } else {
      const availabilityQuery = `
        SELECT 
          rt.capacity >= $1 as can_accommodate,
          NOT EXISTS (
            SELECT 1 FROM reservations r
            WHERE r.table_id = $2
              AND r.date = $3
              AND r.status NOT IN ('cancelled', 'no-show')
              AND r.time::time < ($4::time + interval '2 hours')
              AND ($4::time < r.time::time + interval '2 hours')
          ) as is_available
        FROM tables rt
        WHERE rt.id = $2 AND rt.is_active = true
      `;
      const availabilityResult = await pool.query(availabilityQuery, [guests, finalTableId, date, time]);
      
      if (availabilityResult.rows.length === 0 || 
          !availabilityResult.rows[0].can_accommodate || 
          !availabilityResult.rows[0].is_available) {
        throw new ValidationError('Table not available for the selected date and time');
      }
    }

    const query = `
      INSERT INTO reservations (customer_name, email, phone, table_id, date, time, guests, special_requests, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      customer_name, email, phone, finalTableId, date, time, guests, special_requests
    ]);

    const newReservation = result.rows[0];

    sendReservationCreatedEmail(newReservation).catch(emailError => {
      logger.error('Error sending reservation created email:', emailError);
    });

    return newReservation;
  }

  async updateReservation(id, data) {
    const { customer_name, email, phone, table_id, date, time, guests, special_requests, status } = data;

    const existingReservation = await pool.query('SELECT * FROM reservations WHERE id = $1', [id]);
    if (existingReservation.rows.length === 0) {
      throw new NotFoundError('Reservation');
    }

    if (date || time || table_id) {
      const newDate = date || existingReservation.rows[0].date;
      const newTime = time || existingReservation.rows[0].time;
      const newTableId = table_id || existingReservation.rows[0].table_id;
      const newGuests = guests || existingReservation.rows[0].guests;

      const availabilityQuery = `
        SELECT 
          (SELECT capacity FROM tables WHERE id = $1) >= $4 as can_accommodate,
          NOT EXISTS (
            SELECT 1 FROM reservations r
            WHERE r.table_id = $1
              AND r.date = $2
              AND r.id != $5
              AND r.status NOT IN ('cancelled', 'no-show')
              AND r.time::time < ($3::time + interval '2 hours')
              AND ($3::time < r.time::time + interval '2 hours')
        ) as check_table_availability
      `;
      const availabilityResult = await pool.query(availabilityQuery, [newTableId, newDate, newTime, newGuests, id]);
      
      if (!availabilityResult.rows[0].can_accommodate) {
        throw new ValidationError('Table capacity is too small for the requested number of guests');
      }
      if (!availabilityResult.rows[0].check_table_availability) {
        throw new ValidationError('Table not available for the selected date and time');
      }
    }

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

    return result.rows[0];
  }

  async updateReservationStatus(id, status) {
    if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      throw new ValidationError('Invalid status');
    }

    const query = `
      UPDATE reservations 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);

    if (result.rows.length === 0) {
      throw new NotFoundError('Reservation');
    }

    const updatedReservation = result.rows[0];

    if (status === 'confirmed') {
      sendReservationConfirmedEmail(updatedReservation).catch(e => logger.error(e));
    } else if (status === 'cancelled') {
      sendReservationCancelledEmail(updatedReservation).catch(e => logger.error(e));
    }

    return updatedReservation;
  }

  async deleteReservation(id) {
    const query = 'DELETE FROM reservations WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundError('Reservation');
    }

    return result.rows[0];
  }

  async checkAvailability(table_id, date, time, guests) {
    if (!table_id || !date || !time || !guests) {
      throw new ValidationError('Missing required parameters');
    }

    const query = `
      SELECT NOT EXISTS (
        SELECT 1 FROM reservations r
        WHERE r.table_id = $1
          AND r.date = $2
          AND r.time = $3
          AND r.status NOT IN ('cancelled', 'no-show')
      ) as check_table_availability
    `;
    const result = await pool.query(query, [table_id, date, time]);

    return result.rows[0].check_table_availability;
  }

  async getReservationStats(date) {
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
    return result.rows[0];
  }
}

module.exports = new ReservationService();
