import { prisma } from '../src/lib/db';

async function main() {
  const categories = await prisma.categories.findMany({
    orderBy: { display_order: 'asc' }
  });
  console.log("=== CATEGORIES ===");
  console.log(JSON.stringify(categories, null, 2));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
