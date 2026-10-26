import { prisma } from '../src/lib/db';
import beautifulQRGenerator from '../src/lib/utils/beautifulQRGenerator';

async function testFullQRCrud() {
  console.log('=== Step 1: Clean Database Tables ===');
  // Detach any orders and reservations pointing to tables so FK constraints are not violated
  await prisma.orders.updateMany({ data: { table_id: null } });
  await prisma.reservations.updateMany({ data: { table_id: null } });
  
  // Delete all tables
  const deleteResult = await prisma.tables.deleteMany({});
  console.log(`Deleted ${deleteResult.count} existing tables. DB is now 100% clean.`);
  
  const zeroCheck = await prisma.tables.count();
  console.log(`Current table count in DB: ${zeroCheck}`);
  if (zeroCheck !== 0) throw new Error('Database cleanup failed!');

  console.log('\n=== Step 2: Test Single Table (Table 1) CRUD from Scratch ===');

  // 1. CREATE Table 1
  const canonicalDomain = 'https://www.sangeet.hk';
  const qrUrl1 = `${canonicalDomain}/qr/table-1`;
  const options = { theme: 'modern', design: 'classic' };
  const qrCodeBuffer = await beautifulQRGenerator.generateBeautifulQRCode('1', qrUrl1, options);
  const qrCodeDataURL = `data:image/svg+xml;base64,${qrCodeBuffer.toString('base64')}`;

  const createdTable = await prisma.tables.create({
    data: {
      table_number: '1',
      capacity: 4,
      table_type: 'standard',
      qr_code_url: qrUrl1,
      qr_code_data: qrCodeDataURL,
      design_settings: options,
      is_active: true
    }
  });

  console.log(`✅ [CREATE] Created Table 1 (ID: ${createdTable.id}):`);
  console.log(`   - table_number: ${createdTable.table_number}`);
  console.log(`   - qr_code_url: ${createdTable.qr_code_url}`);
  console.log(`   - has qr_code_data: ${!!createdTable.qr_code_data}`);

  if (createdTable.qr_code_url !== 'https://www.sangeet.hk/qr/table-1') {
    throw new Error(`Invalid QR URL on create: ${createdTable.qr_code_url}`);
  }

  // 2. READ Table 1
  const readTable = await prisma.tables.findUnique({
    where: { id: createdTable.id }
  });
  console.log(`✅ [READ] Successfully retrieved Table 1 from DB. Status: ${readTable?.status}, Active: ${readTable?.is_active}`);

  // 3. UPDATE Table 1
  const updatedTable = await prisma.tables.update({
    where: { id: createdTable.id },
    data: {
      capacity: 6,
      table_type: 'booth',
      table_name: 'Window Side'
    }
  });
  console.log(`✅ [UPDATE] Table 1 updated: capacity=${updatedTable.capacity}, type=${updatedTable.table_type}, location=${updatedTable.table_name}`);
  if (updatedTable.capacity !== 6 || updatedTable.table_type !== 'booth') {
    throw new Error('Update verification failed!');
  }

  // 4. SOFT DELETE (Archive)
  const archivedTable = await prisma.tables.update({
    where: { id: createdTable.id },
    data: { is_active: false }
  });
  console.log(`✅ [ARCHIVE] Table 1 soft deleted. is_active: ${archivedTable.is_active}`);

  // 5. RESTORE
  const restoredTable = await prisma.tables.update({
    where: { id: createdTable.id },
    data: { is_active: true }
  });
  console.log(`✅ [RESTORE] Table 1 restored. is_active: ${restoredTable.is_active}`);

  // 6. PERMANENT DELETE
  await prisma.tables.delete({
    where: { id: createdTable.id }
  });
  const postDeleteCount = await prisma.tables.count();
  console.log(`✅ [PERMANENT DELETE] Table 1 deleted. Total tables in DB: ${postDeleteCount}`);

  console.log('\n=== Step 3: Populate Pristine Production Tables (Tables 1 to 10) ===');
  const tableConfigs = [
    { num: '1', capacity: 2, type: 'standard' },
    { num: '2', capacity: 2, type: 'standard' },
    { num: '3', capacity: 4, type: 'standard' },
    { num: '4', capacity: 4, type: 'standard' },
    { num: '5', capacity: 4, type: 'standard' },
    { num: '6', capacity: 6, type: 'booth' },
    { num: '7', capacity: 6, type: 'booth' },
    { num: '8', capacity: 8, type: 'standard' },
    { num: '9', capacity: 2, type: 'bar' },
    { num: '10', capacity: 10, type: 'private' },
  ];

  for (const cfg of tableConfigs) {
    const tableUrl = `${canonicalDomain}/qr/table-${cfg.num}`;
    const buf = await beautifulQRGenerator.generateBeautifulQRCode(cfg.num, tableUrl, options);
    const dataUrl = `data:image/svg+xml;base64,${buf.toString('base64')}`;

    await prisma.tables.create({
      data: {
        table_number: cfg.num,
        capacity: cfg.capacity,
        table_type: cfg.type,
        qr_code_url: tableUrl,
        qr_code_data: dataUrl,
        design_settings: options,
        is_active: true
      }
    });
    console.log(`✅ Seeded Table ${cfg.num} -> ${tableUrl}`);
  }

  const finalTables = await prisma.tables.findMany({
    where: { is_active: true },
    orderBy: { id: 'asc' }
  });

  console.log(`\n🎉 Verification: ${finalTables.length} production tables successfully created and ready!`);
  for (const t of finalTables) {
    console.log(`Table ${t.table_number.padEnd(3)}: URL=${t.qr_code_url}`);
  }
}

testFullQRCrud()
  .catch((e) => {
    console.error('❌ Error during QR CRUD test:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
