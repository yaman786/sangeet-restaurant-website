import MenuPage from '@/_pages/MenuPage';
import menuService from '@/lib/services/menuService';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Menu | Sangeet Restaurant Wan Chai',
  description: 'Explore the South Asian & Nepali menu at Sangeet in Wan Chai, Hong Kong. Tandoori grills, slow-cooked curries, biryanis, fresh breads, and vegetarian specialties.',
};

export const dynamic = 'force-dynamic';

export default async function Page() {
  let menuItems: any[] = [];
  let categories: any[] = [];

  try {
    const [menuRes, catRes] = await Promise.all([
      menuService.getAllMenuItems(),
      menuService.getAllCategories()
    ]);
    
    // We need to parse/stringify to handle Prisma Date objects for client components
    menuItems = JSON.parse(JSON.stringify(menuRes || []));
    categories = JSON.parse(JSON.stringify(catRes || []));
  } catch (err) {
    console.error("Failed to fetch menu data on server", err);
  }

  return <MenuPage initialMenuItems={menuItems} initialCategories={categories} />;
}
