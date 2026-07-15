import pool from '@/lib/db';
import { NotFoundError, ValidationError } from '@/lib/errors';
import beautifulQRGenerator from '../utils/beautifulQRGenerator';
import type { QRCodeRow } from '@/lib/types';

class QRService {
  async getTableByQRCode(qrCode: string): Promise<any> {
    const result = await pool.query('SELECT * FROM tables WHERE qr_code_url LIKE $1 AND is_active = true', [`%${qrCode}%`]);
    if (result.rows.length === 0) throw new NotFoundError('Table not found');
    return result.rows[0];
  }

  async generateTableQRCode(data: Record<string, any>): Promise<{ table: any, qrCode: QRCodeRow }> {
    const { tableNumber, theme, colors, design, capacity } = data;
    
    let tableId;
    const tableResult = await pool.query('SELECT * FROM tables WHERE table_number = $1', [tableNumber]);
    if (tableResult.rows.length === 0) {
      const insertResult = await pool.query(
        'INSERT INTO tables (table_number, capacity, is_active, qr_code_url, qr_code_data) VALUES ($1, $2, true, \'\', \'\') RETURNING id', 
        [tableNumber, capacity || 4]
      );
      tableId = insertResult.rows[0].id;
    } else {
      tableId = tableResult.rows[0].id;
      // Update capacity if provided and reactivate
      await pool.query(
        'UPDATE tables SET capacity = COALESCE($1, capacity), is_active = true WHERE id = $2',
        [capacity, tableId]
      );
    }
    
    const qrUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/qr/table-${tableNumber}`;
    const options = { theme: theme || 'modern', colors, design: design || 'classic' };
    
    const qrCodeBuffer = await beautifulQRGenerator.generateBeautifulQRCode(tableNumber, qrUrl, options);
    const qrCodeDataURL = `data:image/svg+xml;base64,${qrCodeBuffer.toString('base64')}`;
    
    const result = await pool.query(
      `UPDATE tables SET qr_code_url = $1, qr_code_data = $2, design_settings = $3 WHERE id = $4 
       RETURNING id as qr_code_id, table_number, qr_code_url as qr_url, design_settings as design`,
      [qrUrl, qrCodeDataURL, JSON.stringify(options), tableId]
    );
    
    const finalTable = await pool.query('SELECT * FROM tables WHERE id = $1', [tableId]);
    return { table: finalTable.rows[0], qrCode: result.rows[0] };
  }

  async getAllQRCodes(): Promise<QRCodeRow[]> {
    const result = await pool.query(`
      SELECT id, id as table_id, table_number, capacity, table_name as location, qr_code_url as qr_url, qr_code_data, design_settings as design, created_at, is_active
      FROM tables
      ORDER BY table_number ASC
    `);
    return result.rows;
  }

  async getQRCodeAnalytics(qrCodeId: string): Promise<Record<string, any>> {
    const qrResult = await pool.query('SELECT * FROM tables WHERE id = $1', [qrCodeId]);
    if (qrResult.rows.length === 0) throw new NotFoundError('QR Code');
    
    return {
      totalScans: parseInt(qrResult.rows[0].scan_count || '0', 10),
      lastScanned: qrResult.rows[0].last_scanned_at
    };
  }

  async updateQRCodeDesign(qrCodeId: string, design: Record<string, any>): Promise<QRCodeRow> {
    const result = await pool.query(
      'UPDATE tables SET design_settings = $1 WHERE id = $2 RETURNING id as qr_code_id, design_settings as design',
      [JSON.stringify(design), qrCodeId]
    );
    if (result.rows.length === 0) throw new NotFoundError('QR Code');
    return result.rows[0];
  }

  async restoreQRCode(qrCodeId: string): Promise<void> {
    const result = await pool.query('UPDATE tables SET is_active = true WHERE id = $1 RETURNING id', [qrCodeId]);
    if (result.rows.length === 0) throw new NotFoundError('QR Code');
  }

  async deleteQRCode(qrCodeId: string): Promise<void> {
    const result = await pool.query('UPDATE tables SET is_active = false WHERE id = $1 RETURNING id', [qrCodeId]);
    if (result.rows.length === 0) throw new NotFoundError('QR Code');
  }

  async generatePrintableQRCode(qrCodeId: string, format: string, design: string, theme: string): Promise<{ qrCodeBuffer: Buffer, tableNumber: string }> {
    const qrResult = await pool.query('SELECT * FROM tables WHERE id = $1 AND qr_code_url IS NOT NULL', [qrCodeId]);
    if (qrResult.rows.length === 0) throw new NotFoundError('QR Code');
    
    const { table_number, qr_code_url } = qrResult.rows[0];
    const options: any = { format: format === 'jpeg' ? 'jpeg' : 'png', theme };
    
    let qrCodeBuffer;
    if (design === 'premium') {
      qrCodeBuffer = await beautifulQRGenerator.generatePremiumDesign(table_number, qr_code_url, options);
    } else if (design === 'large') {
      qrCodeBuffer = await beautifulQRGenerator.generateLargeDesign(table_number, qr_code_url, options);
    } else {
      qrCodeBuffer = await beautifulQRGenerator.generateClassicDesign(table_number, qr_code_url, options);
    }
    
    return { qrCodeBuffer, tableNumber: table_number };
  }

  async bulkGenerateTableQRCodes(data: Record<string, any>): Promise<{ generated: any[], errors: any[] }> {
    const { tableNumbers, theme, design } = data;
    if (!tableNumbers || !Array.isArray(tableNumbers)) throw new ValidationError('tableNumbers must be an array');
    
    const generated = [];
    const errors = [];
    
    for (const tableNumber of tableNumbers) {
      try {
        const result = await this.generateTableQRCode({ tableNumber, theme, design });
        generated.push(result);
      } catch (error: any) {
        errors.push({ tableNumber, error: error.message });
      }
    }
    return { generated, errors };
  }
}

export default new QRService();
