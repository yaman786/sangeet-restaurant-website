const pool = require('../config/database');
const QRCode = require('qrcode');
const { NotFoundError, ValidationError } = require('../utils/errors');
const config = require('../config/env');
const logger = require('../utils/logger');
const BeautifulQRGenerator = require('../utils/beautifulQRGenerator');

class QrService {
  async getTableByQRCode(qrCode) {
    const result = await pool.query(
      'SELECT * FROM tables WHERE qr_code_url LIKE $1 AND is_active = true',
      [`%${qrCode}%`]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Table');
    }

    return result.rows[0];
  }

  async generateTableQRCode(data) {
    const { tableNumber, customUrl, design, capacity = 4 } = data;
    
    if (!tableNumber) {
      throw new ValidationError('Table number is required');
    }

    const existingTable = await pool.query(
      'SELECT * FROM tables WHERE table_number = $1 AND is_active = true AND qr_code_data IS NOT NULL',
      [tableNumber]
    );

    if (existingTable.rows.length > 0) {
      throw new ValidationError('Table already has a QR code');
    }

    const inactiveTable = await pool.query(
      'SELECT * FROM tables WHERE table_number = $1 AND is_active = false',
      [tableNumber]
    );

    const baseUrl = config.CLIENT_URL || config.FRONTEND_URL || 'https://heartfelt-gnome-7178c3.netlify.app';
    const qrUrl = customUrl || `${baseUrl}/qr/table-${tableNumber}`;
    
    const qrOptions = {
      width: 300,
      margin: 2,
      color: {
        dark: design?.darkColor || '#1d1b16',
        light: design?.lightColor || '#ffffff'
      },
      errorCorrectionLevel: 'H'
    };

    const qrCodeDataURL = await QRCode.toDataURL(qrUrl, qrOptions);

    let result;
    if (inactiveTable.rows.length > 0) {
      result = await pool.query(
        `UPDATE tables 
         SET qr_code_url = $1, qr_code_data = $2, design_settings = $3, capacity = $4, is_active = true, updated_at = NOW()
         WHERE table_number = $5 RETURNING *`,
        [qrUrl, qrCodeDataURL, JSON.stringify(design || {}), capacity, tableNumber]
      );
    } else {
      const existingTableCheck = await pool.query(
        'SELECT * FROM tables WHERE table_number = $1',
        [tableNumber]
      );

      if (existingTableCheck.rows.length > 0) {
        result = await pool.query(
          `UPDATE tables 
           SET qr_code_url = $1, qr_code_data = $2, design_settings = $3, capacity = $4, is_active = true, updated_at = NOW()
           WHERE table_number = $5 RETURNING *`,
          [qrUrl, qrCodeDataURL, JSON.stringify(design || {}), capacity, tableNumber]
        );
      } else {
        result = await pool.query(
          `INSERT INTO tables (table_number, qr_code_url, qr_code_data, design_settings, capacity)
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [tableNumber, qrUrl, qrCodeDataURL, JSON.stringify(design || {}), capacity]
        );
      }
    }

    return {
      table: result.rows[0],
      qrCode: { url: qrUrl, dataURL: qrCodeDataURL, tableNumber }
    };
  }

  async getAllQRCodes() {
    const tableQRCodes = await pool.query(`
      SELECT 
        t.*,
        COUNT(o.id) as total_orders,
        COUNT(CASE WHEN o.status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN o.status != 'completed' THEN 1 END) as active_orders,
        SUM(o.total_amount) as total_revenue,
        MAX(o.created_at) as last_order_date
      FROM tables t
      LEFT JOIN orders o ON t.id = o.table_id
      WHERE t.is_active = true
      GROUP BY t.id
      ORDER BY t.table_number
    `);
    return tableQRCodes.rows;
  }

  async getQRCodeAnalytics(qrCodeId) {
    const query = `
      SELECT 
        t.table_number,
        COUNT(o.id) as total_orders,
        COUNT(CASE WHEN o.status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN o.status != 'completed' THEN 1 END) as active_orders,
        COUNT(CASE WHEN o.status = 'cancelled' THEN 1 END) as cancelled_orders,
        SUM(o.total_amount) as total_revenue,
        AVG(o.total_amount) as avg_order_value,
        MIN(o.created_at) as first_order,
        MAX(o.created_at) as last_order,
        COUNT(DISTINCT DATE(o.created_at)) as active_days
      FROM tables t
      LEFT JOIN orders o ON t.id = o.table_id
      WHERE t.id = $1
      GROUP BY t.id, t.table_number
    `;

    const result = await pool.query(query, [qrCodeId]);
    if (result.rows.length === 0) throw new NotFoundError('Table');
    return result.rows[0];
  }

  async updateQRCodeDesign(qrCodeId, design) {
    if (!design) throw new ValidationError('Design settings are required');

    const query = `
      UPDATE tables 
      SET design_settings = $1, updated_at = NOW()
      WHERE id = $2 RETURNING *
    `;

    const result = await pool.query(query, [JSON.stringify(design), qrCodeId]);
    if (result.rows.length === 0) throw new NotFoundError('Table');
    return result.rows[0];
  }

  async deleteQRCode(qrCodeId) {
    const ordersCheck = await pool.query(
      'SELECT COUNT(*) FROM orders WHERE table_id = $1 AND status != $2',
      [qrCodeId, 'completed']
    );

    if (parseInt(ordersCheck.rows[0].count) > 0) {
      throw new ValidationError('Cannot delete table QR code with active orders. Please complete all orders first.');
    }

    const query = 'UPDATE tables SET is_active = false, qr_code_data = NULL, qr_code_url = \'deleted-table-\' || table_number, design_settings = \'{}\' WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [qrCodeId]);
    
    if (result.rows.length === 0) throw new NotFoundError('Table');
    return { success: true };
  }

  async generatePrintableQRCode(qrCodeId, format, design, theme) {
    const query = 'SELECT * FROM tables WHERE id = $1';
    const result = await pool.query(query, [qrCodeId]);
    
    if (result.rows.length === 0) throw new NotFoundError('Table');

    const qrCode = result.rows[0];
    const qrUrl = qrCode.qr_code_url;
    const tableNumber = qrCode.table_number;

    let qrCodeBuffer;
    try {
      switch (design) {
        case 'large':
          qrCodeBuffer = await BeautifulQRGenerator.generateLargeDesign(tableNumber, qrUrl, { format, theme });
          break;
        case 'premium':
          qrCodeBuffer = await BeautifulQRGenerator.generatePremiumDesign(tableNumber, qrUrl, { format, theme });
          break;
        case 'classic':
        default:
          qrCodeBuffer = await BeautifulQRGenerator.generateClassicDesign(tableNumber, qrUrl, { format, theme });
          break;
      }
    } catch (error) {
      logger.error('Error generating beautiful QR code, falling back to basic QR:', error);
      const qrOptions = {
        width: 600, margin: 4,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'H'
      };
      if (format === 'svg') {
        qrCodeBuffer = await QRCode.toString(qrUrl, qrOptions);
      } else {
        qrCodeBuffer = await QRCode.toBuffer(qrUrl, qrOptions);
      }
    }

    return { qrCodeBuffer, tableNumber };
  }

  async bulkGenerateTableQRCodes(data) {
    const { tableNumbers, baseUrl, design, capacity = 4 } = data;
    if (!Array.isArray(tableNumbers) || tableNumbers.length === 0) {
      throw new ValidationError('Table numbers array is required');
    }

    const results = [];
    const errors = [];
    const baseQrUrl = baseUrl || config.CLIENT_URL || config.FRONTEND_URL || 'https://heartfelt-gnome-7178c3.netlify.app';

    for (const tableNumber of tableNumbers) {
      try {
        const existingTable = await pool.query(
          'SELECT * FROM tables WHERE table_number = $1 AND is_active = true',
          [tableNumber]
        );

        if (existingTable.rows.length > 0) {
          errors.push(`Table ${tableNumber} already has a QR code`);
          continue;
        }

        const qrUrl = `${baseQrUrl}/qr/table-${tableNumber}`;
        const qrOptions = {
          width: 300, margin: 2,
          color: {
            dark: design?.darkColor || '#1d1b16',
            light: design?.lightColor || '#ffffff'
          },
          errorCorrectionLevel: 'H'
        };

        const qrCodeDataURL = await QRCode.toDataURL(qrUrl, qrOptions);

        const inactiveTable = await pool.query(
          'SELECT * FROM tables WHERE table_number = $1 AND is_active = false',
          [tableNumber]
        );

        let result;
        if (inactiveTable.rows.length > 0) {
          result = await pool.query(
            `UPDATE tables 
             SET qr_code_url = $1, qr_code_data = $2, design_settings = $3, capacity = $4, is_active = true, updated_at = NOW()
             WHERE table_number = $5 RETURNING *`,
            [qrUrl, qrCodeDataURL, JSON.stringify(design || {}), capacity, tableNumber]
          );
        } else {
          result = await pool.query(
            `INSERT INTO tables (table_number, qr_code_url, qr_code_data, design_settings, capacity)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [tableNumber, qrUrl, qrCodeDataURL, JSON.stringify(design || {}), capacity]
          );
        }
        results.push(result.rows[0]);
      } catch (error) {
        errors.push(`Failed to generate QR for table ${tableNumber}: ${error.message}`);
      }
    }

    return { generated: results, errors };
  }
}

module.exports = new QrService();
