import axios from 'axios';
import toast from 'react-hot-toast';

// API Configuration - CACHE BUST VERSION
const API_CONFIG = {
  BASE_URL: 'https://sangeet-restaurant-api.onrender.com/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};





// Error types for better error handling
export const API_ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  SERVER: 'SERVER_ERROR',
  CLIENT: 'CLIENT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

/**
 * Create custom error class for API errors
 */
class ApiError extends Error {
  constructor(message, type, status, originalError) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.status = status;
    this.originalError = originalError;
  }
}

/**
 * Create axios instance with base configuration
 */
const api = axios.create({
  baseURL: 'https://sangeet-restaurant-api.onrender.com/api',
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get auth token from localStorage
 * @returns {string|null} Auth token or null
 */
const getAuthToken = () => {
  return localStorage.getItem('authToken') || localStorage.getItem('adminToken');
};

/**
 * Add auth token to request headers
 * @param {Object} config - Axios config
 * @returns {Object} Updated config
 */
const addAuthToken = (config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

/**
 * Handle API response errors
 * @param {Error} error - Axios error
 * @returns {Promise} Rejected promise with custom error
 */
const handleApiError = (error) => {
  let errorType = API_ERROR_TYPES.UNKNOWN;
  let status = null;
  let message = 'An unexpected error occurred';

  if (error.response) {
    // Server responded with error status
    status = error.response.status;
    message = error.response.data?.message || `Server error: ${status}`;
    
    if (status >= 500) {
      errorType = API_ERROR_TYPES.SERVER;
    } else if (status >= 400) {
      errorType = API_ERROR_TYPES.CLIENT;
    }
  } else if (error.request) {
    // Network error
    errorType = API_ERROR_TYPES.NETWORK;
    message = 'Network error: Unable to connect to server';
  } else if (error.code === 'ECONNABORTED') {
    // Timeout error
    errorType = API_ERROR_TYPES.TIMEOUT;
    message = 'Request timeout: Server took too long to respond';
  }

  console.error('API Error:', {
    type: errorType,
    status,
    message,
    originalError: error
  });

  return Promise.reject(new ApiError(message, errorType, status, error));
};

/**
 * Retry failed requests
 * @param {Function} apiCall - API function to retry
 * @param {number} attempts - Number of retry attempts
 * @returns {Promise} API response
 */
const retryApiCall = async (apiCall, attempts = API_CONFIG.RETRY_ATTEMPTS) => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (i === attempts - 1) throw error;
      
      // Only retry network and timeout errors
      if (error.type === API_ERROR_TYPES.NETWORK || error.type === API_ERROR_TYPES.TIMEOUT) {
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY * (i + 1)));
        continue;
      }
      throw error;
    }
  }
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return addAuthToken(config);
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  handleApiError
);

/**
 * Generic API call wrapper with error handling and retry logic
 * @param {Function} apiCall - API function to execute
 * @param {string} errorContext - Context for error messages
 * @param {boolean} enableRetry - Whether to enable retry logic
 * @returns {Promise} API response
 */
const apiCallWrapper = async (apiCall, errorContext = 'API call', enableRetry = true) => {
  try {
    let result;
    if (enableRetry) {
      result = await retryApiCall(apiCall);
    } else {
      result = await apiCall();
    }
    return result;
  } catch (error) {
    console.error(`❌ Error in ${errorContext}:`, error);
    throw error;
  }
};

// Menu API calls
export const fetchMenuItems = async (filters = {}) => {
  return apiCallWrapper(async () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    const queryString = params.toString();
    const url = queryString ? `/menu/items?${queryString}` : '/menu/items';
    return await api.get(url);
  }, 'fetchMenuItems');
};

export const fetchMenuCategories = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/menu/categories');
  }, 'fetchMenuCategories');
};

export const fetchPopularMenuItems = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/menu/popular');
  }, 'fetchPopularMenuItems');
};

export const fetchMenuItemsByCategory = async (category) => {
  return apiCallWrapper(async () => {
    return await api.get(`/menu/category/${encodeURIComponent(category)}`);
  }, 'fetchMenuItemsByCategory');
};

export const fetchMenuItemById = async (id) => {
  return apiCallWrapper(async () => {
    return await api.get(`/menu/items/${encodeURIComponent(id)}`);
  }, 'fetchMenuItemById');
};

// Reviews API calls
export const fetchReviews = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/reviews');
  }, 'fetchReviews');
};

export const fetchVerifiedReviews = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/reviews/verified');
  }, 'fetchVerifiedReviews');
};

