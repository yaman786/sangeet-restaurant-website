import pool from '../config/database';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';
import { sendReservationCreatedEmail, sendReservationConfirmedEmail, sendReservationCancelledEmail } from '../utils/emailService';
import type { ReservationRow } from '../types';

class ReservationService {
  async getAllReservations(query: Record<string, any>): Promise<ReservationRow[]> {
    let sql = 'SELECT * FROM reservations WHERE 1=1';
    const params: any[] = [];
    let paramIdx = 1;

    if (query.date) { sql += ` AND date = $${paramIdx++}`; params.push(query.date); }
    if (query.status) { sql += ` AND status = $${paramIdx++}`; params.push(query.status); }
    if (query.archived === 'true') { sql += ` AND is_archived = true`; }
    else if (query.archived === 'false') { sql += ` AND is_archived = false`; }

    sql += ' ORDER BY date ASC, time ASC';
    const result = await pool.query(sql, params);
    return result.rows;
  }

  async getReservationById(id: string): Promise<ReservationRow> {
    const result = await pool.query('SELECT * FROM reservations WHERE id = $1', [id]);
    if (result.rows.length === 0) throw new NotFoundError('Reservation');
    return result.rows[0];
  }

  async getAvailableTables(date: string, time: string, guests: string): Promise<any[]> {
    if (!date || !time) throw new ValidationError('Date and time are required');
    
    const parsedGuests = guests ? parseInt(guests, 10) : 1;
    const allTablesResult = await pool.query('SELECT * FROM tables WHERE is_active = true AND capacity >= $1 ORDER BY capacity ASC', [parsedGuests]);
    
    const reservedTablesResult = await pool.query(
      `SELECT table_id FROM reservations 
       WHERE date = $1 AND time = $2 AND status IN ('pending', 'confirmed') AND table_id IS NOT NULL`,
      [date, time]
    );
    
    const reservedTableIds = reservedTablesResult.rows.map(r => r.table_id);
    return allTablesResult.rows.filter(table => !reservedTableIds.includes(table.id));
  }

  async getAvailableTimeSlots(date: string): Promise<string[]> {
    if (!date) throw new ValidationError('Date is required');
    
    const allSlots = ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'];
    const tablesResult = await pool.query('SELECT COUNT(*) FROM tables WHERE is_active = true');
    const totalTables = parseInt(tablesResult.rows[0].count, 10);
    
    const reservationsResult = await pool.query(
      `SELECT time, COUNT(*) as count FROM reservations 
       WHERE date = $1 AND status IN ('pending', 'confirmed') 
       GROUP BY time`,
      [date]
    );
    
    const bookedSlots: Record<string, number> = {};
    reservationsResult.rows.forEach(row => { bookedSlots[row.time] = parseInt(row.count, 10); });
    
    return allSlots.filter(slot => (bookedSlots[slot] || 0) < totalTables);
  }

  async createReservation(data: Record<string, any>): Promise<ReservationRow> {
    const { customer_name, email, phone, date, time, guests, special_requests, table_id } = data;
    
    if (table_id) {
      const existingReservation = await pool.query(
        `SELECT id FROM reservations 
         WHERE date = $1 AND time = $2 AND table_id = $3 AND status IN ('pending', 'confirmed')`,
        [date, time, table_id]
      );
      if (existingReservation.rows.length > 0) throw new ConflictError('Table is already reserved for this date and time');
    }

    const result = await pool.query(
      `INSERT INTO reservations (customer_name, email, phone, date, time, guests, special_requests, table_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [customer_name, email, phone, date, time, guests, special_requests || null, table_id || null, 'pending']
    );

    const reservation = result.rows[0];
    if (reservation.email) {
      sendReservationCreatedEmail(reservation).catch(err => console.error('Error sending creation email:', err));
    }
    return reservation;
  }

  async updateReservation(id: string, data: Record<string, any>): Promise<ReservationRow> {
    const { customer_name, email, phone, date, time, guests, special_requests, table_id, status } = data;
    
    if (table_id) {
      const existingReservation = await pool.query(
        `SELECT id FROM reservations 
         WHERE date = $1 AND time = $2 AND table_id = $3 AND id != $4 AND status IN ('pending', 'confirmed')`,
        [date, time, table_id, id]
      );
      if (existingReservation.rows.length > 0) throw new ConflictError('Table is already reserved for this date and time');
    }

    const result = await pool.query(
      `UPDATE reservations 
       SET customer_name = $1, email = $2, phone = $3, date = $4, time = $5, guests = $6, special_requests = $7, table_id = $8, status = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 RETURNING *`,
      [customer_name, email, phone, date, time, guests, special_requests || null, table_id || null, status, id]
    );

    if (result.rows.length === 0) throw new NotFoundError('Reservation');
    return result.rows[0];
  }

  async updateReservationStatus(id: string, status: string): Promise<ReservationRow> {
    const result = await pool.query(
      'UPDATE reservations SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) throw new NotFoundError('Reservation');

    const reservation = result.rows[0];
    if (reservation.email) {
      if (status === 'confirmed') sendReservationConfirmedEmail(reservation).catch(err => console.error('Error sending confirmation email:', err));
      else if (status === 'cancelled') sendReservationCancelledEmail(reservation).catch(err => console.error('Error sending cancellation email:', err));
    }
    
    return reservation;
  }

  async deleteReservation(id: string): Promise<ReservationRow> {
    const result = await pool.query('DELETE FROM reservations WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) throw new NotFoundError('Reservation');
    return result.rows[0];
  }

  async checkAvailability(table_id: string, date: string, time: string, guests: string): Promise<boolean> {
    if (!date || !time) throw new ValidationError('Date and time are required');
    
    let sql = "SELECT COUNT(*) FROM reservations WHERE date = $1 AND time = $2 AND status IN ('pending', 'confirmed')";
    const params: any[] = [date, time];
    
    if (table_id) { sql += ' AND table_id = $3'; params.push(table_id); }
    
    const result = await pool.query(sql, params);
    
    if (table_id) return parseInt(result.rows[0].count, 10) === 0;
    
    const tablesResult = await pool.query('SELECT COUNT(*) FROM tables WHERE is_active = true');
    return parseInt(result.rows[0].count, 10) < parseInt(tablesResult.rows[0].count, 10);
  }

  async getReservationStats(date?: string): Promise<Record<string, number>> {
    let sql = `
      SELECT 
        COUNT(*) as total_reservations,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_reservations,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_reservations,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_reservations,
        SUM(guests) as total_guests
      FROM reservations
    `;
    const params: any[] = [];
    if (date) { sql += ' WHERE date = $1'; params.push(date); }
    
    const result = await pool.query(sql, params);
    
    return {
      total_reservations: parseInt(result.rows[0].total_reservations || '0', 10),
      pending_reservations: parseInt(result.rows[0].pending_reservations || '0', 10),
      confirmed_reservations: parseInt(result.rows[0].confirmed_reservations || '0', 10),
      cancelled_reservations: parseInt(result.rows[0].cancelled_reservations || '0', 10),
      total_guests: parseInt(result.rows[0].total_guests || '0', 10)
    };
  }
}

export default new ReservationService();
