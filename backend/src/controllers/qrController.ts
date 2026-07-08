import { Request, Response, NextFunction } from 'express';
import qrService from '../services/qrService';

export const getTableByQRCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const table = await qrService.getTableByQRCode(req.params.qrCode); res.json(table); } catch (error) { next(error); }
};
export const generateTableQRCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const result = await qrService.generateTableQRCode(req.body); res.json({ success: true, table: result.table, qrCode: result.qrCode }); } catch (error) { next(error); }
};
export const getAllQRCodes = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const tableQRCodes = await qrService.getAllQRCodes(); res.json({ tableQRCodes }); } catch (error) { next(error); }
};
export const getQRCodeAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const analytics = await qrService.getQRCodeAnalytics(req.params.qrCodeId); res.json(analytics); } catch (error) { next(error); }
};
export const updateQRCodeDesign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const qrCode = await qrService.updateQRCodeDesign(req.params.qrCodeId, req.body.design); res.json({ success: true, qrCode }); } catch (error) { next(error); }
};
export const deleteQRCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { await qrService.deleteQRCode(req.params.qrCodeId); res.json({ success: true, message: 'Table QR code deleted successfully' }); } catch (error) { next(error); }
};
export const generatePrintableQRCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { qrCodeId, format = 'png' } = req.params;
    const { design = 'classic', theme = 'modern' } = req.query as Record<string, string>;
    const { qrCodeBuffer, tableNumber } = await qrService.generatePrintableQRCode(qrCodeId, format, design, theme);
    res.setHeader('Content-Type', format === 'svg' ? 'image/svg+xml' : 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="sangeet-table-${tableNumber}-qr.${format}"`);
    res.setHeader('Content-Length', qrCodeBuffer.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(qrCodeBuffer);
  } catch (error) { next(error); }
};
export const bulkGenerateTableQRCodes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await qrService.bulkGenerateTableQRCodes(req.body);
    res.json({ success: true, generated: result.generated, errors: result.errors, summary: { total: req.body.tableNumbers.length, successful: result.generated.length, failed: result.errors.length } });
  } catch (error) { next(error); }
};
