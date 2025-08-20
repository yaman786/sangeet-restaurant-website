const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');
const { authenticateToken, requireAuth } = require('../middleware/auth');

// Admin routes (require authentication)
router.get('/', authenticateToken, requireAuth, qrController.getAllQRCodes);
router.get('/analytics/:qrCodeId', authenticateToken, requireAuth, qrController.getQRCodeAnalytics);

// QR Code Generation routes
router.post('/generate/table', authenticateToken, requireAuth, qrController.generateTableQRCode);
router.post('/generate/bulk', authenticateToken, requireAuth, qrController.bulkGenerateTableQRCodes);

// QR Code Management routes
router.put('/:qrCodeId/design', authenticateToken, requireAuth, qrController.updateQRCodeDesign);
router.delete('/:qrCodeId', authenticateToken, requireAuth, qrController.deleteQRCode);

// Test route to verify parameter routing
router.get('/test/:id', (req, res) => {
  res.json({ message: 'Test route working', id: req.params.id });
});

// Test DELETE route
router.delete('/test-delete/:id', (req, res) => {
  res.json({ message: 'Test DELETE route working', id: req.params.id });
});

// QR Code Export/Print routes
router.get('/print/:qrCodeId/:format', authenticateToken, requireAuth, qrController.generatePrintableQRCode);

// Public routes (for QR code access) - must be last to avoid conflicts
router.get('/table/:qrCode', qrController.getTableByQRCode);

module.exports = router; 