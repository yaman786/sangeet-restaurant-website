import { prisma } from '@/lib/db';
import { NotFoundError, ValidationError } from '@/lib/errors';
import beautifulQRGenerator from '../utils/beautifulQRGenerator';
import type { QRDesignDTO, BulkQRGenerateDTO } from '@/lib/types';

class QRService {
  private safeDecode(value: string): string {
    try {
      return decodeURIComponent(value).trim();
    } catch {
      throw new ValidationError('Invalid URL-encoded table identifier');
    }
  }

  private parseTableId(qrCodeId: string): number {
    const id = Number.parseInt(qrCodeId, 10);
    if (!Number.isInteger(id) || id <= 0) {
      throw new ValidationError('Invalid QR Code ID');
    }
    return id;
  }

  async getTableByQRCode(qrCode: string, options?: { allowIdFallback?: boolean }): Promise<any> {
    const rawQr = this.safeDecode(qrCode);
    const strippedSlug = rawQr
      .replace(/^https?:\/\/[^\/]+\/qr\//i, '')
      .replace(/^\/qr\//i, '')
      .trim();
    const strippedNumber = strippedSlug
      .replace(/^table[-_\s]?/i, '')
      .replace(/^tb[-_\s]?/i, '')
      .trim();

    // 1. Try exact table_number match first
    let table = await prisma.tables.findFirst({
      where: {
        OR: [
          { table_number: { equals: strippedNumber, mode: 'insensitive' } },
          { table_number: { equals: strippedSlug, mode: 'insensitive' } },
          { table_number: { equals: rawQr, mode: 'insensitive' } }
        ],
        is_active: true
      }
    });

    // 2. Try exact or boundary-safe QR url match
    if (!table) {
      table = await prisma.tables.findFirst({
        where: {
          OR: [
            { qr_code_url: { equals: rawQr, mode: 'insensitive' } },
            { qr_code_url: { endsWith: `/qr/table-${strippedNumber}`, mode: 'insensitive' } },
            { qr_code_url: { endsWith: `/qr/${strippedSlug}`, mode: 'insensitive' } }
          ],
          is_active: true
        }
      });
    }

    // 3. Optional fallback to primary key id if query is pure number
    if (!table && options?.allowIdFallback && !Number.isNaN(Number(strippedNumber)) && Number(strippedNumber) > 0) {
      table = await prisma.tables.findFirst({
        where: { id: Number(strippedNumber), is_active: true }
      });
    }

    if (!table) throw new NotFoundError('Table');
    return table;
  }

  async generateTableQRCode(data: { tableNumber: string, theme?: string, colors?: any, design?: string, capacity?: number, customUrl?: string }): Promise<{ table: any, qrCode: any }> {
    const { tableNumber, theme, colors, design, capacity, customUrl } = data;
    
    let table = await prisma.tables.findFirst({
      where: { table_number: tableNumber }
    });

    if (!table) {
      // Auto-create the table if it doesn't exist (unified model)
      table = await prisma.tables.create({
        data: { table_number: tableNumber, capacity: capacity || 4, is_active: true }
      });
    } else if (capacity && capacity !== table.capacity) {
      // Update capacity if explicitly provided and different
      table = await prisma.tables.update({
        where: { id: table.id },
        data: { capacity, is_active: true }
      });
    }
    
    const envUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.FRONTEND_URL;
    const canonicalDomain = (envUrl && !envUrl.includes('vercel.app'))
      ? envUrl.replace(/\/+$/, '')
      : 'https://www.sangeet.hk';
    const qrUrl = customUrl?.trim() || `${canonicalDomain}/qr/table-${tableNumber}`;
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
      table_type: t.table_type,
      status: t.status,
      location: t.table_name,
      qr_code_url: t.qr_code_url,
      qr_url: t.qr_code_url,
      qr_code_data: t.qr_code_data,
      design: t.design_settings,
      created_at: t.created_at,
      is_active: t.is_active
    }));
  }

  async getQRCodeAnalytics(qrCodeId: string): Promise<Record<string, any>> {
    const id = this.parseTableId(qrCodeId);
    const table = await prisma.tables.findUnique({
      where: { id }
    });
    if (!table) throw new NotFoundError('QR Code');
    
    return {
      totalScans: table.scan_count || 0,
      lastScanned: table.last_scanned_at
    };
  }

  async updateQRCodeDesign(qrCodeId: string, design: QRDesignDTO): Promise<any> {
    const id = this.parseTableId(qrCodeId);
    try {
      const table = await prisma.tables.update({
        where: { id },
        data: { design_settings: design as any }
      });
      return { qr_code_id: table.id, design: table.design_settings };
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundError('QR Code');
      throw e;
    }
  }

  async restoreQRCode(qrCodeId: string): Promise<void> {
    const id = this.parseTableId(qrCodeId);
    try {
      await prisma.tables.update({
        where: { id },
        data: { is_active: true }
      });
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundError('QR Code');
      throw e;
    }
  }

  async deleteQRCode(qrCodeId: string): Promise<void> {
    const id = this.parseTableId(qrCodeId);
    try {
      await prisma.tables.update({
        where: { id },
        data: { is_active: false }
      });
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundError('QR Code');
      throw e;
    }
  }

  async generatePrintableQRCode(qrCodeId: string, format: string, design: string, theme: string): Promise<{ qrCodeBuffer: Buffer, tableNumber: string }> {
    const id = this.parseTableId(qrCodeId);
    const table = await prisma.tables.findFirst({
      where: { id, qr_code_url: { not: '' } }
    });
    if (!table || !table.qr_code_url) throw new NotFoundError('QR Code');
    
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
