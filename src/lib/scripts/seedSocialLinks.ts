import 'dotenv/config';
import { prisma } from '../db';

async function seedSocialLinks() {
  const links = [
    {
      key: 'social_instagram',
      value: 'https://www.instagram.com/sangeet_wanchai/',
      desc: 'Instagram profile URL'
    },
    {
      key: 'social_facebook',
      value: 'https://www.facebook.com/sangeetrestaurant',
      desc: 'Facebook page URL'
    }
  ];

  for (const item of links) {
    await prisma.restaurant_settings.upsert({
      where: { setting_key: item.key },
      update: { setting_value: item.value, updated_at: new Date() },
      create: {
        setting_key: item.key,
        setting_value: item.value,
        setting_type: 'text',
        description: item.desc
      }
    });
  }

  console.log('✅ Successfully seeded social media links in database:');
  links.forEach(l => console.log(`   - ${l.key}: ${l.value}`));
}

seedSocialLinks()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

