import { prisma } from '@/lib/db';
import { NotFoundError, ValidationError } from '@/lib/errors';
import type { EventRow, CreateEventDTO, UpdateEventDTO } from '@/lib/types';

class EventService {
  async getAllEvents(): Promise<any[]> {
    return prisma.events.findMany({
      orderBy: { date: 'asc' }
    });
  }

  async getFeaturedEvents(): Promise<any[]> {
    return prisma.events.findMany({
      where: { is_featured: true },
      orderBy: { date: 'asc' }
    });
  }

  async getUpcomingEvents(): Promise<any[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    return prisma.events.findMany({
      where: { date: { gte: today } },
      orderBy: { date: 'asc' }
    });
  }

  async getEventById(id: string): Promise<any> {
    const event = await prisma.events.findUnique({
      where: { id: parseInt(id, 10) }
    });
    if (!event) throw new NotFoundError('Event');
    return event;
  }

  async createEvent(data: CreateEventDTO): Promise<any> {
    const { title, description, date, image_url, is_featured } = data;
    return prisma.events.create({
      data: {
        title,
        description,
        date: new Date(date),
        image_url: image_url || null,
        is_featured: is_featured || false
      }
    });
  }

  async updateEvent(id: string, data: UpdateEventDTO): Promise<any> {
    const { title, description, date, image_url, is_featured } = data;
    try {
      return await prisma.events.update({
        where: { id: parseInt(id, 10) },
        data: {
          title,
          description: description || null,
          date: date ? new Date(date) : undefined,
          image_url: image_url || null,
          is_featured: is_featured || false
        }
      });
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundError('Event');
      throw e;
    }
  }

  async deleteEvent(id: string): Promise<any> {
    try {
      return await prisma.events.delete({
        where: { id: parseInt(id, 10) }
      });
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundError('Event');
      throw e;
    }
  }

  async getEventsByDateRange(start_date: string, end_date: string): Promise<any[]> {
    if (!start_date || !end_date) throw new ValidationError('Start date and end date are required');
    return prisma.events.findMany({
      where: {
        date: {
          gte: new Date(start_date),
          lte: new Date(end_date)
        }
      },
      orderBy: { date: 'asc' }
    });
  }

  async getEventStats(): Promise<Record<string, number>> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [total_events, featured_events, upcoming_events, past_events] = await prisma.$transaction([
      prisma.events.count(),
      prisma.events.count({ where: { is_featured: true } }),
      prisma.events.count({ where: { date: { gte: today } } }),
      prisma.events.count({ where: { date: { lt: today } } })
    ]);

    return {
      total_events,
      featured_events,
      upcoming_events,
      past_events
    };
  }
}

export default new EventService();
