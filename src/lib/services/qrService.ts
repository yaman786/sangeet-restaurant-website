import { prisma } from '@/lib/db';
import { NotFoundError, ValidationError } from '@/lib/errors';
import beautifulQRGenerator from '../utils/beautifulQRGenerator';
import type { QRCodeRow, QRDesignDTO, BulkQRGenerateDTO } from '@/lib/types';

class QRService {
  async getTableByQRCode(qrCode: string): Promise<any> {
    const table = await prisma.tables.findFirst({
      where: { qr_code_url: { contains: qrCode }, is_active: true }
    });
    if (!table) throw new NotFoundError('Table not found');
    return table;
  }

  async generateTableQRCode(data: { tableNumber: string, theme?: string, colors?: any, design?: string, capacity?: number }): Promise<{ table: any, qrCode: any }> {
    const { tableNumber, theme, colors, design, capacity } = data;
    
    let table = await prisma.tables.findFirst({
      where: { table_number: tableNumber }
    });

    if (!table) {
      table = await prisma.tables.create({
        data: { table_number: tableNumber, capacity: capacity || 4, is_active: true, qr_code_url: '', qr_code_data: '' }
      });
    } else {
      table = await prisma.tables.update({
        where: { id: table.id },
        data: { capacity: capacity || table.capacity, is_active: true }
      });
    }
    
    const qrUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/qr/table-${tableNumber}`;
    const options = { theme: theme || 'modern', colors, design: design || 'classic' };
    
    const qrCodeBuffer = await beautifulQRGenerator.generateBeautifulQRCode(tableNumber, qrUrl, options);
    const qrCodeDataURL = `data:image/svg+xml;base64,${qrCodeBuffer.toString('base64')}`;
    
    const updatedTable = await prisma.tables.update({
      where: { id: table.id },
      data: { qr_code_url: qrUrl, qr_code_data: qrCodeDataURL, design_settings: options }
    });
    
    return {
      table: updatedTable,
      qrCode: { qr_code_id: updatedTable.id, table_number: updatedTable.table_number, qr_url: qrUrl, design: options }
    };
  }

  async getAllQRCodes(): Promise<any[]> {
    const tables = await prisma.tables.findMany({
      orderBy: { table_number: 'asc' }
    });
    return tables.map(t => ({
      id: t.id,
      table_id: t.id,
      table_number: t.table_number,
      capacity: t.capacity,
      location: t.table_name,
      qr_url: t.qr_code_url,
      qr_code_data: t.qr_code_data,
      design: t.design_settings,
      created_at: t.created_at,
      is_active: t.is_active
    }));
  }

  async getQRCodeAnalytics(qrCodeId: string): Promise<Record<string, any>> {
    const table = await prisma.tables.findUnique({
      where: { id: parseInt(qrCodeId, 10) }
    });
    if (!table) throw new NotFoundError('QR Code');
    
    return {
      totalScans: table.scan_count || 0,
      lastScanned: table.last_scanned_at
    };
  }

  async updateQRCodeDesign(qrCodeId: string, design: QRDesignDTO): Promise<any> {
    try {
      const table = await prisma.tables.update({
        where: { id: parseInt(qrCodeId, 10) },
        data: { design_settings: design as any }
      });
      return { qr_code_id: table.id, design: table.design_settings };
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundError('QR Code');
      throw e;
    }
  }

  async restoreQRCode(qrCodeId: string): Promise<void> {
    try {
      await prisma.tables.update({
        where: { id: parseInt(qrCodeId, 10) },
        data: { is_active: true }
      });
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundError('QR Code');
      throw e;
    }
  }

  async deleteQRCode(qrCodeId: string): Promise<void> {
    try {
      await prisma.tables.update({
        where: { id: parseInt(qrCodeId, 10) },
        data: { is_active: false }
      });
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundError('QR Code');
      throw e;
    }
  }

  async generatePrintableQRCode(qrCodeId: string, format: string, design: string, theme: string): Promise<{ qrCodeBuffer: Buffer, tableNumber: string }> {
    const table = await prisma.tables.findFirst({
      where: { id: parseInt(qrCodeId, 10), qr_code_url: { not: '' } }
    });
    if (!table) throw new NotFoundError('QR Code');
    
    const { table_number, qr_code_url } = table;
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

  async bulkGenerateTableQRCodes(data: BulkQRGenerateDTO): Promise<{ generated: any[], errors: any[] }> {
    const { tableNumbers, theme, design } = data;
    if (!tableNumbers || !Array.isArray(tableNumbers)) throw new ValidationError('tableNumbers must be an array');
    
    const generated = [];
    const errors = [];
    
    for (const tableNumber of tableNumbers) {
      try {
        const result = await this.generateTableQRCode({ 
          tableNumber: String(tableNumber), 
          theme, 
          design: design as any 
        });
        generated.push(result);
      } catch (error: any) {
        errors.push({ tableNumber, error: error.message });
      }
    }
    return { generated, errors };
  }
}

export default new QRService();
