import api, { apiCallWrapper } from './client';

export const getBusinessAnalytics = async (timeframe = '30') => {
  return apiCallWrapper(async () => {
    return await api.get(`/analytics/business?timeframe=${encodeURIComponent(timeframe)}`);
  }, 'getBusinessAnalytics');
};

export const getReservationTrends = async (period = 'month') => {
  return apiCallWrapper(async () => {
    return await api.get(`/analytics/reservations/trends?period=${encodeURIComponent(period)}`);
  }, 'getReservationTrends');
};

export const getMenuAnalytics = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/analytics/menu');
  }, 'getMenuAnalytics');
};

export const getCustomerInsights = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/analytics/customers');
  }, 'getCustomerInsights');
};

export const getPerformanceMetrics = async (startDate, endDate) => {
  return apiCallWrapper(async () => {
    const params = new URLSearchParams({
      startDate: startDate,
      endDate: endDate
    });
    return await api.get(`/analytics/performance?${params.toString()}`);
  }, 'getPerformanceMetrics');
};

export const exportAnalyticsData = async (type = 'summary', format = 'json') => {
  return apiCallWrapper(async () => {
    const params = new URLSearchParams({
      type: type,
      format: format
    });
    return await api.get(`/analytics/export?${params.toString()}`, {
      responseType: 'blob'
    });
  }, 'exportAnalyticsData');
};

// Health check
export const checkApiHealth = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/health');
  }, 'checkApiHealth');
};
