export type MenuSection = 'food' | 'drinks';

export const BAR_PARENT_CATEGORY_NAME = 'Bar & Drinks';

export const BAR_SUBCATEGORY_NAMES = [
  'Draught Beers',
  'Bottled Beers & Cider',
  'Whisky & Bourbon',
  'Spirits (Rum, Vodka, Gin, Tequila)',
  'Cocktails',
  'Champagne',
] as const;

const BAR_CATEGORY_SET = new Set<string>([
  BAR_PARENT_CATEGORY_NAME.toLowerCase(),
  ...BAR_SUBCATEGORY_NAMES.map((n) => n.toLowerCase()),
]);

export function getBarCategoryIds(categories: any[] = []): Set<number> {
  const ids = new Set<number>();
  const barParent = categories.find(
    (c: any) => !c.parent_id && c.name?.toLowerCase() === BAR_PARENT_CATEGORY_NAME.toLowerCase()
  );
  if (barParent?.id) {
    ids.add(Number(barParent.id));
    for (const cat of categories) {
      if (Number(cat.parent_id) === Number(barParent.id)) {
        ids.add(Number(cat.id));
      }
    }
  }
  for (const cat of categories) {
    if (cat?.name && BAR_CATEGORY_SET.has(String(cat.name).toLowerCase()) && cat.id) {
      ids.add(Number(cat.id));
    }
  }
  return ids;
}

export function isBarCategory(category: any, categories: any[] = []): boolean {
  if (!category) return false;
  const barIds = getBarCategoryIds(categories);
  if (category.id && barIds.has(Number(category.id))) return true;
  if (category.parent_id && barIds.has(Number(category.parent_id))) return true;
  const name = String(category.name || '').toLowerCase();
  return BAR_CATEGORY_SET.has(name);
}

export function isBarMenuItem(item: any, categories: any[] = []): boolean {
  if (!item) return false;
  const barIds = getBarCategoryIds(categories);
  if (item.category_id && barIds.has(Number(item.category_id))) {
    return true;
  }
  const catName = String(item.category_name || item.category || '').toLowerCase();
  return BAR_CATEGORY_SET.has(catName);
}

