const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function testUpdate() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const content = {
    hero_title: { title: 'Hero Title', content: 'Experience Sangeet Excellence Test', content_type: 'text' },
    hero_subtitle: { title: 'Hero Subtitle', content: 'Authentic cuisine rooted in tradition, crafted with passion, served in the heart of Hong Kong.', content_type: 'text' }
  };
  
  const upserts = [];
  for (const [key, data] of Object.entries(content)) {
    upserts.push(prisma.website_content.upsert({
      where: { section_key: key },
      update: {
        title: data.title, content: data.content, content_type: data.content_type || 'text',
        is_active: data.is_active !== false, display_order: data.display_order || 0,
        updated_at: new Date(), updated_by: 1
      },
      create: {
        section_key: key, title: data.title, content: data.content, content_type: data.content_type || 'text',
        is_active: data.is_active !== false, display_order: data.display_order || 0,
        updated_by: 1
      }
    }));
  }
  
  try {
    await prisma.$transaction(upserts);
    console.log("Success!");
  } catch (e) {
    console.error("Prisma Error:", e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

testUpdate();
