const qrService = require('../services/qrService');

const getTableByQRCode = async (req, res, next) => {
  try {
    const table = await qrService.getTableByQRCode(req.params.qrCode);
    res.json(table);
  } catch (error) {
    next(error);
  }
};

const generateTableQRCode = async (req, res, next) => {
  try {
    const result = await qrService.generateTableQRCode(req.body);
    res.json({
      success: true,
      table: result.table,
      qrCode: result.qrCode
    });
  } catch (error) {
    next(error);
  }
};

const getAllQRCodes = async (req, res, next) => {
  try {
    const tableQRCodes = await qrService.getAllQRCodes();
    res.json({ tableQRCodes });
  } catch (error) {
    next(error);
  }
};

const getQRCodeAnalytics = async (req, res, next) => {
  try {
    const analytics = await qrService.getQRCodeAnalytics(req.params.qrCodeId);
    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

const updateQRCodeDesign = async (req, res, next) => {
  try {
    const qrCode = await qrService.updateQRCodeDesign(req.params.qrCodeId, req.body.design);
    res.json({
      success: true,
      qrCode
    });
  } catch (error) {
    next(error);
  }
};

const deleteQRCode = async (req, res, next) => {
  try {
    await qrService.deleteQRCode(req.params.qrCodeId);
    res.json({
      success: true,
      message: 'Table QR code deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const generatePrintableQRCode = async (req, res, next) => {
  try {
    const { qrCodeId, format = 'png' } = req.params;
    const { design = 'classic', theme = 'modern' } = req.query;
    
    const { qrCodeBuffer, tableNumber } = await qrService.generatePrintableQRCode(qrCodeId, format, design, theme);

    res.setHeader('Content-Type', format === 'svg' ? 'image/svg+xml' : 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="sangeet-table-${tableNumber}-qr.${format}"`);
    res.setHeader('Content-Length', qrCodeBuffer.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    res.send(qrCodeBuffer);
  } catch (error) {
    next(error);
  }
};

const bulkGenerateTableQRCodes = async (req, res, next) => {
  try {
    const result = await qrService.bulkGenerateTableQRCodes(req.body);
    res.json({
      success: true,
      generated: result.generated,
      errors: result.errors,
      summary: {
        total: req.body.tableNumbers.length,
        successful: result.generated.length,
        failed: result.errors.length
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTableByQRCode,
  generateTableQRCode,
  getAllQRCodes,
  getQRCodeAnalytics,
  updateQRCodeDesign,
  deleteQRCode,
  generatePrintableQRCode,
  bulkGenerateTableQRCodes
};