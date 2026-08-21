import 'dotenv/config';
import { prisma } from '../db';

async function updateAddressCMS() {
  const addressSetting = {
    address: "17 Fenwick Street, Wan Chai, Hong Kong",
    phone: "+852 26568820",
    email: "info@sangeet.hk",
    maps_iframe: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3691.86!2d114.17!3d22.28!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDE2JzQ4LjAiTiAxMTTCsDEwJzEyLjAiRQ!5e0!3m2!1sen!2shk!4v1600000000000"
  };

  const existing = await prisma.restaurant_settings.findFirst({
    where: { setting_key: 'contact' }
  });

  if (existing) {
    await prisma.restaurant_settings.update({
      where: { id: existing.id },
      data: { setting_value: JSON.stringify(addressSetting) }
    });
  } else {
    await prisma.restaurant_settings.create({
      data: {
        setting_key: 'contact',
        setting_value: JSON.stringify(addressSetting),
        setting_type: 'json'
      }
    });
  }

  console.log('✅ Successfully updated restaurant address in database to: 17 Fenwick Street, Wan Chai, Hong Kong');
}

updateAddressCMS()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
