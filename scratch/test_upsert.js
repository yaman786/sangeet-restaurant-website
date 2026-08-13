const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testUpdate() {
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
    console.error("Error:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

testUpdate();
