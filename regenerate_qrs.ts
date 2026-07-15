import { prisma } from './src/lib/db';
import beautifulQRGenerator from './src/lib/utils/beautifulQRGenerator';

async function main() {
  const qrCodes = await prisma.tables.findMany();
  for (const qr of qrCodes) {
    console.log(`Regenerating QR for table ${qr.table_number}...`);
    const svgBuffer = await beautifulQRGenerator.generateBeautifulQRCode(qr.table_number, qr.qr_code_url || `https://frontend-six-xi-10.vercel.app/qr/table-${qr.table_number}`);
    
    const svgBase64 = `data:image/svg+xml;base64,${svgBuffer.toString('base64')}`;
    
    await prisma.tables.update({
      where: { id: qr.id },
      data: { qr_code_data: svgBase64 }
    });
  }
  console.log('All QR codes regenerated successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
