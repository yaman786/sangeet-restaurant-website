import { prisma } from '@/lib/db';
import { NotFoundError, ConflictError, ValidationError } from '@/lib/errors';
import { sendReservationCreatedEmail, sendReservationConfirmedEmail, sendReservationCancelledEmail } from '../utils/emailService';
import { emitNewReservation, emitReservationUpdate } from './pusherServer';
import { parseRestaurantTime } from '../utils/timeUtils';
import { CreateReservationDTO, UpdateReservationDTO, ReservationQueryDTO, CreateTimeSlotDTO, UpdateTimeSlotDTO } from '../types/dtos';

function calculateDiningDuration(guests: number): number {
  if (guests <= 4) return 90 * 60 * 1000;
  if (guests <= 8) return 120 * 60 * 1000;
  return 150 * 60 * 1000;
}

class ReservationService {
  async sweepOverdueReservations(): Promise<number> {
    try {
      const now = new Date();
      const fortyFiveMinsAgo = new Date(now.getTime() - 45 * 60000);
      
      const activeReservations = await prisma.reservations.findMany({
        where: {
          status: { in: ['pending', 'confirmed'] },
          is_archived: false
        },
        select: { id: true, date: true, time: true }
      });

      const noShowIds: number[] = [];
      for (const res of activeReservations) {
        if (!res.date || !res.time) continue;
        const dateStr = new Date(res.date).toISOString().split('T')[0];
        const timeObj = new Date(res.time);
        const hours = String(timeObj.getUTCHours()).padStart(2, '0');
        const mins = String(timeObj.getUTCMinutes()).padStart(2, '0');
        const scheduledAt = new Date(`${dateStr}T${hours}:${mins}:00.000Z`);

        if (scheduledAt < fortyFiveMinsAgo) {
          noShowIds.push(res.id);
        }
      }

      if (noShowIds.length > 0) {
        await prisma.reservations.updateMany({
          where: { id: { in: noShowIds } },
          data: {
            status: 'no-show',
            is_archived: true,
            updated_at: new Date()
          }
        });

        for (const id of noShowIds) {
          await emitReservationUpdate({ id, status: 'no-show' });
        }
      }
      return noShowIds.length;
    } catch (error) {
      console.error('Error in sweepOverdueReservations:', error);
      return 0;
    }
  }

