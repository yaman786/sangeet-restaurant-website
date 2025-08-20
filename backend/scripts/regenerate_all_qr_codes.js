const { Pool } = require('pg');
const QRCode = require('qrcode');

// Use the live database URL from Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://sangeet_user:HDZKow9rZHJo8Tk5zs49reKXukJw4Qfo@dpg-d2bmmdhr0fns73fri8tg-a.oregon-postgres.render.com/sangeet_restaurant',
  ssl: { rejectUnauthorized: false }
});

async function regenerateAllQRCodes() {
  try {
    console.log('🔄 Regenerating all QR codes with correct URLs...');
    
    // Get all active tables
    const tablesResult = await pool.query(
      'SELECT * FROM tables WHERE is_active = true ORDER BY table_number'
    );

    console.log(`Found ${tablesResult.rows.length} active tables`);

    for (const table of tablesResult.rows) {
      const tableNumber = table.table_number;
      const correctUrl = `https://heartfelt-gnome-7178c3.netlify.app/qr/table-${tableNumber}`;
      
      console.log(`\n🔄 Regenerating QR code for Table ${tableNumber}...`);
      console.log(`   URL: ${correctUrl}`);
      
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

      try {
        const qrCodeDataURL = await QRCode.toDataURL(correctUrl, qrOptions);
        
        // Update the table with correct URL and QR code
        await pool.query(
          `UPDATE tables 
           SET qr_code_url = $1, qr_code_data = $2, updated_at = NOW()
           WHERE id = $3`,
          [correctUrl, qrCodeDataURL, table.id]
        );
        
        console.log(`✅ Successfully regenerated QR code for Table ${tableNumber}`);
        console.log(`   QR Code Size: ${qrCodeDataURL.length} characters`);
        
      } catch (qrError) {
        console.error(`❌ Error generating QR code for Table ${tableNumber}:`, qrError.message);
      }
    }

    console.log('\n🎉 All QR codes have been regenerated!');
    
    // Show the updated tables
    const updatedTables = await pool.query('SELECT table_number, qr_code_url FROM tables WHERE is_active = true ORDER BY table_number');
    console.log('\n📋 Updated QR Code URLs:');
    updatedTables.rows.forEach(table => {
      console.log(`   Table ${table.table_number}: ${table.qr_code_url}`);
    });
    
    await pool.end();
    console.log('\n✅ QR code regeneration completed!');
    console.log('\n📱 Next Steps:');
    console.log('   1. Go to your admin dashboard');
    console.log('   2. Navigate to QR Management');
    console.log('   3. Download/print the new QR codes');
    console.log('   4. Test scanning with your phone');
    
  } catch (error) {
    console.error('❌ Error regenerating QR codes:', error);
    process.exit(1);
  }
}

regenerateAllQRCodes();