export const getOrderById = async (orderId) => {
  return apiCallWrapper(async () => {
    return await api.get(`/orders/${orderId}`);
  }, 'getOrderById');
};

export const getOrdersByTable = async (tableNumber) => {
  return apiCallWrapper(async () => {
    return await api.get(`/orders/table-number/${tableNumber}`);
  }, 'getOrdersByTable');
};

export const submitReview = async (reviewData) => {
  return apiCallWrapper(async () => {
    return await api.post('/reviews', reviewData);
  }, 'submitReview', false);
};

export const fetchReviewById = async (id) => {
  return apiCallWrapper(async () => {
    return await api.get(`/reviews/${encodeURIComponent(id)}`);
  }, 'fetchReviewById');
};

// Reservations API calls
export const createReservation = async (reservationData) => {
  return apiCallWrapper(async () => {
    return await api.post('/reservations', reservationData);
  }, 'createReservation', false);
};

export const getAvailableTables = async (date, time, guests) => {
  return apiCallWrapper(async () => {
    const params = new URLSearchParams({
      date: date,
      time: time,
      guests: guests.toString()
    });
    return await api.get(`/reservations/available-tables?${params.toString()}`);
  }, 'getAvailableTables');
};

export const getAvailableTimeSlots = async (date, guests = 4) => {
  return apiCallWrapper(async () => {
    const params = new URLSearchParams({
      date: date,
      guests: guests.toString()
    });
    return await api.get(`/reservations/available-times?${params.toString()}`);
  }, 'getAvailableTimeSlots');
};

export const fetchAllReservations = async (filters = {}) => {
  return apiCallWrapper(async () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    const queryString = params.toString();
    const url = queryString ? `/reservations?${queryString}` : '/reservations';
    return await api.get(url);
  }, 'fetchAllReservations');
};

export const fetchReservationById = async (id) => {
  return apiCallWrapper(async () => {
    return await api.get(`/reservations/${encodeURIComponent(id)}`);
  }, 'fetchReservationById');
};

export const updateReservation = async (id, reservationData) => {
  return apiCallWrapper(async () => {
    return await api.put(`/reservations/${encodeURIComponent(id)}`, reservationData);
  }, 'updateReservation', false);
};

export const updateReservationStatus = async (id, status) => {
  return apiCallWrapper(async () => {
    return await api.patch(`/reservations/${encodeURIComponent(id)}/status`, { status });
  }, 'updateReservationStatus', false);
};

export const deleteReservation = async (id) => {
  return apiCallWrapper(async () => {
    return await api.delete(`/reservations/${encodeURIComponent(id)}`);
  }, 'deleteReservation', false);
};

export const checkTableAvailability = async (tableId, date, time, guests) => {
  return apiCallWrapper(async () => {
    const params = new URLSearchParams({
      tableId: tableId.toString(),
      date: date,
      time: time,
      guests: guests.toString()
    });
    return await api.get(`/reservations/check-availability?${params.toString()}`);
  }, 'checkTableAvailability');
};

export const fetchReservationStats = async (date = null) => {
  return apiCallWrapper(async () => {
    const url = date ? `/reservations/stats?date=${encodeURIComponent(date)}` : '/reservations/stats';
    return await api.get(url);
  }, 'fetchReservationStats');
};



// Events API calls
export const fetchEvents = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/events');
  }, 'fetchEvents');
};

export const fetchFeaturedEvents = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/events/featured');
  }, 'fetchFeaturedEvents');
};

export const fetchUpcomingEvents = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/events/upcoming');
  }, 'fetchUpcomingEvents');
};

export const fetchEventById = async (id) => {
  return apiCallWrapper(async () => {
    return await api.get(`/events/${encodeURIComponent(id)}`);
  }, 'fetchEventById');
};

// Orders API calls
export const deleteOrder = async (orderId) => {
  return apiCallWrapper(async () => {
    return await api.delete(`/orders/${encodeURIComponent(orderId)}`);
  }, 'deleteOrder', false);
};

export const bulkUpdateOrderStatus = async (orderIds, status) => {
  return apiCallWrapper(async () => {
    return await api.patch('/orders/bulk-status', { orderIds, status });
  }, 'bulkUpdateOrderStatus', false);
};

export const searchOrders = async (searchParams = {}) => {
  return apiCallWrapper(async () => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    const queryString = params.toString();
    const url = queryString ? `/orders/search?${queryString}` : '/orders/search';
    return await api.get(url);
  }, 'searchOrders');
};

