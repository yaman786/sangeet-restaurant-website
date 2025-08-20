const QRCode = require('qrcode');

// Generate QR code for a table
const generateQRCode = async (tableNumber, baseUrl = 'http://localhost:3000') => {
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
    console.error('Error generating QR code:', error);
    throw error;
  }
};

// Generate QR codes for all tables
const generateAllQRCodes = async (baseUrl = 'http://localhost:3000') => {
  try {
    const tables = [1, 2, 3, 4, 5]; // You can make this dynamic
    const qrCodes = [];
    
    for (const tableNumber of tables) {
      const qrCode = await generateQRCode(tableNumber, baseUrl);
      qrCodes.push(qrCode);
    }
    
    return qrCodes;
  } catch (error) {
    console.error('Error generating all QR codes:', error);
    throw error;
  }
};

module.exports = {
  generateQRCode,
  generateAllQRCodes
}; 