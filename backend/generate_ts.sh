#!/bin/bash
# Generate all remaining TypeScript files for the backend migration
set -e

SRC="/Users/amanrana/Desktop/sangeet_restaurant_website/backend/src"

# ── Controllers ──────────────────────────────────────────────

cat > "$SRC/controllers/menuController.ts" << 'EOF'
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
EOF

cat > "$SRC/controllers/orderController.ts" << 'EOF'
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
EOF

cat > "$SRC/controllers/reservationController.ts" << 'EOF'
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
EOF

cat > "$SRC/controllers/reviewController.ts" << 'EOF'
import { Request, Response, NextFunction } from 'express';
import reviewService from '../services/reviewService';

export const getAllReviews = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const reviews = await reviewService.getAllReviews(); res.json(reviews); } catch (error) { next(error); }
};
export const getVerifiedReviews = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const reviews = await reviewService.getVerifiedReviews(); res.json(reviews); } catch (error) { next(error); }
};
export const createReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const review = await reviewService.createReview(req.body); res.status(201).json({ message: 'Review submitted successfully', review }); } catch (error) { next(error); }
};
export const getReviewById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const review = await reviewService.getReviewById(req.params.id); res.json(review); } catch (error) { next(error); }
};
export const updateReviewVerification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const review = await reviewService.updateReviewVerification(req.params.id, req.body.is_verified); res.json({ message: 'Review verification status updated successfully', review }); } catch (error) { next(error); }
};
export const deleteReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { await reviewService.deleteReview(req.params.id); res.json({ message: 'Review deleted successfully' }); } catch (error) { next(error); }
};
export const getReviewStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const stats = await reviewService.getReviewStats(); res.json(stats); } catch (error) { next(error); }
};
EOF

cat > "$SRC/controllers/eventController.ts" << 'EOF'
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
EOF

cat > "$SRC/controllers/analyticsController.ts" << 'EOF'
import { Request, Response, NextFunction } from 'express';
import analyticsService from '../services/analyticsService';

export const getBusinessAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const analytics = await analyticsService.getBusinessAnalytics(req.query.timeframe as string); res.json({ message: 'Business analytics retrieved successfully', analytics }); } catch (error) { next(error); }
};
export const getReservationTrends = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const result = await analyticsService.getReservationTrends(req.query.period as string); res.json({ message: 'Reservation trends retrieved successfully', trends: result.trends, period: result.period }); } catch (error) { next(error); }
};
export const getMenuAnalytics = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const analytics = await analyticsService.getMenuAnalytics(); res.json({ message: 'Menu analytics retrieved successfully', analytics }); } catch (error) { next(error); }
};
export const getCustomerInsights = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const insights = await analyticsService.getCustomerInsights(); res.json({ message: 'Customer insights retrieved successfully', insights }); } catch (error) { next(error); }
};
export const getPerformanceMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const metrics = await analyticsService.getPerformanceMetrics(req.query.startDate as string, req.query.endDate as string); res.json({ message: 'Performance metrics retrieved successfully', metrics }); } catch (error) { next(error); }
};
export const exportAnalyticsData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type = 'summary', format = 'json' } = req.query as Record<string, string>;
    const data = await analyticsService.getExportData(type);
    if (format === 'csv') {
      const csv = analyticsService.convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}_export_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
      return;
    }
    res.json({ message: 'Analytics data exported successfully', data, type, exportedAt: new Date().toISOString() });
  } catch (error) { next(error); }
};
EOF

cat > "$SRC/controllers/qrController.ts" << 'EOF'
import { Request, Response, NextFunction } from 'express';
import qrService from '../services/qrService';

