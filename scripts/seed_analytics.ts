import { prisma } from '../src/lib/db';

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log('🌱 Starting Analytics Seeder...');

  // 1. Ensure Menu Items exist
  let menuItems = await prisma.menu_items.findMany();
  if (menuItems.length === 0) {
    console.log('No menu items found. Creating defaults...');
    await prisma.categories.createMany({
      data: [
        { name: 'Appetizers', description: 'Starters' },
        { name: 'Main Course', description: 'Mains' },
        { name: 'Desserts', description: 'Sweets' }
      ]
    });
    const categories = await prisma.categories.findMany();
    const catMap = {
      'Appetizers': categories.find(c => c.name === 'Appetizers')?.id,
      'Main Course': categories.find(c => c.name === 'Main Course')?.id,
      'Desserts': categories.find(c => c.name === 'Desserts')?.id,
    };

    await prisma.menu_items.createMany({
      data: [
        { name: 'Samosa', price: 5.99, category: 'Appetizers', category_id: catMap['Appetizers'] },
        { name: 'Chicken Tikka', price: 9.99, category: 'Appetizers', category_id: catMap['Appetizers'] },
        { name: 'Butter Chicken', price: 16.99, category: 'Main Course', category_id: catMap['Main Course'] },
        { name: 'Lamb Rogan Josh', price: 18.99, category: 'Main Course', category_id: catMap['Main Course'] },
        { name: 'Palak Paneer', price: 14.99, category: 'Main Course', category_id: catMap['Main Course'] },
        { name: 'Gulab Jamun', price: 6.99, category: 'Desserts', category_id: catMap['Desserts'] },
        { name: 'Rasmalai', price: 7.99, category: 'Desserts', category_id: catMap['Desserts'] },
      ]
    });
    menuItems = await prisma.menu_items.findMany();
  }

  // 2. Ensure Tables exist
  let orderTables = await prisma.tables.findMany();
  if (orderTables.length === 0) {
    console.log('No QR tables found. Creating defaults...');
    await prisma.tables.createMany({
      data: Array.from({ length: 5 }).map((_, i) => ({
        table_number: `T${i + 1}`,
        qr_code_url: `https://example.com/qr/T${i + 1}`,
        status: 'available',
        capacity: 4
      }))
    });
    orderTables = await prisma.tables.findMany();
  }

  // 3. Ensure Restaurant Tables exist (for reservations)
  let resTables = await prisma.restaurant_tables.findMany();
  if (resTables.length === 0) {
    console.log('No Reservation tables found. Creating defaults...');
    await prisma.restaurant_tables.createMany({
      data: Array.from({ length: 5 }).map((_, i) => ({
        table_number: `R${i + 1}`,
        capacity: 4
      }))
    });
    resTables = await prisma.restaurant_tables.findMany();
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // 4. Generate Reservations
  console.log('Generating Reservations...');
  const reservationStatuses = ['completed', 'completed', 'completed', 'cancelled', 'no-show', 'confirmed'];
  const resData = [];
  for (let i = 0; i < 60; i++) {
    const resDate = randomDate(thirtyDaysAgo, now);
    resData.push({
      customer_name: `Customer ${i}`,
      email: `customer${i}@example.com`,
      table_id: resTables[randomInt(0, resTables.length - 1)].id,
      date: resDate,
      time: resDate,
      guests: randomInt(2, 6),
      status: reservationStatuses[randomInt(0, reservationStatuses.length - 1)],
      confirmation_code: `RES${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      created_at: new Date(resDate.getTime() - 2 * 24 * 60 * 60 * 1000), // Booked 2 days in advance
      updated_at: resDate
    });
  }
  await prisma.reservations.createMany({ data: resData });

  // 5. Generate Orders and Order Items
  console.log('Generating Orders and Order Items...');
  const orderTypes = ['dine-in', 'takeaway', 'delivery'];
  let orderCount = 1000;
  
  for (let i = 0; i < 150; i++) { // 150 orders over 30 days
    const orderDate = randomDate(thirtyDaysAgo, now);
    const orderType = orderTypes[randomInt(0, 2)];
    
    // Pick 2 to 4 items
    const numItems = randomInt(2, 4);
    let totalAmount = 0;
    const itemsToInsert = [];
    
    for (let j = 0; j < numItems; j++) {
      const item = menuItems[randomInt(0, menuItems.length - 1)];
      const qty = randomInt(1, 3);
      const price = Number(item.price) * qty;
      totalAmount += price;
      itemsToInsert.push({
        menu_item_id: item.id,
        quantity: qty,
        unit_price: item.price,
        total_price: price,
        status: 'completed',
        created_at: orderDate
      });
    }

    const order = await prisma.orders.create({
      data: {
        table_id: orderType === 'dine-in' ? orderTables[randomInt(0, orderTables.length - 1)].id : null,
        customer_name: `Diner ${i}`,
        order_number: `ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        status: 'completed',
        total_amount: totalAmount,
        order_type: orderType,
        created_at: orderDate,
        updated_at: new Date(orderDate.getTime() + 45 * 60000), // Completed 45 mins later
        order_items: {
          create: itemsToInsert
        }
      }
    });
  }

  // 6. Generate Customer Reviews
  console.log('Generating Reviews...');
  const reviewsData = [];
  for (let i = 0; i < 40; i++) {
    const reviewDate = randomDate(thirtyDaysAgo, now);
    reviewsData.push({
      customer_name: `Reviewer ${i}`,
      review_text: 'Great experience, loved the food!',
      rating: randomInt(3, 5),
      is_verified: true,
      created_at: reviewDate
    });
  }
  await prisma.customer_reviews.createMany({ data: reviewsData });

  console.log('✅ Analytics Seeding Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
