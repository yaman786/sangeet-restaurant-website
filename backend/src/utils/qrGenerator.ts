import logger from './logger';
import QRCode from 'qrcode';
import type { QRCodeResult } from '../types';

// Generate QR code for a table
export const generateQRCode = async (tableNumber: number | string, baseUrl = 'http://localhost:3000'): Promise<QRCodeResult> => {
  try {
    const qrUrl = `${baseUrl}/qr/table-${tableNumber}`;
    const qrCodeDataURL = await QRCode.toDataURL(qrUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#1d1b16',
        light: '#ffffff'
      }
    });
    
    return {
      tableNumber,
      qrUrl,
      qrCodeDataURL
    };
  } catch (error) {
    logger.error('Error generating QR code:', error);
    throw error;
  }
};

// Generate QR codes for all tables
export const generateAllQRCodes = async (baseUrl = 'http://localhost:3000'): Promise<QRCodeResult[]> => {
  try {
    const tables = [1, 2, 3, 4, 5]; // You can make this dynamic
    const qrCodes: QRCodeResult[] = [];
    
    for (const tableNumber of tables) {
      const qrCode = await generateQRCode(tableNumber, baseUrl);
      qrCodes.push(qrCode);
    }
    
    return qrCodes;
  } catch (error) {
    logger.error('Error generating all QR codes:', error);
    throw error;
  }
};