import { Request, Response, NextFunction } from 'express';
import orderService from '../services/orderService';

export const getAllTables = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const tables = await orderService.getAllTables(); res.json(tables); } catch (error) { next(error); }
};
export const getTableByQRCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const table = await orderService.getTableByQRCode(req.params.qrCode); res.json(table); } catch (error) { next(error); }
};
export const createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const result = await orderService.createOrder(req.body); res.status(201).json({ message: result.merged ? 'Items added to existing order successfully!' : 'Order placed successfully!', ...result }); } catch (error) { next(error); }
};
export const getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const order = await orderService.getOrderById(req.params.id, req.query.tableNumber as string | undefined); res.json(order); } catch (error) { next(error); }
};
export const getOrdersByTable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const orders = await orderService.getOrdersByTable(req.params.tableId); res.json(orders); } catch (error) { next(error); }
};
export const getOrdersByTableNumber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const orders = await orderService.getOrdersByTableNumber(req.params.tableNumber); res.json(orders); } catch (error) { next(error); }
};
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const order = await orderService.updateOrderStatus(req.params.id, req.body.status); res.json({ message: 'Order status updated successfully', order }); } catch (error) { next(error); }
};
export const getAllOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const orders = await orderService.getAllOrders(req.query); res.json(orders); } catch (error) { next(error); }
};
export const getOrderStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const stats = await orderService.getOrderStats(); res.json(stats); } catch (error) { next(error); }
};
export const generateTableQRCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const qrCode = await orderService.generateTableQRCode(req.params.tableNumber); res.json(qrCode); } catch (error) { next(error); }
};
export const generateAllTableQRCodes = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const qrCodes = await orderService.generateAllTableQRCodes(); res.json(qrCodes); } catch (error) { next(error); }
};
export const deleteOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const result = await orderService.deleteOrder(req.params.id); res.json({ message: 'Order deleted successfully', order: result.order, tableNumber: result.tableNumber }); } catch (error) { next(error); }
};
export const bulkUpdateOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const updatedOrders = await orderService.bulkUpdateOrderStatus(req.body.orderIds, req.body.status); res.json({ message: `${updatedOrders.length} orders updated successfully`, updatedOrders }); } catch (error) { next(error); }
};
export const searchOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const orders = await orderService.searchOrders(req.query); res.json(orders); } catch (error) { next(error); }
};
