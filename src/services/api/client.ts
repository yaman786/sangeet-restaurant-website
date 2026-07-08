import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';
import toast from 'react-hot-toast';

let baseUrl = '/api';

if (typeof window === 'undefined') {
  baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL 
    ? `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api`
    : 'http://localhost:3000/api';
}

// API Configuration - Use environment variables with fallbacks
export const API_CONFIG = {
  BASE_URL: baseUrl,
  TIMEOUT: 15000,
  RETRY_ATTEMPTS: 1,
  RETRY_DELAY: 500
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
export class ApiError extends Error {
  type: string;
  status: number | null;
  originalError: any;

  constructor(message: string, type: string, status: number | null, originalError: any) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.status = status;
    this.originalError = originalError;
  }
}

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Add auth token to request headers
 * (Removed as we now use HttpOnly cookies with withCredentials)
 */
const addAuthToken = (config: InternalAxiosRequestConfig) => {
  return config;
};

/**
 * Handle authentication failure
 */
const handleAuthFailure = () => {
  if (typeof window === 'undefined') return;
  // Clear all auth tokens
  localStorage.removeItem('sangeet_token');
  localStorage.removeItem('sangeet_user');
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('user');

  // Redirect to login if not already there
  const currentPath = window.location.pathname;
  if (!currentPath.includes('/login')) {
    if (currentPath.startsWith('/admin')) {
      window.location.href = '/admin/login';
    } else {
      window.location.href = '/login';
    }
  }
};

/**
 * Handle API response errors
 * @param {Error} error - Axios error
 * @returns {Promise} Rejected promise with custom error
 */
const handleApiError = (error: any): Promise<never> => {
  let errorType = API_ERROR_TYPES.UNKNOWN;
  let status: number | null = null;
  let message = 'An unexpected error occurred';

  if (error.response) {
    status = error.response.status;
    message = error.response.data?.error || error.response.data?.message || `Server error: ${status}`;

    if (status !== null && status >= 500) {
      errorType = API_ERROR_TYPES.SERVER;
    } else if (status !== null && status >= 400) {
      errorType = API_ERROR_TYPES.CLIENT;

      if (status !== null && (status === 401 || status === 403)) {
        const isLoginRequest = error.config && error.config.url && error.config.url.includes('/auth/login');
        if (!isLoginRequest) {
          handleAuthFailure();
        }
      } else if (status === 429) {
        message = error.response.data?.error || 'Too many requests. Please try again later.';
      }
    }
  } else if (error.request) {
    errorType = API_ERROR_TYPES.NETWORK;
    message = 'Network error: Unable to connect to server';
  } else if (error.code === 'ECONNABORTED') {
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
const retryApiCall = async <T>(apiCall: () => Promise<T>, attempts = API_CONFIG.RETRY_ATTEMPTS): Promise<T> => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await apiCall();
    } catch (error: any) {
      if (i === attempts - 1) throw error;

      if (error.type === API_ERROR_TYPES.NETWORK ||
          error.type === API_ERROR_TYPES.TIMEOUT ||
        (error.status && error.status >= 500)) {
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries reached');
};

/**
 * Wrapper for API calls with error handling and retry logic
 * @param {Function} apiCall - API function to execute
 * @param {string} errorContext - Context for error messages
 * @param {boolean} enableRetry - Whether to enable retry logic
 * @returns {Promise} API response
 */
export const apiCallWrapper = async <T>(apiCall: () => Promise<T>, errorContext = 'API call', enableRetry = true): Promise<T> => {
  try {
    let result: T;
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

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    return addAuthToken(config);
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    return handleApiError(error);
  }
);

/**
 * Native fetch wrapper for Next.js Server Components.
 * Supports Next.js extended caching options.
 */
export const serverFetch = async <T>(
  endpoint: string,
  options?: RequestInit & { next?: { revalidate?: number; tags?: string[] } }
): Promise<T> => {
  // Ensure we use the absolute URL for server-side fetching
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${API_CONFIG.BASE_URL}${endpoint}`;
    
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.statusText}`);
  }
  
  return res.json() as Promise<T>;
};

export default api;
