const pool = require('../config/database');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs').promises;

// Get table by QR code URL
const getTableByQRCode = async (req, res) => {
  try {
    const { qrCode } = req.params;
    const result = await pool.query(
      'SELECT * FROM tables WHERE qr_code_url LIKE $1 AND is_active = true',
      [`%${qrCode}%`]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching table:', error);
    res.status(500).json({ error: 'Failed to fetch table' });
  }
};

// Generate QR code for a table
const generateTableQRCode = async (req, res) => {
  try {
    const { tableNumber, customUrl, design } = req.body;
    
    if (!tableNumber) {
      return res.status(400).json({ error: 'Table number is required' });
    }

    // Check if table already has an active QR code with data
    const existingTable = await pool.query(
      'SELECT * FROM tables WHERE table_number = $1 AND is_active = true AND qr_code_data IS NOT NULL',
      [tableNumber]
    );

    if (existingTable.rows.length > 0) {
      return res.status(400).json({ error: 'Table already has a QR code' });
    }

    // If there's an inactive table with the same number, reactivate it
    const inactiveTable = await pool.query(
      'SELECT * FROM tables WHERE table_number = $1 AND is_active = false',
      [tableNumber]
    );

    if (inactiveTable.rows.length > 0) {
      // Reactivate the existing table with new QR code
      const baseUrl = process.env.CLIENT_URL || 'https://heartfelt-gnome-7178c3.netlify.app';
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
      
      const result = await pool.query(
        `UPDATE tables 
         SET qr_code_url = $1, qr_code_data = $2, design_settings = $3, is_active = true, updated_at = NOW()
         WHERE table_number = $4 RETURNING *`,
        [qrUrl, qrCodeDataURL, JSON.stringify(design || {}), tableNumber]
      );

      res.json({
        success: true,
        table: result.rows[0],
        qrCode: {
          url: qrUrl,
          dataURL: qrCodeDataURL,
          tableNumber
        }
      });
      return;
    }

    // Generate QR URL with automatic live URL detection
    let baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    
    // For production, use the Netlify frontend URL
    if (!process.env.CLIENT_URL) {
      // Try to get the frontend URL from environment or use a default
      baseUrl = process.env.FRONTEND_URL || 'https://heartfelt-gnome-7178c3.netlify.app';
      console.log(`🌐 Using frontend URL: ${baseUrl}`);
    }
    
    const qrUrl = customUrl || `${baseUrl}/qr/table-${tableNumber}`;
    
    // Log the generated URL for debugging
    console.log(`🔗 Generated QR URL for Table ${tableNumber}: ${qrUrl}`);
    
    // Generate QR code with custom design
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
    
    // Check if table exists (with or without QR code)
    const existingTableCheck = await pool.query(
      'SELECT * FROM tables WHERE table_number = $1',
      [tableNumber]
    );

    let result;
    if (existingTableCheck.rows.length > 0) {
      // Update existing table with new QR code
      result = await pool.query(
        `UPDATE tables 
         SET qr_code_url = $1, qr_code_data = $2, design_settings = $3, is_active = true, updated_at = NOW()
         WHERE table_number = $4 RETURNING *`,
        [qrUrl, qrCodeDataURL, JSON.stringify(design || {}), tableNumber]
      );
    } else {
      // Insert new table with QR code
      result = await pool.query(
        `INSERT INTO tables (table_number, qr_code_url, qr_code_data, design_settings)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [tableNumber, qrUrl, qrCodeDataURL, JSON.stringify(design || {})]
      );
    }

    res.json({
      success: true,
      table: result.rows[0],
      qrCode: {
        url: qrUrl,
        dataURL: qrCodeDataURL,
        tableNumber
      }
    });
  } catch (error) {
    console.error('Error generating table QR code:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
};



// Get all table QR codes with analytics
const getAllQRCodes = async (req, res) => {
  try {
    // Get table QR codes with order analytics
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

    res.json({
      tableQRCodes: tableQRCodes.rows
    });
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    res.status(500).json({ error: 'Failed to fetch QR codes' });
  }
};

// Get table QR code analytics
const getQRCodeAnalytics = async (req, res) => {
  try {
    const { qrCodeId } = req.params;
    
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
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching QR analytics:', error);
    res.status(500).json({ error: 'Failed to fetch QR analytics' });
  }
};

// Update table QR code design
const updateQRCodeDesign = async (req, res) => {
  try {
    const { qrCodeId } = req.params;
    const { design } = req.body;

    if (!design) {
      return res.status(400).json({ error: 'Design settings are required' });
    }

    const query = `
      UPDATE tables 
      SET design_settings = $1, updated_at = NOW()
      WHERE id = $2 RETURNING *
    `;

    const result = await pool.query(query, [JSON.stringify(design), qrCodeId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }

    res.json({
      success: true,
      qrCode: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating QR design:', error);
    res.status(500).json({ error: 'Failed to update QR design' });
  }
};

// Delete table QR code
const deleteQRCode = async (req, res) => {
  try {
    const { qrCodeId } = req.params;

    // Check if table has active (non-completed) orders
    const ordersCheck = await pool.query(
      'SELECT COUNT(*) FROM orders WHERE table_id = $1 AND status != $2',
      [qrCodeId, 'completed']
    );

    if (parseInt(ordersCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete table QR code with active orders. Please complete all orders first.' 
      });
    }

    const query = 'UPDATE tables SET is_active = false, qr_code_data = NULL, qr_code_url = \'deleted-table-\' || table_number, design_settings = \'{}\' WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [qrCodeId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }

    res.json({
      success: true,
      message: 'Table QR code deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting QR code:', error);
    res.status(500).json({ error: 'Failed to delete QR code' });
  }
};

// Generate printable table QR code
const generatePrintableQRCode = async (req, res) => {
  try {
    const { qrCodeId, format = 'png' } = req.params;
    const { design = 'classic', theme = 'modern' } = req.query; // classic, compact, large, premium + modern, elegant, premium, classic, gold
    
    const query = 'SELECT * FROM tables WHERE id = $1';
    const result = await pool.query(query, [qrCodeId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }

    const qrCode = result.rows[0];
    const qrUrl = qrCode.qr_code_url;
    const tableNumber = qrCode.table_number;

    // Import the beautiful QR generator
    const BeautifulQRGenerator = require('../utils/beautifulQRGenerator');

    let qrCodeBuffer;
    try {
      console.log(`Generating QR code for table ${tableNumber} with design: ${design}, theme: ${theme}, format: ${format}`);
      
      // Generate beautiful QR code based on design preference
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
      
      console.log(`Successfully generated QR code buffer, size: ${qrCodeBuffer.length} bytes`);
    } catch (error) {
      console.error('Error generating beautiful QR code, falling back to basic QR:', error);
      // Fallback to basic QR code if beautiful generation fails
      const qrOptions = {
        width: 600,
        margin: 4,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      };

      if (format === 'svg') {
        qrCodeBuffer = await QRCode.toString(qrUrl, qrOptions);
      } else {
        qrCodeBuffer = await QRCode.toBuffer(qrUrl, qrOptions);
      }
      
      console.log(`Fallback QR code generated, size: ${qrCodeBuffer.length} bytes`);
    }

    // Set proper headers for image download
    res.setHeader('Content-Type', format === 'svg' ? 'image/svg+xml' : 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="sangeet-table-${tableNumber}-qr.${format}"`);
    res.setHeader('Content-Length', qrCodeBuffer.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    console.log(`Sending QR code response: ${qrCodeBuffer.length} bytes, Content-Type: ${format === 'svg' ? 'image/svg+xml' : 'image/png'}`);
    res.send(qrCodeBuffer);
  } catch (error) {
    console.error('Error generating printable QR code:', error);
    res.status(500).json({ error: 'Failed to generate printable QR code' });
  }
};

// Bulk generate QR codes for tables
const bulkGenerateTableQRCodes = async (req, res) => {
  try {
    const { tableNumbers, baseUrl, design } = req.body;
    
    if (!Array.isArray(tableNumbers) || tableNumbers.length === 0) {
      return res.status(400).json({ error: 'Table numbers array is required' });
    }

    const results = [];
    const errors = [];

    for (const tableNumber of tableNumbers) {
      try {
        // Check if table already has an active QR code
        const existingTable = await pool.query(
          'SELECT * FROM tables WHERE table_number = $1 AND is_active = true',
          [tableNumber]
        );

        if (existingTable.rows.length > 0) {
          errors.push(`Table ${tableNumber} already has a QR code`);
          continue;
        }

        // Check if there's an inactive table to reactivate
        const inactiveTable = await pool.query(
          'SELECT * FROM tables WHERE table_number = $1 AND is_active = false',
          [tableNumber]
        );

        if (inactiveTable.rows.length > 0) {
                  // Reactivate the existing table with new QR code
        const qrUrl = `${baseUrl || 'https://heartfelt-gnome-7178c3.netlify.app'}/qr/table-${tableNumber}`;
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
          
          const result = await pool.query(
            `UPDATE tables 
             SET qr_code_url = $1, qr_code_data = $2, design_settings = $3, is_active = true, updated_at = NOW()
             WHERE table_number = $4 RETURNING *`,
            [qrUrl, qrCodeDataURL, JSON.stringify(design || {}), tableNumber]
          );

          results.push(result.rows[0]);
          continue;
        }

        // Generate QR code
        const qrUrl = `${baseUrl || 'https://heartfelt-gnome-7178c3.netlify.app'}/qr/table-${tableNumber}`;
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
        
        // Save to database
        const result = await pool.query(
          `INSERT INTO tables (table_number, qr_code_url, qr_code_data, design_settings)
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [tableNumber, qrUrl, qrCodeDataURL, JSON.stringify(design || {})]
        );

        results.push(result.rows[0]);
      } catch (error) {
        errors.push(`Failed to generate QR for table ${tableNumber}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      generated: results,
      errors: errors,
      summary: {
        total: tableNumbers.length,
        successful: results.length,
        failed: errors.length
      }
    });
  } catch (error) {
    console.error('Error bulk generating QR codes:', error);
    res.status(500).json({ error: 'Failed to bulk generate QR codes' });
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