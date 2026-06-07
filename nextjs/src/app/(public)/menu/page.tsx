import type { Metadata } from "next";
import { MenuPageClient } from "./menu-client";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Explore our authentic Indian and Nepali menu. From butter chicken to momos, discover dishes crafted with traditional recipes.",
};

import { createClient } from "@/lib/supabase/server";

export default async function MenuPage() {
  const supabase = await createClient();

  // Fetch categories, ordered by display_order
  const { data: categoriesData } = await supabase
    .from("menu_categories")
    .select("id, name")
    .eq("is_active", true)
    .order("display_order");

  // Fetch menu items
  const { data: menuItemsData } = await supabase
    .from("menu_items")
    .select("id, name, description, price, category_id, image_url, is_vegetarian, is_spicy, is_popular, allergens, preparation_time, is_active")
    .eq("is_active", true);

  const categories = [{ id: "all", name: "All Items" }, ...(categoriesData || [])];
  const menuItems = menuItemsData || [];

  return <MenuPageClient categories={categories} menuItems={menuItems} />;
}
