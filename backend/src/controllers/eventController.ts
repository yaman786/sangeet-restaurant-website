import { Request, Response, NextFunction } from 'express';
import eventService from '../services/eventService';

export const getAllEvents = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const events = await eventService.getAllEvents(); res.json(events); } catch (error) { next(error); }
};
export const getFeaturedEvents = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const events = await eventService.getFeaturedEvents(); res.json(events); } catch (error) { next(error); }
};
export const getUpcomingEvents = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const events = await eventService.getUpcomingEvents(); res.json(events); } catch (error) { next(error); }
};
export const getEventById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const event = await eventService.getEventById(req.params.id); res.json(event); } catch (error) { next(error); }
};
export const createEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const event = await eventService.createEvent(req.body); res.status(201).json({ message: 'Event created successfully', event }); } catch (error) { next(error); }
};
export const updateEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const event = await eventService.updateEvent(req.params.id, req.body); res.json({ message: 'Event updated successfully', event }); } catch (error) { next(error); }
};
export const deleteEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { await eventService.deleteEvent(req.params.id); res.json({ message: 'Event deleted successfully' }); } catch (error) { next(error); }
};
export const getEventsByDateRange = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const events = await eventService.getEventsByDateRange(req.query.start_date as string, req.query.end_date as string); res.json(events); } catch (error) { next(error); }
};
export const getEventStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const stats = await eventService.getEventStats(); res.json(stats); } catch (error) { next(error); }
};
