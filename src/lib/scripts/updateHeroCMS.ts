import 'dotenv/config';
import { prisma } from '../db';

async function updateHeroCMS() {
  const heroValue = {
    title: "South Asian Fine Dining in Wan Chai",
    subtitle: "Tandoori grills, regional curries, and craft cocktails. Now open in Hong Kong.",
    image_url: "/images/hero-interior.jpg",
    primary_cta_text: "Reserve a Table",
    primary_cta_link: "/reservations",
    secondary_cta_text: "View Menu",
    secondary_cta_link: "/menu"
  };

  // Find if hero_banner exists
  const existing = await prisma.restaurant_settings.findFirst({
    where: { setting_key: 'hero_banner' }
  });

  if (existing) {
    await prisma.restaurant_settings.update({
      where: { id: existing.id },
      data: { setting_value: JSON.stringify(heroValue) }
    });
  } else {
    await prisma.restaurant_settings.create({
      data: {
        setting_key: 'hero_banner',
        setting_value: JSON.stringify(heroValue),
        setting_type: 'json'
      }
    });
  }

  console.log('✅ Successfully updated hero_banner in database to /images/hero-interior.jpg');
}

updateHeroCMS()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