export const getTableByQRCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const table = await qrService.getTableByQRCode(req.params.qrCode); res.json(table); } catch (error) { next(error); }
};
export const generateTableQRCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const result = await qrService.generateTableQRCode(req.body); res.json({ success: true, table: result.table, qrCode: result.qrCode }); } catch (error) { next(error); }
};
export const getAllQRCodes = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const tableQRCodes = await qrService.getAllQRCodes(); res.json({ tableQRCodes }); } catch (error) { next(error); }
};
export const getQRCodeAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const analytics = await qrService.getQRCodeAnalytics(req.params.qrCodeId); res.json(analytics); } catch (error) { next(error); }
};
export const updateQRCodeDesign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const qrCode = await qrService.updateQRCodeDesign(req.params.qrCodeId, req.body.design); res.json({ success: true, qrCode }); } catch (error) { next(error); }
};
export const deleteQRCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { await qrService.deleteQRCode(req.params.qrCodeId); res.json({ success: true, message: 'Table QR code deleted successfully' }); } catch (error) { next(error); }
};
export const generatePrintableQRCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { qrCodeId, format = 'png' } = req.params;
    const { design = 'classic', theme = 'modern' } = req.query as Record<string, string>;
    const { qrCodeBuffer, tableNumber } = await qrService.generatePrintableQRCode(qrCodeId, format, design, theme);
    res.setHeader('Content-Type', format === 'svg' ? 'image/svg+xml' : 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="sangeet-table-${tableNumber}-qr.${format}"`);
    res.setHeader('Content-Length', qrCodeBuffer.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(qrCodeBuffer);
  } catch (error) { next(error); }
};
export const bulkGenerateTableQRCodes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await qrService.bulkGenerateTableQRCodes(req.body);
    res.json({ success: true, generated: result.generated, errors: result.errors, summary: { total: req.body.tableNumbers.length, successful: result.generated.length, failed: result.errors.length } });
  } catch (error) { next(error); }
};
EOF

cat > "$SRC/controllers/websiteController.ts" << 'EOF'
import { Request, Response, NextFunction } from 'express';
import websiteService from '../services/websiteService';
import multer from 'multer';
import path from 'path';
import type { AuthenticatedRequest } from '../types';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => { cb(null, path.join(__dirname, '../../uploads/website/')); },
  filename: (_req, file, cb) => { const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); }
});

const upload = multer({
  storage, limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) { cb(null, true); } else { cb(new Error('Only image files are allowed')); }
  }
});

export const getRestaurantSettings = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const settings = await websiteService.getRestaurantSettings(); res.json({ message: 'Restaurant settings retrieved successfully', settings }); } catch (error) { next(error); }
};
export const updateRestaurantSettings = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try { await websiteService.updateRestaurantSettings(req.user.id, req.body.settings); res.json({ message: 'Restaurant settings updated successfully' }); } catch (error) { next(error); }
};
export const getWebsiteContent = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const content = await websiteService.getWebsiteContent(); res.json({ message: 'Website content retrieved successfully', content }); } catch (error) { next(error); }
};
export const updateWebsiteContent = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try { await websiteService.updateWebsiteContent(req.user.id, req.body.content); res.json({ message: 'Website content updated successfully' }); } catch (error) { next(error); }
};
export const getWebsiteMedia = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const media = await websiteService.getWebsiteMedia(); res.json({ message: 'Website media retrieved successfully', media }); } catch (error) { next(error); }
};
const uploadWebsiteMedia = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }
    if (!req.body.media_key) { res.status(400).json({ error: 'Media key is required' }); return; }
    const media = await websiteService.uploadWebsiteMedia(req.user.id, req.file, req.body);
    res.json({ message: 'Media uploaded successfully', media });
  } catch (error) { next(error); }
};
export const uploadWebsiteMediaMiddleware = [upload.single('image'), uploadWebsiteMedia] as const;
export const deleteWebsiteMedia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { await websiteService.deleteWebsiteMedia(req.params.id); res.json({ message: 'Media deleted successfully' }); } catch (error) { next(error); }
};
export const getWebsiteStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const stats = await websiteService.getWebsiteStats(); res.json({ message: 'Website stats retrieved successfully', stats }); } catch (error) { next(error); }
};
EOF

echo "All controllers generated."
