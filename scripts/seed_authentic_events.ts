import 'dotenv/config';
import { prisma } from '../src/lib/db';

async function main() {
  console.log('🧹 Cleaning up and replacing with luxury curated photography...');
  await prisma.events.deleteMany({});

  const luxuryEvents = [
    {
      title: 'Grand Diwali Gala & Festival of Lights Banquet',
      description: 'Celebrate the auspicious Festival of Lights with Sangeet’s signature royal feast. Enjoy artisanal mithai, live tandoor specials, traditional diya illumination, and a curated 5-course banquet in our 5,300 sq ft luxury dining hall.',
      date: new Date('2026-10-28'),
      time: '6:30 PM – 11:00 PM',
      category: 'Diwali Celebration',
      price: 'HK$588 / person',
      // Authentic luxury Indian banquet / candlelight golden feast
      image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1600&h=900&fit=crop',
      is_featured: true
    },
    {
      title: 'Royal Sitar & Ghazal Musical Soirée',
      description: 'An enchanting evening of live classical sitar and tabla performances paired with slow-cooked Awadhi delicacies, fragrant saffron dum biryani, and bespoke South Asian botanical cocktail pairings.',
      date: new Date('2026-09-19'),
      time: '7:30 PM – 10:30 PM',
      category: 'Live Music & Dining',
      price: 'HK$468 / person',
      // High-end intimate dining & musical ambiance
      image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&h=900&fit=crop',
      is_featured: true
    },
    {
      title: 'Old Delhi Street Food & Chaat Festival Brunch',
      description: 'Transport your palate to the vibrant culinary lanes of South Asia with live pani puri stations, artisanal samosas, sizzling tawa kebabs, freshly baked kulchas, and unlimited masala cutting chai.',
      date: new Date('2026-08-30'),
      time: '11:30 AM – 3:30 PM',
      category: 'Weekend Brunch',
      price: 'HK$328 / person',
      // Vibrant golden artisanal Indian delicacies
      image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1600&h=900&fit=crop',
      is_featured: true
    },
    {
      title: 'Tandoori Mastery & Royal Clay Oven Feast',
      description: 'A tribute to centuries-old tandoor craft. Indulge in Kashmiri lamb seekh kebabs, saffron murgh malai tikka, smoked truffle paneer shashlik, and artisan stuffed naan breads.',
      date: new Date('2026-09-05'),
      time: '6:00 PM – 9:30 PM',
      category: 'Chef’s Special',
      price: 'HK$498 / person',
      // Sizzling tandoori grill delicacies
      image_url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=1600&h=900&fit=crop',
      is_featured: false
    }
  ];

  for (const event of luxuryEvents) {
    const created = await prisma.events.create({
      data: event
    });
    console.log(`✅ Seeded: "${created.title}" with luxury image`);
  }

  console.log('\n🎉 Successfully updated all events in DB with authentic luxury photography!');
}

main()
  .catch((e) => {
    console.error('Error updating events:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
