import { Response, NextFunction } from 'express';
import authService from '../services/authService';
import type { AuthenticatedRequest } from '../types';

export const login = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try { const result = await authService.login(req.body); res.json({ message: 'Login successful', ...result }); } catch (error) { next(error); }
};
export const getProfile = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try { const user = await authService.getProfile(req.user.id); res.json({ user }); } catch (error) { next(error); }
};
export const changePassword = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try { await authService.changePassword(req.user.id, req.body); res.json({ message: 'Password updated successfully' }); } catch (error) { next(error); }
};
export const getAllUsers = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try { const result = await authService.getAllUsers(req.user.role, req.query); res.json(result); } catch (error) { next(error); }
};
export const createUser = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try { const user = await authService.createUser(req.user.role, req.body); res.status(201).json({ message: 'User created successfully', user }); } catch (error) { next(error); }
};
export const updateUser = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try { const user = await authService.updateUser(req.user.role, req.params.id, req.body); res.json({ message: 'User updated successfully', user }); } catch (error) { next(error); }
};
export const deleteUser = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try { await authService.deleteUser(req.user.id, req.user.role, req.params.id); res.json({ message: 'User deleted successfully' }); } catch (error) { next(error); }
};
export const toggleUserStatus = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try { const result = await authService.toggleUserStatus(req.user.id, req.user.role, req.params.id); res.json({ message: `User ${result.status} successfully`, user: result.user }); } catch (error) { next(error); }
};
export const getUserStats = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try { const stats = await authService.getUserStats(req.user.role); res.json({ stats }); } catch (error) { next(error); }
};
