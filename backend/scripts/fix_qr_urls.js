const { Pool } = require('pg');
const QRCode = require('qrcode');

// Use the live database URL from Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://sangeet_user:HDZKow9rZHJo8Tk5zs49reKXukJw4Qfo@dpg-d2bmmdhr0fns73fri8tg-a.oregon-postgres.render.com/sangeet_restaurant',
  ssl: { rejectUnauthorized: false }
});

async function fixQrUrls() {
  try {
    console.log('🔧 Fixing QR code URLs in live database...');
    
    // Get all tables with QR codes
    const tablesResult = await pool.query(
      'SELECT * FROM tables WHERE qr_code_url LIKE \'*/qr/table-%\''
    );

    console.log(`Found ${tablesResult.rows.length} tables with incorrect QR URLs`);

    for (const table of tablesResult.rows) {
      const tableNumber = table.table_number;
      const correctUrl = `https://heartfelt-gnome-7178c3.netlify.app/qr/table-${tableNumber}`;
      
      console.log(`Fixing Table ${tableNumber}: ${table.qr_code_url} → ${correctUrl}`);
      
      // Generate new QR code with correct URL
      const qrOptions = {
        width: 300,
        margin: 2,
        color: {
          dark: '#1d1b16',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      };

      const qrCodeDataURL = await QRCode.toDataURL(correctUrl, qrOptions);
      
      // Update the table with correct URL and QR code
      await pool.query(
        `UPDATE tables 
         SET qr_code_url = $1, qr_code_data = $2, updated_at = NOW()
         WHERE id = $3`,
        [correctUrl, qrCodeDataURL, table.id]
      );
      
      console.log(`✅ Fixed Table ${tableNumber}`);
    }

    console.log('🎉 All QR code URLs have been fixed!');
    
    // Show the updated tables
    const updatedTables = await pool.query('SELECT table_number, qr_code_url FROM tables WHERE is_active = true');
    console.log('\n📋 Updated QR Code URLs:');
    updatedTables.rows.forEach(table => {
      console.log(`   Table ${table.table_number}: ${table.qr_code_url}`);
    });
    
    await pool.end();
    console.log('✅ Fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing QR URLs:', error);
    process.exit(1);
  }
}

fixQrUrls();
