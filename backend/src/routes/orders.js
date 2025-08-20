const express = require('express');
const router = express.Router();
const {
  getAllTables,
  getTableByQRCode,
  createOrder,
  getOrderById,
  getOrdersByTable,
  getOrdersByTableNumber,
  updateOrderStatus,
  getAllOrders,
  getOrderStats,
  generateTableQRCode,
  generateAllTableQRCodes,
  deleteOrder,
  bulkUpdateOrderStatus,
  searchOrders
} = require('../controllers/orderController');
const { validateId } = require('../middleware/validation');

// QR Code and Table routes
router.get('/tables', getAllTables);
router.get('/table/qr/:qrCode', getTableByQRCode);

// QR Code Generation routes
router.get('/qr/generate/:tableNumber', generateTableQRCode);
router.get('/qr/generate-all', generateAllTableQRCodes);

// Order routes
router.post('/', createOrder);
router.get('/stats', getOrderStats);
router.get('/table/:tableId', getOrdersByTable);
router.get('/table-number/:tableNumber', getOrdersByTableNumber);

// Admin routes (place specific routes before parameterized routes)
router.get('/search', searchOrders);
router.get('/', getAllOrders);
router.patch('/bulk-status', bulkUpdateOrderStatus);

// Individual order routes (place after specific routes)
router.get('/:id', validateId, getOrderById);
router.patch('/:id/status', validateId, updateOrderStatus);
router.delete('/:id', validateId, deleteOrder);

module.exports = router; 