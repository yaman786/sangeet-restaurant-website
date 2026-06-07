import type { Metadata } from "next";
import { QRMenuClient } from "./qr-menu-client";

export const metadata: Metadata = {
  title: "Table Menu",
  description: "Browse the menu and place your order directly from your table.",
};

import { createClient } from "@/lib/supabase/server";

// We fetch data dynamically for the QR menu
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ tableNumber: string }>;
}

export default async function QRMenuPage({ params }: PageProps) {
  const { tableNumber } = await params;

  const supabase = await createClient();

  // Fetch categories, ordered by display_order
  const { data: categoriesData } = await supabase
    .from("menu_categories")
    .select("id, name")
    .eq("is_active", true)
    .order("display_order");

  // Fetch menu items with category names
  const { data: menuItemsData } = await supabase
    .from("menu_items")
    .select(`
      id, name, description, price, category_id, image_url, 
      is_vegetarian, is_spicy, is_popular, allergens, preparation_time, is_active,
      menu_categories (name)
    `)
    .eq("is_active", true);

  const categories = ["All", ...(categoriesData?.map((c: any) => c.name) || [])];
  
  const menuItems = (menuItemsData || []).map((item: any) => ({
    ...item,
    category_name: Array.isArray(item.menu_categories) 
      ? item.menu_categories[0]?.name 
      : (item.menu_categories as any)?.name || "Uncategorized"
  }));

  return (
    <QRMenuClient
      tableNumber={tableNumber}
      menuItems={menuItems}
      categories={categories}
    />
  );
}
