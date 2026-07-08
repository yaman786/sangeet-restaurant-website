import api, { apiCallWrapper } from './client';

export const getBusinessAnalytics = async (timeframe: string | number = '30'): Promise<any> => {
  return apiCallWrapper(async () => {
    return await api.get(`/analytics/business?timeframe=${encodeURIComponent(timeframe)}`);
  }, 'getBusinessAnalytics');
};

export const getReservationTrends = async (period: string = 'month'): Promise<any> => {
  return apiCallWrapper(async () => {
    return await api.get(`/analytics/reservations/trends?period=${encodeURIComponent(period)}`);
  }, 'getReservationTrends');
};

export const getMenuAnalytics = async (): Promise<any> => {
  return apiCallWrapper(async () => {
    return await api.get('/analytics/menu');
  }, 'getMenuAnalytics');
};

export const getCustomerInsights = async (): Promise<any> => {
  return apiCallWrapper(async () => {
    return await api.get('/analytics/customers');
  }, 'getCustomerInsights');
};

export const getPerformanceMetrics = async (startDate: string, endDate: string): Promise<any> => {
  return apiCallWrapper(async () => {
    const params = new URLSearchParams({
      startDate: startDate,
      endDate: endDate
    });
    return await api.get(`/analytics/performance?${params.toString()}`);
  }, 'getPerformanceMetrics');
};

export const exportAnalyticsData = async (type: string = 'summary', format: string = 'json'): Promise<any> => {
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
export const checkApiHealth = async (): Promise<any> => {
  return apiCallWrapper(async () => {
    return await api.get('/health');
  }, 'checkApiHealth');
};
