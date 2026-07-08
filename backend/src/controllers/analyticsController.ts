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
