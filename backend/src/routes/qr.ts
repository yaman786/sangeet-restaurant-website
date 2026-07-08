import { Router } from 'express';
import * as qrController from '../controllers/qrController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Admin routes (require authentication)
router.get('/', authenticateToken, requireAdmin, qrController.getAllQRCodes);
router.get('/analytics/:qrCodeId', authenticateToken, requireAdmin, qrController.getQRCodeAnalytics);

// QR Code Generation routes
router.post('/generate/table', authenticateToken, requireAdmin, qrController.generateTableQRCode);
router.post('/generate/bulk', authenticateToken, requireAdmin, qrController.bulkGenerateTableQRCodes);

// QR Code Management routes
router.put('/:qrCodeId/design', authenticateToken, requireAdmin, qrController.updateQRCodeDesign);
router.delete('/:qrCodeId', authenticateToken, requireAdmin, qrController.deleteQRCode);

// Test routes
router.get('/test/:id', (req, res) => { res.json({ message: 'Test route working', id: req.params.id }); });
router.delete('/test-delete/:id', (req, res) => { res.json({ message: 'Test DELETE route working', id: req.params.id }); });

// QR Code Export/Print routes
router.get('/print/:qrCodeId/:format', authenticateToken, requireAdmin, qrController.generatePrintableQRCode);

// Public routes (for QR code access) - must be last to avoid conflicts
router.get('/table/:qrCode', qrController.getTableByQRCode);

export default router;