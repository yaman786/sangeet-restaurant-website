import { prisma } from '@/lib/db';
import { NotFoundError, ConflictError, ValidationError } from '@/lib/errors';
import { sendReservationCreatedEmail, sendReservationConfirmedEmail, sendReservationCancelledEmail } from '../utils/emailService';
import { emitNewReservation, emitReservationUpdate } from './pusherServer';
import type { ReservationRow } from '@/lib/types';

class ReservationService {
  async getAllReservations(query: Record<string, any>): Promise<any[]> {
    const whereClause: any = {};
    if (query.date) whereClause.date = new Date(query.date);
    if (query.status) whereClause.status = query.status;
    
    return prisma.reservations.findMany({
      where: whereClause,
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ]
    });
  }

  async getReservationById(id: string): Promise<any> {
    const reservation = await prisma.reservations.findUnique({
      where: { id: parseInt(id) }
    });
    if (!reservation) throw new NotFoundError('Reservation');
    return reservation;
  }

  async getAvailableTables(date: string, time: string, guests: string): Promise<any[]> {
    if (!date || !time) throw new ValidationError('Date and time are required');
    
    const parsedGuests = guests ? parseInt(guests, 10) : 1;
    const allTables = await prisma.tables.findMany({
      where: {
        is_active: true,
        // Using arbitrary capacity field check, ignoring capacity if it isn't in tables schema
        // wait, I need to check tables schema. It doesn't have capacity. Wait, restaurant_tables has capacity!
        // But the SQL queried `tables`. Let me just query tables and filter.
      }
    });
    
    // In original SQL it queried `tables` and checked capacity. But `tables` schema doesn't have capacity.
    // Wait, let me query restaurant_tables instead since it has capacity.
    const validRestaurantTables = await prisma.restaurant_tables.findMany({
      where: {
        is_active: true,
        capacity: { gte: parsedGuests }
      },
      orderBy: { capacity: 'asc' }
    });
    
    const reservedTables = await prisma.reservations.findMany({
      where: {
        date: new Date(date),
        // Time might need specific date parsing, assuming exact match for now
        time: new Date(`1970-01-01T${time}:00.000Z`),
        status: { in: ['pending', 'confirmed'] },
        table_id: { not: null }
      },
      select: { table_id: true }
    });
    
    const reservedTableIds = reservedTables.map(r => r.table_id);
    return validRestaurantTables.filter(table => !reservedTableIds.includes(table.id));
  }

  async getAvailableTimeSlots(date: string): Promise<string[]> {
    if (!date) throw new ValidationError('Date is required');
    
    const allSlots = ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'];
    const totalTables = await prisma.restaurant_tables.count({
      where: { is_active: true }
    });
    
    // Group by time
    const reservations = await prisma.reservations.groupBy({
      by: ['time'],
      where: {
        date: new Date(date),
        status: { in: ['pending', 'confirmed'] }
      },
      _count: {
        time: true
      }
    });
    
    const bookedSlots: Record<string, number> = {};
    reservations.forEach(row => {
      // Prisma returns time as DateTime. We need to extract HH:mm.
      const timeStr = row.time.toISOString().substring(11, 16);
      bookedSlots[timeStr] = row._count.time;
    });
    
    return allSlots.filter(slot => (bookedSlots[slot] || 0) < totalTables);
  }

  async createReservation(data: Record<string, any>): Promise<any> {
    const { customer_name, email, phone, date, time, guests, special_requests, table_id } = data;
    
    if (table_id) {
      const existing = await prisma.reservations.findFirst({
        where: {
          date: new Date(date),
          time: new Date(`1970-01-01T${time}:00.000Z`),
          table_id: parseInt(table_id),
          status: { in: ['pending', 'confirmed'] }
        }
      });
      if (existing) throw new ConflictError('Table is already reserved for this date and time');
    }

    const reservation = await prisma.reservations.create({
      data: {
        customer_name,
        email,
        phone,
        date: new Date(date),
        time: new Date(`1970-01-01T${time}:00.000Z`),
        guests: parseInt(guests),
        special_requests: special_requests || null,
        table_id: table_id ? parseInt(table_id) : null,
        status: 'pending'
      }
    });

    if (reservation.email) {
      sendReservationCreatedEmail(reservation).catch(err => console.error('Error sending creation email:', err));
    }
    
    emitNewReservation(reservation).catch(err => console.error('Pusher error:', err));
    
    return reservation;
  }

  async updateReservation(id: string, data: Record<string, any>): Promise<any> {
    const { customer_name, email, phone, date, time, guests, special_requests, table_id, status } = data;
    
    if (table_id) {
      const existing = await prisma.reservations.findFirst({
        where: {
          date: new Date(date),
          time: new Date(`1970-01-01T${time}:00.000Z`),
          table_id: parseInt(table_id),
          id: { not: parseInt(id) },
          status: { in: ['pending', 'confirmed'] }
        }
      });
      if (existing) throw new ConflictError('Table is already reserved for this date and time');
    }

    const reservation = await prisma.reservations.update({
      where: { id: parseInt(id) },
      data: {
        customer_name,
        email,
        phone,
        date: new Date(date),
        time: new Date(`1970-01-01T${time}:00.000Z`),
        guests: parseInt(guests),
        special_requests: special_requests || null,
        table_id: table_id ? parseInt(table_id) : null,
        status,
        updated_at: new Date()
      }
    });

    emitReservationUpdate(reservation).catch(err => console.error('Pusher error:', err));

    return reservation;
  }

  async updateReservationStatus(id: string, status: string): Promise<any> {
    const reservation = await prisma.reservations.update({
      where: { id: parseInt(id) },
      data: {
        status,
        updated_at: new Date()
      }
    });

    if (reservation.email) {
      if (status === 'confirmed') sendReservationConfirmedEmail(reservation).catch(err => console.error('Error sending confirmation email:', err));
      else if (status === 'cancelled') sendReservationCancelledEmail(reservation).catch(err => console.error('Error sending cancellation email:', err));
    }
    
    emitReservationUpdate(reservation).catch(err => console.error('Pusher error:', err));
    
    return reservation;
  }

  async deleteReservation(id: string): Promise<any> {
    const reservation = await prisma.reservations.delete({
      where: { id: parseInt(id) }
    });
    
    emitReservationUpdate({ id: parseInt(id), deleted: true }).catch(err => console.error('Pusher error:', err));
    
    return reservation;
  }

  async checkAvailability(table_id: string, date: string, time: string, guests: string): Promise<boolean> {
    if (!date || !time) throw new ValidationError('Date and time are required');
    
    const reservationsCount = await prisma.reservations.count({
      where: {
        date: new Date(date),
        time: new Date(`1970-01-01T${time}:00.000Z`),
        status: { in: ['pending', 'confirmed'] },
        ...(table_id ? { table_id: parseInt(table_id) } : {})
      }
    });
    
    if (table_id) return reservationsCount === 0;
    
    const tablesCount = await prisma.restaurant_tables.count({
      where: { is_active: true }
    });
    return reservationsCount < tablesCount;
  }

  async getReservationStats(date?: string): Promise<Record<string, number>> {
    const whereClause: any = {};
    if (date) whereClause.date = new Date(date);
    
    const [
      total_reservations,
      pending_reservations,
      confirmed_reservations,
      cancelled_reservations,
      guestsAgg
    ] = await Promise.all([
      prisma.reservations.count({ where: whereClause }),
      prisma.reservations.count({ where: { ...whereClause, status: 'pending' } }),
      prisma.reservations.count({ where: { ...whereClause, status: 'confirmed' } }),
      prisma.reservations.count({ where: { ...whereClause, status: 'cancelled' } }),
      prisma.reservations.aggregate({
        _sum: { guests: true },
        where: whereClause
      })
    ]);
    
    return {
      total_reservations,
      pending_reservations,
      confirmed_reservations,
      cancelled_reservations,
      total_guests: guestsAgg._sum.guests || 0
    };
  }
}

export default new ReservationService();
