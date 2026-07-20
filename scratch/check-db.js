const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDb() {
  const table = await prisma.tables.findFirst({ where: { table_number: "2" } });
  if (!table) return console.log("Table 2 not found");
  
  const activeOrder = await prisma.orders.findFirst({
    where: {
      table_id: table.id,
      status: { notIn: ['completed', 'cancelled'] }
    },
    include: {
      order_items: {
        include: {
          menu_items: true
        }
      }
    },
    orderBy: { created_at: 'desc' }
  });
  
  if (!activeOrder) {
    console.log("No active order for table 2");
    return;
  }
  
  console.log("ACTIVE ORDER ID:", activeOrder.id);
  console.log("CUSTOMER:", activeOrder.customer_name);
  console.log("TOTAL AMOUNT:", activeOrder.total_amount);
  console.log("ITEMS IN ORDER:");
  activeOrder.order_items.forEach(item => {
    console.log(`- ${item.quantity}x ${item.menu_items.name} (Unit Price: ${item.unit_price}, Total: ${item.total_price})`);
  });
}

checkDb().catch(console.error).finally(() => prisma.$disconnect());
