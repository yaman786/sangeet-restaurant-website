import api, { apiCallWrapper } from './client';

export const getBusinessAnalytics = async (timeframe: string | number = '30', startDate?: string, endDate?: string): Promise<any> => {
  return apiCallWrapper(async () => {
    const params = new URLSearchParams();
    if (timeframe) params.append('timeframe', String(timeframe));
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return await api.get(`/analytics/business?${params.toString()}`);
  }, 'getBusinessAnalytics');
};

export const getReservationTrends = async (period: string = 'month', startDate?: string, endDate?: string): Promise<any> => {
  return apiCallWrapper(async () => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return await api.get(`/analytics/trends?${params.toString()}`);
  }, 'getReservationTrends');
};

export const getAnalyticsDrillDown = async (date: string, type: 'orders' | 'reservations' = 'orders'): Promise<any> => {
  return apiCallWrapper(async () => {
    const params = new URLSearchParams({ date, type });
    return await api.get(`/analytics/drilldown?${params.toString()}`);
  }, 'getAnalyticsDrillDown');
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