export const fetchTables = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/tables');
  }, 'fetchTables');
};

export const getTableByQRCode = async (qrCode) => {
  return apiCallWrapper(async () => {
    return await api.get(`/tables/qr/${encodeURIComponent(qrCode)}`);
  }, 'getTableByQRCode');
};

export const createOrder = async (orderData) => {
  console.log('🔧 createOrder - API Config:', {
    BASE_URL: API_CONFIG.BASE_URL,
    axiosBaseURL: api.defaults.baseURL,
    fullUrl: api.defaults.baseURL + '/orders'
  });
  console.log('🔧 createOrder - Order Data:', orderData);
  return apiCallWrapper(async () => {
    return await api.post('/orders', orderData);
  }, 'createOrder', false);
};

export const fetchOrderById = async (orderId) => {
  return apiCallWrapper(async () => {
    return await api.get(`/orders/${encodeURIComponent(orderId)}`);
  }, 'fetchOrderById');
};

export const fetchOrdersByTable = async (tableId) => {
  return apiCallWrapper(async () => {
    return await api.get(`/orders/table/${encodeURIComponent(tableId)}`);
  }, 'fetchOrdersByTable');
};

export const updateOrderStatus = async (orderId, status) => {
  return apiCallWrapper(async () => {
    return await api.patch(`/orders/${encodeURIComponent(orderId)}/status`, { status });
  }, 'updateOrderStatus', false);
};



export const fetchAllOrders = async (queryParams = '') => {
  return apiCallWrapper(async () => {
    const url = queryParams ? `/orders?${queryParams}` : '/orders';
    return await api.get(url);
  }, 'fetchAllOrders');
};

export const fetchOrderStats = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/orders/stats');
  }, 'fetchOrderStats');
};



// Health check
export const checkApiHealth = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/health');
  }, 'checkApiHealth');
};

// Authentication API calls
export const loginUser = async (credentials) => {
  try {
    const result = await apiCallWrapper(async () => {
      const response = await api.post('/auth/login', credentials);
      return response;
    }, 'loginUser', false);
    return result;
  } catch (error) {
    console.error('❌ loginUser failed:', error);
    throw error;
  }
};

export const getProfile = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/auth/profile');
  }, 'getProfile');
};

export const changePassword = async (passwordData) => {
  return apiCallWrapper(async () => {
    return await api.post('/auth/change-password', passwordData);
  }, 'changePassword', false);
};

// User management API calls
export const getAllUsers = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/auth/users');
  }, 'getAllUsers');
};

export const createUser = async (userData) => {
  return apiCallWrapper(async () => {
    return await api.post('/auth/users', userData);
  }, 'createUser', false);
};

export const updateUser = async (id, userData) => {
  return apiCallWrapper(async () => {
    return await api.put(`/auth/users/${encodeURIComponent(id)}`, userData);
  }, 'updateUser', false);
};

export const deleteUser = async (id) => {
  return apiCallWrapper(async () => {
    return await api.delete(`/auth/users/${encodeURIComponent(id)}`);
  }, 'deleteUser', false);
};

export const toggleUserStatus = async (id) => {
  return apiCallWrapper(async () => {
    return await api.patch(`/auth/users/${encodeURIComponent(id)}/toggle-status`);
  }, 'toggleUserStatus', false);
};

export const getUserStats = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/auth/users/stats');
  }, 'getUserStats');
};

// Menu management API calls
export const createMenuItem = async (menuData) => {
  return apiCallWrapper(async () => {
    return await api.post('/menu/items', menuData);
  }, 'createMenuItem', false);
};

export const updateMenuItem = async (id, menuData) => {
  return apiCallWrapper(async () => {
    return await api.put(`/menu/items/${encodeURIComponent(id)}`, menuData);
  }, 'updateMenuItem', false);
};

export const deleteMenuItem = async (id) => {
  return apiCallWrapper(async () => {
    return await api.delete(`/menu/items/${encodeURIComponent(id)}`);
  }, 'deleteMenuItem', false);
};

export const createCategory = async (categoryData) => {
  return apiCallWrapper(async () => {
    return await api.post('/menu/categories', categoryData);
  }, 'createCategory', false);
};

export const updateCategory = async (id, categoryData) => {
  return apiCallWrapper(async () => {
    return await api.put(`/menu/categories/${encodeURIComponent(id)}`, categoryData);
  }, 'updateCategory', false);
};

