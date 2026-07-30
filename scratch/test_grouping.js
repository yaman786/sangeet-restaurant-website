const orders = [
  { id: 1, table_number: 1, created_at: '2026-07-29T18:56:40Z' },
  { id: 2, table_number: 1, created_at: '2026-07-29T20:02:21Z' },
  { id: 3, table_number: 1, created_at: '2026-07-30T06:10:27Z' },
  { id: 4, table_number: 1, created_at: '2026-07-30T09:45:21Z' },
  { id: 5, table_number: 2, created_at: '2026-07-30T09:45:21Z' },
];

orders.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

const groups = {};

orders.forEach(order => {
  const table = order.table_number;
  const time = new Date(order.created_at).getTime();
  
  if (!groups[table]) groups[table] = [];
  
  let foundGroup = false;
  for (const group of groups[table]) {
    const lastOrderTime = new Date(group.orders[group.orders.length - 1].created_at).getTime();
    if (time - lastOrderTime < 4 * 60 * 60 * 1000) { // 4 hours
      group.orders.push(order);
      foundGroup = true;
      break;
    }
  }
  
  if (!foundGroup) {
    groups[table].push({
      id: `${table}_${time}`,
      orders: [order]
    });
  }
});

console.log(JSON.stringify(groups, null, 2));
