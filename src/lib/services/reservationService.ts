import { prisma } from '@/lib/db';
import { NotFoundError, ConflictError, ValidationError } from '@/lib/errors';
import { sendReservationCreatedEmail, sendReservationConfirmedEmail, sendReservationCancelledEmail } from '../utils/emailService';
import { emitNewReservation, emitReservationUpdate } from './pusherServer';
import { parseRestaurantTime } from '../utils/timeUtils';
import type { ReservationRow } from '@/lib/types';
import { CreateReservationDTO, UpdateReservationDTO, ReservationQueryDTO, CreateTimeSlotDTO, UpdateTimeSlotDTO } from '../types/dtos';

class ReservationService {
  async getAllReservations(query: ReservationQueryDTO): Promise<any[]> {
    const whereClause: any = {};
    if (query.date) whereClause.date = new Date(query.date);
    if (query.status) whereClause.status = query.status;
    
    if (query.archived === 'true') {
      whereClause.is_archived = true;
    } else if (query.archived === 'false') {
      whereClause.is_archived = false;
    } else {
      whereClause.is_archived = false; // By default, only show non-archived
    }
    
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
        time: parseRestaurantTime(date, time).toDate(),
        status: { in: ['pending', 'confirmed'] },
        table_id: { not: null }
      },
      select: { table_id: true }
    });
    
    const reservedTableIds = reservedTables.map(r => r.table_id);
    return validRestaurantTables.filter(table => !reservedTableIds.includes(table.id));
  }

  // Admin Timeslot Management Methods
  async getAllTimeSlots(): Promise<any[]> {
    const slots = await prisma.reservation_time_slots.findMany({
      orderBy: { time_slot: 'asc' }
    });
    return slots.map(slot => ({
      id: slot.id,
      time_slot: slot.time_slot.toISOString().substring(11, 16),
      is_active: slot.is_active,
      max_reservations: slot.max_reservations,
      created_at: slot.created_at
    }));
  }

  async createTimeSlot(data: CreateTimeSlotDTO): Promise<any> {
    const { time_slot, is_active, max_reservations } = data;
    // Store dummy date since it's just a Time column
    const dummyDate = new Date(`1970-01-01T${time_slot}:00.000Z`);
    return prisma.reservation_time_slots.create({
      data: {
        time_slot: dummyDate,
        is_active: is_active ?? true,
        max_reservations: max_reservations ?? 10
      }
    });
  }

  async updateTimeSlot(id: string, data: UpdateTimeSlotDTO): Promise<any> {
    const { time_slot, is_active, max_reservations } = data;
    const updateData: any = {};
    
    if (time_slot !== undefined) {
      updateData.time_slot = new Date(`1970-01-01T${time_slot}:00.000Z`);
    }
    if (is_active !== undefined) updateData.is_active = is_active;
    if (max_reservations !== undefined) updateData.max_reservations = max_reservations;

    return prisma.reservation_time_slots.update({
      where: { id: parseInt(id, 10) },
      data: updateData
    });
  }

  async deleteTimeSlot(id: string): Promise<void> {
    await prisma.reservation_time_slots.delete({
      where: { id: parseInt(id, 10) }
    });
  }

  async getAvailableTimeSlots(date: string): Promise<string[]> {
    if (!date) throw new ValidationError('Date is required');
    
    // Fetch active slots from the database
    const dbSlots = await prisma.reservation_time_slots.findMany({
      where: { is_active: true },
      orderBy: { time_slot: 'asc' }
    });
    const allSlots = dbSlots.map(slot => slot.time_slot.toISOString().substring(11, 16));
    const slotCapacities = Object.fromEntries(
      dbSlots.map(slot => [slot.time_slot.toISOString().substring(11, 16), slot.max_reservations || 10])
    );
    
    // Group by time for the specific date
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
      const timeStr = row.time.toISOString().substring(11, 16);
      bookedSlots[timeStr] = row._count.time;
    });
    
    // Check against individual slot capacities instead of total tables
    return allSlots.filter(slot => (bookedSlots[slot] || 0) < slotCapacities[slot]);
  }

  async createReservation(data: CreateReservationDTO): Promise<any> {
    const { customer_name, email, phone, date, time, guests, special_requests, table_id } = data;
    
    // Wrap the availability check and insertion in an atomic transaction to prevent race conditions
    const reservation = await prisma.$transaction(async (tx) => {
      if (table_id) {
        const existing = await tx.reservations.findFirst({
          where: {
            date: new Date(date),
            time: parseRestaurantTime(date as any, time as any).toDate(),
            table_id: Number(table_id),
            status: { in: ['pending', 'confirmed'] }
          }
        });
        if (existing) throw new ConflictError('Table is already reserved for this date and time');
      }

      return await tx.reservations.create({
        data: {
          customer_name,
          email,
          phone,
          date: new Date(date),
          time: parseRestaurantTime(date as any, time as any).toDate(),
          guests: Number(guests),
          special_requests: special_requests || null,
          table_id: table_id ? Number(table_id) : null,
          status: 'pending'
        }
      });
    });

    if (reservation.email) {
      sendReservationCreatedEmail(reservation as any).catch(err => console.error('Error sending creation email:', err));
    }
    
    emitNewReservation(reservation).catch(err => console.error('Pusher error:', err));
    
    return reservation;
  }

  async updateReservation(id: string, data: UpdateReservationDTO): Promise<any> {
    const { customer_name, email, phone, date, time, guests, special_requests, table_id, status } = data;
    
    // Wrap the availability check and update in an atomic transaction to prevent race conditions
    const reservation = await prisma.$transaction(async (tx) => {
      if (table_id) {
        const existing = await tx.reservations.findFirst({
          where: {
            date: date ? new Date(date) : undefined,
            time: date && time ? parseRestaurantTime(date as any, time as any).toDate() : undefined,
            table_id: Number(table_id),
            id: { not: Number(id) },
            status: { in: ['pending', 'confirmed'] }
          }
        });
        if (existing) throw new ConflictError('Table is already reserved for this date and time');
      }

      return await tx.reservations.update({
        where: { id: parseInt(id) },
        data: {
          customer_name,
          email,
          phone,
          date: date ? new Date(date) : undefined,
          time: date && time ? parseRestaurantTime(date as any, time as any).toDate() : undefined,
          guests: guests ? Number(guests) : undefined,
          special_requests: special_requests || null,
          table_id: table_id ? Number(table_id) : null,
          status,
          updated_at: new Date()
        }
      });
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
      if (status === 'confirmed') sendReservationConfirmedEmail(reservation as any).catch(err => console.error('Error sending confirmation email:', err));
      else if (status === 'cancelled') sendReservationCancelledEmail(reservation as any).catch(err => console.error('Error sending cancellation email:', err));
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
        time: parseRestaurantTime(date, time).toDate(),
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
  async getReservationsByDate(date: string): Promise<any[]> {
    return prisma.reservations.findMany({
      where: {
        date: new Date(date)
      },
      orderBy: { time: 'asc' }
    });
  }
}

export default new ReservationService();
