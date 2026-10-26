import { prisma } from '../src/lib/db';
import beautifulQRGenerator from '../src/lib/utils/beautifulQRGenerator';

async function migrate() {
  console.log('🔄 Starting QR Canonical Domain Migration...');
  const tables = await prisma.tables.findMany({
    orderBy: { table_number: 'asc' }
  });

  console.log(`Found ${tables.length} tables in database.`);

  for (const table of tables) {
    const tableNum = table.table_number;
    const canonicalQrUrl = `https://www.sangeet.hk/qr/table-${tableNum}`;
    
    console.log(`Migrating Table ${tableNum} (ID: ${table.id}) to ${canonicalQrUrl}...`);

    const qrCodeBuffer = await beautifulQRGenerator.generateBeautifulQRCode(
      tableNum, 
      canonicalQrUrl, 
      { theme: 'modern', design: 'classic' }
    );
    const qrCodeDataURL = `data:image/svg+xml;base64,${qrCodeBuffer.toString('base64')}`;

    await prisma.tables.update({
      where: { id: table.id },
      data: {
        qr_code_url: canonicalQrUrl,
        qr_code_data: qrCodeDataURL,
        design_settings: { theme: 'modern', design: 'classic' }
      }
    });

    console.log(`✅ Table ${tableNum} successfully updated.`);
  }

  // Verification step
  const updatedTables = await prisma.tables.findMany({
    orderBy: { table_number: 'asc' }
  });

  console.log('\n--- MIGRATION VERIFICATION ---');
  let allValid = true;
  for (const t of updatedTables) {
    const isCanonical = t.qr_code_url?.startsWith('https://www.sangeet.hk/qr/table-');
    const hasData = !!t.qr_code_data && t.qr_code_data.startsWith('data:image/svg+xml;base64,');
    console.log(`Table ${t.table_number.padEnd(3)}: URL=${t.qr_code_url} | Valid=${isCanonical && hasData}`);
    if (!isCanonical || !hasData) allValid = false;
  }

  if (allValid) {
    console.log('\n🎉 ALL TABLES VERIFIED WITH CANONICAL DOMAIN https://www.sangeet.hk!');
  } else {
    throw new Error('Migration verification failed for one or more tables.');
  }
}

migrate()
  .catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
