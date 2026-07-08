import MenuPage from '@/_pages/MenuPage';
import { fetchMenuItems, fetchMenuCategories } from '@/services/api';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Menu - Sangeet Restaurant',
  description: 'Explore our authentic South Asian menu. From Butter Chicken to spicy Biryanis, discover your next favorite dish.',
};

export const revalidate = 3600;

export default async function Page() {
  let menuItems = [];
  let categories = [];

  try {
    const [menuRes, catRes] = await Promise.all([
      fetchMenuItems().catch(() => []),
      fetchMenuCategories().catch(() => [])
    ]);
    menuItems = (menuRes as any)?.data || menuRes || [];
    categories = (catRes as any)?.data || catRes || [];
  } catch (err) {
    console.error("Failed to fetch menu data on server", err);
  }

  return <MenuPage initialMenuItems={menuItems} initialCategories={categories} />;
}