  async getAllReservations(query: ReservationQueryDTO): Promise<any[]> {
    await this.sweepOverdueReservations();
    const whereClause: any = {};
    if (query.startDate || query.endDate) {
      whereClause.date = {};
      if (query.startDate) whereClause.date.gte = new Date(query.startDate);
      if (query.endDate) whereClause.date.lte = new Date(query.endDate);
    }
    if (query.date) whereClause.date = new Date(query.date); // overrides if exact date is given
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
    const durationMs = calculateDiningDuration(parsedGuests);
    const requestedTime = parseRestaurantTime(date, time).toDate();

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
        time: {
          gt: new Date(requestedTime.getTime() - durationMs),
          lt: new Date(requestedTime.getTime() + durationMs)
        },
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

  async getAvailableTimeSlots(date: string, guests: number = 2): Promise<string[]> {
    if (!date) throw new ValidationError('Date is required');
    
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    if (date < todayStr) {
      return []; // Past dates have no available slots
    }
    const isToday = date === todayStr;
    const cutoffTime = new Date(now.getTime() + 30 * 60 * 1000); // 30-minute rolling cutoff buffer

    // Fetch active slots from the database
    const dbSlots = await prisma.reservation_time_slots.findMany({
      where: { is_active: true },
      orderBy: { time_slot: 'asc' }
    });
    const allSlots = dbSlots.map(slot => slot.time_slot.toISOString().substring(11, 16));
    const slotCapacities = Object.fromEntries(
      dbSlots.map(slot => [slot.time_slot.toISOString().substring(11, 16), slot.max_reservations || 10])
    );
    
    // Fetch all active reservations for the day
    const reservations = await prisma.reservations.findMany({
      where: {
        date: new Date(date),
        status: { in: ['pending', 'confirmed'] }
      },
      select: { time: true, guests: true }
    });
    
    const bookedGuestsPerSlot: Record<string, number> = {};
    const requestedDuration = calculateDiningDuration(guests);
    
    allSlots.forEach(slotStr => {
      const slotDate = parseRestaurantTime(date, slotStr).toDate();
      let overlappingGuests = 0;
      
      reservations.forEach(res => {
        const resDuration = calculateDiningDuration(res.guests);
        
        // If the existing reservation overlaps with this slot's time window
        if (res.time.getTime() < slotDate.getTime() + requestedDuration &&
            res.time.getTime() + resDuration > slotDate.getTime()) {
          overlappingGuests += res.guests;
        }
      });
      
      bookedGuestsPerSlot[slotStr] = overlappingGuests;
    });
    
    // Return slots where overlapping guests + new party guests are within physical limit AND after cutoff time
    return allSlots.filter(slot => {
      if (isToday) {
        const slotDate = parseRestaurantTime(date, slot).toDate();
        if (slotDate <= cutoffTime) {
          return false;
        }
      }
      const currentBooked = bookedGuestsPerSlot[slot] || 0;
      return currentBooked + guests <= slotCapacities[slot];
    });
  }

  async createReservation(data: CreateReservationDTO): Promise<any> {
    const { customer_name, email, phone, date, time, guests, special_requests, table_id } = data;
    const parsedGuests = Number(guests);
    const durationMs = calculateDiningDuration(parsedGuests);
    const requestedTime = parseRestaurantTime(date as any, time as any).toDate();
    
    // Wrap the availability check and insertion in an atomic transaction to prevent race conditions
    const reservation = await prisma.$transaction(async (tx) => {
      if (table_id) {
        const existing = await tx.reservations.findFirst({
          where: {
            date: new Date(date),
            time: {
              gt: new Date(requestedTime.getTime() - durationMs),
              lt: new Date(requestedTime.getTime() + durationMs)
            },
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
          time: requestedTime,
          guests: parsedGuests,
          special_requests: special_requests || null,
          table_id: table_id ? Number(table_id) : null,
          status: 'pending'
        }
      });
    });

    let emailFailed = false;
    if (reservation.email) {
      try {
        await sendReservationCreatedEmail(reservation as any);
      } catch (err) {
        console.error('Error sending creation email:', err);
        emailFailed = true;
      }
    }
    
    if (emailFailed) {
      const warning = '[SYSTEM WARNING: Confirmation email failed to send. Please call customer.]';
      const newRequests = reservation.special_requests 
        ? `${reservation.special_requests}\n\n${warning}`
        : warning;
        
      // Ensure we update the local variable since it was defined as const
      const updatedReservation = await prisma.reservations.update({
        where: { id: reservation.id },
        data: { special_requests: newRequests }
      });
      // assign the updated one so Pusher gets it
      Object.assign(reservation, updatedReservation);
    }
    
    emitNewReservation(reservation).catch(err => console.error('Pusher error:', err));
    
    return reservation;
  }

  async updateReservation(id: string, data: UpdateReservationDTO): Promise<any> {
    const { customer_name, email, phone, date, time, guests, special_requests, table_id, status } = data;
    
    // Wrap the availability check and update in an atomic transaction to prevent race conditions
    const reservation = await prisma.$transaction(async (tx) => {
      const existingRes = await tx.reservations.findUnique({ where: { id: parseInt(id) } });
      if (!existingRes) throw new NotFoundError('Reservation');

      const targetDate = date ? new Date(date) : existingRes.date;
      
      let requestedTime = existingRes.time;
      if (date && time) {
        requestedTime = parseRestaurantTime(date as any, time as any).toDate();
      } else if (time && !date) {
         requestedTime = parseRestaurantTime(targetDate.toISOString().split('T')[0] as any, time as any).toDate();
      }

      const targetGuests = guests !== undefined ? Number(guests) : existingRes.guests;
      const durationMs = calculateDiningDuration(targetGuests);
      const targetTableId = table_id !== undefined ? (table_id ? Number(table_id) : null) : existingRes.table_id;

      if (targetTableId) {
        const existing = await tx.reservations.findFirst({
          where: {
            date: targetDate,
            time: {
              gt: new Date(requestedTime.getTime() - durationMs),
              lt: new Date(requestedTime.getTime() + durationMs)
            },
            table_id: targetTableId,
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
          date: targetDate,
          time: requestedTime,
          guests: targetGuests,
          special_requests: special_requests !== undefined ? special_requests : existingRes.special_requests,
          table_id: targetTableId,
          status: status || existingRes.status,
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

    let emailFailed = false;
    if (reservation.email) {
      try {
        if (status === 'confirmed') await sendReservationConfirmedEmail(reservation as any);
        else if (status === 'cancelled') await sendReservationCancelledEmail(reservation as any);
      } catch (err) {
        console.error(`Error sending ${status} email:`, err);
        emailFailed = true;
      }
    }
    
    if (emailFailed) {
      const warning = `[SYSTEM WARNING: ${status === 'confirmed' ? 'Confirmation' : 'Cancellation'} email failed to send. Please call customer.]`;
      const newRequests = reservation.special_requests 
        ? `${reservation.special_requests}\n\n${warning}`
        : warning;
        
      const updatedReservation = await prisma.reservations.update({
        where: { id: reservation.id },
        data: { special_requests: newRequests }
      });
      Object.assign(reservation, updatedReservation);
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
    
    const parsedGuests = guests ? parseInt(guests, 10) : 1;
    const durationMs = calculateDiningDuration(parsedGuests);
    const requestedTime = parseRestaurantTime(date, time).toDate();

    const reservationsCount = await prisma.reservations.count({
      where: {
        date: new Date(date),
        time: {
          gt: new Date(requestedTime.getTime() - durationMs),
          lt: new Date(requestedTime.getTime() + durationMs)
        },
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
    await this.sweepOverdueReservations();
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
    await this.sweepOverdueReservations();
    return prisma.reservations.findMany({
      where: {
        date: new Date(date),
        is_archived: false
      },
      orderBy: { time: 'asc' }
    });
  }
}

export default new ReservationService();