export const deleteCategory = async (id) => {
  return apiCallWrapper(async () => {
    return await api.delete(`/menu/categories/${encodeURIComponent(id)}`);
  }, 'deleteCategory', false);
};

export const getMenuStats = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/menu/stats');
  }, 'getMenuStats');
};

// QR Code management API calls
export const getAllQRCodes = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/qr-codes');
  }, 'getAllQRCodes');
};

export const generateTableQRCode = async (qrData) => {
  return apiCallWrapper(async () => {
    return await api.post('/qr-codes/generate/table', qrData);
  }, 'generateTableQRCode', false);
};



export const bulkGenerateTableQRCodes = async (qrData) => {
  return apiCallWrapper(async () => {
    return await api.post('/qr-codes/generate/bulk', qrData);
  }, 'bulkGenerateTableQRCodes', false);
};

export const getQRCodeAnalytics = async (qrCodeId) => {
  return apiCallWrapper(async () => {
    return await api.get(`/qr-codes/analytics/${encodeURIComponent(qrCodeId)}`);
  }, 'getQRCodeAnalytics');
};

export const updateQRCodeDesign = async (qrCodeId, design) => {
  return apiCallWrapper(async () => {
    return await api.put(`/qr-codes/${encodeURIComponent(qrCodeId)}/design`, design);
  }, 'updateQRCodeDesign', false);
};

export const deleteQRCode = async (qrCodeId) => {
  return apiCallWrapper(async () => {
    return await api.delete(`/qr-codes/${encodeURIComponent(qrCodeId)}`);
  }, 'deleteQRCode', false);
};

export const downloadPrintableQRCode = async (qrCodeId, format = 'png', design = 'classic', theme = 'modern') => {
  try {
    const timestamp = Date.now(); // Add timestamp for cache busting
    console.log(`Downloading QR code: ${qrCodeId}, format: ${format}, design: ${design}, theme: ${theme}`);
    
    const token = getAuthToken();
    console.log('🔑 Auth token:', token ? 'Present' : 'Missing');
    console.log('🌐 API URL:', `${API_CONFIG.BASE_URL}/qr-codes/print/${qrCodeId}/${format}?design=${design}&theme=${theme}&t=${timestamp}`);
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/qr-codes/print/${qrCodeId}/${format}?design=${design}&theme=${theme}&t=${timestamp}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response error:', response.status, errorText);
      throw new Error(`Failed to download QR code: ${response.status} ${response.statusText}`);
    }

    // Check if the response is actually an image
    const contentType = response.headers.get('content-type');
    console.log('Response content type:', contentType);
    
    if (!contentType || !contentType.startsWith('image/')) {
      console.error('Invalid content type:', contentType);
      throw new Error('Server did not return an image');
    }

    const blob = await response.blob();
    console.log('Blob size:', blob.size, 'bytes');
    console.log('Blob type:', blob.type);
    
    if (blob.size === 0) {
      throw new Error('Downloaded file is empty');
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sangeet-table-${qrCodeId}-qr.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    // Show success message
    if (typeof toast !== 'undefined') {
      toast.success('Beautiful QR code downloaded successfully!');
    }
  } catch (error) {
    console.error('Error downloading QR code:', error);
    if (typeof toast !== 'undefined') {
      toast.error(`Failed to download QR code: ${error.message}`);
    }
  }
};

// Website management API calls
export const getRestaurantSettings = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/website/settings');
  }, 'getRestaurantSettings');
};

export const updateRestaurantSettings = async (settings) => {
  return apiCallWrapper(async () => {
    return await api.put('/website/settings', settings);
  }, 'updateRestaurantSettings', false);
};

export const getWebsiteContent = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/website/content');
  }, 'getWebsiteContent');
};

export const updateWebsiteContent = async (content) => {
  return apiCallWrapper(async () => {
    return await api.put('/website/content', content);
  }, 'updateWebsiteContent', false);
};

export const getWebsiteMedia = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/website/media');
  }, 'getWebsiteMedia');
};

export const uploadWebsiteMedia = async (formData) => {
  return apiCallWrapper(async () => {
    return await api.post('/website/media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }, 'uploadWebsiteMedia', false);
};

export const deleteWebsiteMedia = async (id) => {
  return apiCallWrapper(async () => {
    return await api.delete(`/website/media/${encodeURIComponent(id)}`);
  }, 'deleteWebsiteMedia', false);
};

export const getWebsiteStats = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/website/stats');
  }, 'getWebsiteStats');
};

// Analytics API calls
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

export default api; 