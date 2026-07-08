import pool from '@/lib/db';
import { NotFoundError, ValidationError } from '@/lib/errors';
import beautifulQRGenerator from '../utils/beautifulQRGenerator';
import type { QRCodeRow, QRCodeResult } from '@/lib/types';

class QRService {
  async getTableByQRCode(qrCode: string): Promise<any> {
    const result = await pool.query('SELECT * FROM tables WHERE qr_code_url LIKE $1 AND is_active = true', [`%${qrCode}%`]);
    if (result.rows.length === 0) throw new NotFoundError('Table not found');
    return result.rows[0];
  }

  async generateTableQRCode(data: Record<string, any>): Promise<{ table: any, qrCode: QRCodeRow }> {
    const { tableNumber, theme, colors, design } = data;
    const tableResult = await pool.query('SELECT * FROM tables WHERE table_number = $1', [tableNumber]);
    if (tableResult.rows.length === 0) throw new NotFoundError(`Table ${tableNumber}`);
    
    const qrUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/qr/table-${tableNumber}`;
    const options = { theme: theme || 'modern', colors, design: design || 'classic' };
    
    const qrCodeBuffer = await beautifulQRGenerator.generateBeautifulQRCode(tableNumber, qrUrl, options);
    const qrCodeDataURL = `data:image/png;base64,${qrCodeBuffer.toString('base64')}`;
    
    const result = await pool.query(
      `INSERT INTO table_qr_codes (table_id, table_number, qr_url, qr_code_data, design) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [tableResult.rows[0].id, tableNumber, qrUrl, qrCodeDataURL, JSON.stringify(options)]
    );
    
    await pool.query('UPDATE tables SET qr_code_url = $1 WHERE id = $2', [qrUrl, tableResult.rows[0].id]);
    
    return { table: tableResult.rows[0], qrCode: result.rows[0] };
  }

  async getAllQRCodes(): Promise<QRCodeRow[]> {
    const result = await pool.query(`
      SELECT t.table_number, t.capacity, t.location, q.id as qr_code_id, q.qr_url, q.created_at, q.design
      FROM tables t
      LEFT JOIN table_qr_codes q ON t.id = q.table_id
      WHERE t.is_active = true
      ORDER BY t.table_number ASC
    `);
    return result.rows;
  }

  async getQRCodeAnalytics(qrCodeId: string): Promise<Record<string, any>> {
    const qrResult = await pool.query('SELECT * FROM table_qr_codes WHERE id = $1', [qrCodeId]);
    if (qrResult.rows.length === 0) throw new NotFoundError('QR Code');
    
    const scansResult = await pool.query('SELECT COUNT(*) FROM qr_code_scans WHERE qr_code_id = $1', [qrCodeId]);
    
    return {
      totalScans: parseInt(scansResult.rows[0].count, 10),
      lastScanned: null // Placeholder for now
    };
  }

  async updateQRCodeDesign(qrCodeId: string, design: Record<string, any>): Promise<QRCodeRow> {
    const result = await pool.query(
      'UPDATE table_qr_codes SET design = $1 WHERE id = $2 RETURNING *',
      [JSON.stringify(design), qrCodeId]
    );
    if (result.rows.length === 0) throw new NotFoundError('QR Code');
    return result.rows[0];
  }

  async deleteQRCode(qrCodeId: string): Promise<void> {
    const qrResult = await pool.query('SELECT * FROM table_qr_codes WHERE id = $1', [qrCodeId]);
    if (qrResult.rows.length === 0) throw new NotFoundError('QR Code');
    
    const tableId = qrResult.rows[0].table_id;
    await pool.query('DELETE FROM table_qr_codes WHERE id = $1', [qrCodeId]);
    await pool.query('UPDATE tables SET qr_code_url = NULL WHERE id = $1', [tableId]);
  }

  async generatePrintableQRCode(qrCodeId: string, format: string, design: string, theme: string): Promise<{ qrCodeBuffer: Buffer, tableNumber: string }> {
    const qrResult = await pool.query('SELECT * FROM table_qr_codes WHERE id = $1', [qrCodeId]);
    if (qrResult.rows.length === 0) throw new NotFoundError('QR Code');
    
    const { table_number, qr_url } = qrResult.rows[0];
    const options: any = { format: format === 'jpeg' ? 'jpeg' : 'png', theme };
    
    let qrCodeBuffer;
    if (design === 'premium') {
      qrCodeBuffer = await beautifulQRGenerator.generatePremiumDesign(table_number, qr_url, options);
    } else if (design === 'large') {
      qrCodeBuffer = await beautifulQRGenerator.generateLargeDesign(table_number, qr_url, options);
    } else {
      qrCodeBuffer = await beautifulQRGenerator.generateClassicDesign(table_number, qr_url, options);
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
