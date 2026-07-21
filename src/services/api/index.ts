/**
 * API barrel file — re-exports all domain modules for backward compatibility.
 * Existing imports like `import { fetchMenuItems } from '../services/api'` continue to work.
 * New code should import directly from the domain module for clarity, e.g.:
 *   import { fetchMenuItems } from '../services/api/menuApi';
 */

// Core client
export { default, API_ERROR_TYPES, ApiError, apiCallWrapper, API_CONFIG, serverFetch } from './client';

// Menu
export {
  fetchMenuItems, fetchMenuCategories, fetchPopularMenuItems,
  fetchMenuItemsByCategory, fetchMenuItemById,
  createMenuItem, updateMenuItem, deleteMenuItem,
  createCategory, updateCategory, deleteCategory,
  getMenuStats
} from './menuApi';

// Orders & Tables
export {
  createOrder, fetchAllOrders, fetchOrderById,
  getOrderById, getOrdersByTable, fetchOrdersByTable,
  updateOrderStatus, deleteOrder, bulkUpdateOrderStatus,
  searchOrders, fetchOrderStats, fetchTables,
  cancelOrderItemApi,
  getTableByQRCode, getTableByNumber, archiveCompletedOrders,
  restoreOrder
} from './orderApi';

// Reservations
export {
  createReservation, getAvailableTables, getAvailableTimeSlots,
  fetchAllReservations, fetchReservationById,
  updateReservation, updateReservationStatus, deleteReservation,
  checkTableAvailability, fetchReservationStats
} from './reservationApi';

// Auth & Users
export {
  loginUser, getProfile, changePassword,
  getAllUsers, createUser, updateUser, deleteUser,
  toggleUserStatus, getUserStats
} from './authApi';

// QR Codes
export {
  getAllQRCodes, generateTableQRCode, bulkGenerateTableQRCodes,
  getQRCodeAnalytics, updateQRCodeDesign, deleteQRCode,
  downloadPrintableQRCode, restoreQRCode
} from './qrApi';

// Reviews
export {
  fetchReviews, fetchVerifiedReviews, submitReview, fetchReviewById
} from './reviewApi';

// Website & Events
export {
  getRestaurantSettings, updateRestaurantSettings,
  getWebsiteContent, updateWebsiteContent,
  getWebsiteMedia, uploadWebsiteMedia, deleteWebsiteMedia,
  getWebsiteStats,
  fetchEvents, fetchFeaturedEvents, fetchUpcomingEvents, fetchEventById
} from './websiteApi';

// Analytics & Health
export {
  getBusinessAnalytics, getReservationTrends, getMenuAnalytics,
  getCustomerInsights, getPerformanceMetrics, exportAnalyticsData,
  checkApiHealth
} from './analyticsApi';

// SERVER COMPONENT FETCHERS
export { serverFetchMenuItems, serverFetchMenuCategories } from './menuApi';
export { serverFetchReviews } from './reviewApi';
export { serverFetchEvents } from './websiteApi';
