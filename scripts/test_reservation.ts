import { prisma } from '../src/lib/db';

async function runTest() {
  console.log('1. Adding active timeslots to the database...');
  try {
    // Force create table with correct type
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "reservation_time_slots" (
        "id" SERIAL NOT NULL,
        "time_slot" TIME(6) NOT NULL,
        "is_active" BOOLEAN DEFAULT true,
        "max_reservations" INTEGER DEFAULT 10,
        "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "reservation_time_slots_pkey" PRIMARY KEY ("id")
      );
    `);

    // Add missing column to reservations
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "reservations" ADD COLUMN "confirmation_code" VARCHAR(20) UNIQUE;`);
      console.log('✅ Added confirmation_code column');
    } catch (e: any) {
      if (!e.message.includes('already exists')) {
        console.error('Error adding column:', e);
      }
    }
    
    // Add timeslots
    const times = ['18:00', '18:30', '19:00', '19:30', '20:00'];
    await prisma.reservation_time_slots.deleteMany({});
    
    await prisma.reservation_time_slots.createMany({
      data: times.map((time) => ({
        time_slot: new Date(`1970-01-01T${time}:00.000Z`),
        is_active: true,
        max_reservations: 10,
      }))
    });
    console.log('✅ Timeslots added successfully.');

    console.log('2. Making a live reservation via Vercel URL...');
    const liveUrl = 'https://frontend-six-xi-10.vercel.app/api/reservations';
    
    // Future date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const reservationPayload = {
      customer_name: "Aman Rana",
      email: "amanrana2053@gmail.com",
      phone: "+852 1234 5678",
      date: dateStr,
      time: "19:00",
      guests: 2,
      special_requests: "Automated ecosystem testing."
    };

    const res = await fetch(liveUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reservationPayload)
    });

    if (res.ok) {
      const data = await res.json();
      console.log('✅ Reservation created successfully!', data);
      console.log('📨 The automated email has been triggered via Brevo.');
    } else {
      const errData = await res.text();
      console.error('❌ Failed to create reservation on live URL:', res.status, errData);
    }
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
