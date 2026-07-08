import { Request, Response, NextFunction } from 'express';
import menuService from '../services/menuService';

export const getAllMenuItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const items = await menuService.getAllMenuItems(req.query); res.json(items); } catch (error) { next(error); }
};
export const getMenuItemById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const item = await menuService.getMenuItemById(req.params.id); res.json(item); } catch (error) { next(error); }
};
export const createMenuItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const item = await menuService.createMenuItem(req.body); res.status(201).json(item); } catch (error) { next(error); }
};
export const updateMenuItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const item = await menuService.updateMenuItem(req.params.id, req.body); res.json(item); } catch (error) { next(error); }
};
export const deleteMenuItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { await menuService.deleteMenuItem(req.params.id); res.json({ message: 'Menu item deleted successfully' }); } catch (error) { next(error); }
};
export const getAllCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const categories = await menuService.getAllCategories(); res.json(categories); } catch (error) { next(error); }
};
export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const category = await menuService.createCategory(req.body); res.status(201).json(category); } catch (error) { next(error); }
};
export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const category = await menuService.updateCategory(req.params.id, req.body); res.json(category); } catch (error) { next(error); }
};
export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { await menuService.deleteCategory(req.params.id); res.json({ message: 'Category deleted successfully' }); } catch (error) { next(error); }
};
export const getMenuStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const stats = await menuService.getMenuStats(); res.json(stats); } catch (error) { next(error); }
};
