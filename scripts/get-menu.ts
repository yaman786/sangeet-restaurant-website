import { prisma } from '../src/lib/db';

async function main() {
  const menuItems = await prisma.menu_items.findMany({
    include: {
      categories: true,
    },
    orderBy: [
      { category_id: 'asc' },
      { id: 'asc' }
    ]
  });

  console.log(JSON.stringify(menuItems, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
