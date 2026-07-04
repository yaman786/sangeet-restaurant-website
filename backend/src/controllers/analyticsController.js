const analyticsService = require('../services/analyticsService');

const getBusinessAnalytics = async (req, res, next) => {
  try {
    const analytics = await analyticsService.getBusinessAnalytics(req.query.timeframe);
    res.json({
      message: 'Business analytics retrieved successfully',
      analytics
    });
  } catch (error) {
    next(error);
  }
};

const getReservationTrends = async (req, res, next) => {
  try {
    const result = await analyticsService.getReservationTrends(req.query.period);
    res.json({
      message: 'Reservation trends retrieved successfully',
      trends: result.trends,
      period: result.period
    });
  } catch (error) {
    next(error);
  }
};

const getMenuAnalytics = async (req, res, next) => {
  try {
    const analytics = await analyticsService.getMenuAnalytics();
    res.json({
      message: 'Menu analytics retrieved successfully',
      analytics
    });
  } catch (error) {
    next(error);
  }
};

const getCustomerInsights = async (req, res, next) => {
  try {
    const insights = await analyticsService.getCustomerInsights();
    res.json({
      message: 'Customer insights retrieved successfully',
      insights
    });
  } catch (error) {
    next(error);
  }
};

const getPerformanceMetrics = async (req, res, next) => {
  try {
    const metrics = await analyticsService.getPerformanceMetrics(req.query.startDate, req.query.endDate);
    res.json({
      message: 'Performance metrics retrieved successfully',
      metrics
    });
  } catch (error) {
    next(error);
  }
};

const exportAnalyticsData = async (req, res, next) => {
  try {
    const { type = 'summary', format = 'json' } = req.query;
    const data = await analyticsService.getExportData(type);

    if (format === 'csv') {
      const csv = analyticsService.convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}_export_${new Date().toISOString().split('T')[0]}.csv"`);
      return res.send(csv);
    }

    res.json({
      message: 'Analytics data exported successfully',
      data,
      type,
      exportedAt: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBusinessAnalytics,
  getReservationTrends,
  getMenuAnalytics,
  getCustomerInsights,
  getPerformanceMetrics,
  exportAnalyticsData
};
