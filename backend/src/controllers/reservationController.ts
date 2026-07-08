import { Request, Response, NextFunction } from 'express';
import reservationService from '../services/reservationService';

export const getAllReservations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const reservations = await reservationService.getAllReservations(req.query); res.json(reservations); } catch (error) { next(error); }
};
export const getReservationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const reservation = await reservationService.getReservationById(req.params.id); res.json(reservation); } catch (error) { next(error); }
};
export const getAvailableTables = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const { date, time, guests } = req.query as Record<string, string>; const result = await reservationService.getAvailableTables(date, time, guests); res.json(result); } catch (error) { next(error); }
};
export const getAvailableTimeSlots = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const result = await reservationService.getAvailableTimeSlots(req.query.date as string); res.json(result); } catch (error) { next(error); }
};
export const createReservation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const reservation = await reservationService.createReservation(req.body); res.status(201).json({ message: 'Reservation created successfully', reservation }); } catch (error) { next(error); }
};
export const updateReservation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const reservation = await reservationService.updateReservation(req.params.id, req.body); res.json({ message: 'Reservation updated successfully', reservation }); } catch (error) { next(error); }
};
export const updateReservationStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const reservation = await reservationService.updateReservationStatus(req.params.id, req.body.status); res.json({ message: 'Reservation status updated successfully', reservation }); } catch (error) { next(error); }
};
export const deleteReservation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const reservation = await reservationService.deleteReservation(req.params.id); res.json({ message: 'Reservation deleted successfully', reservation }); } catch (error) { next(error); }
};
export const checkAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const { table_id, date, time, guests } = req.query as Record<string, string>; const available = await reservationService.checkAvailability(table_id, date, time, guests); res.json({ available }); } catch (error) { next(error); }
};
export const getReservationStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const stats = await reservationService.getReservationStats(req.query.date as string | undefined); res.json(stats); } catch (error) { next(error); }
};
