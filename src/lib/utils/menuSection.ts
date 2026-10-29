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
  if (item.section === 'drinks') return true;
  if (item.section === 'food') return false;

  const parentCatName = String(
    item.parent_category_name || item.categories?.parent?.name || ''
  ).toLowerCase();
  if (parentCatName === BAR_PARENT_CATEGORY_NAME.toLowerCase()) {
    return true;
  }

  const barIds = getBarCategoryIds(categories);
  if (item.category_id && barIds.has(Number(item.category_id))) {
    return true;
  }
  const catName = String(item.category_name || item.category || '').toLowerCase();
  return BAR_CATEGORY_SET.has(catName);
}

export type DrinkServingMode = 'shot_and_bottle' | 'bottle_only' | 'single';

export interface GroupedDrinkItem {
  id: number;
  baseName: string;
  name: string;
  description: string;
  price: number | string;
  shotPrice?: number | null;
  bottlePrice?: number | null;
  category: string;
  category_name: string;
  category_id?: number | null;
  image_url: string | null;
  is_vegetarian: boolean;
  is_spicy: boolean;
  is_popular: boolean;
  preparation_time?: number;
  servingMode: DrinkServingMode;
  shotItem?: any | null;
  bottleItem?: any | null;
  singleItem?: any | null;
}

export function stripDrinkVariantSuffix(name: string): string {
  return String(name || '')
    .replace(/\s*\((shot|bottle)\)$/i, '')
    .trim();
}

export function cleanDrinkDescription(description: string): string {
  return String(description || '')
    .replace(/\s*\((single\s+)?shot\)/gi, '')
    .replace(/\s*\(bottle(\s+only)?\)/gi, '')
    .trim();
}

export function defaultServingModeForCategory(categoryName: string): DrinkServingMode {
  const lower = String(categoryName || '').toLowerCase();
  if (lower.includes('whisky') || lower.includes('bourbon') || lower.includes('spirit')) {
    return 'shot_and_bottle';
  }
  if (lower.includes('champagne') || lower.includes('wine')) {
    return 'bottle_only';
  }
  return 'single';
}

export function groupDrinkMenuItems(items: any[] = []): GroupedDrinkItem[] {
  const groups = new Map<
    string,
    {
      baseName: string;
      categoryName: string;
      shotItem?: any;
      bottleItem?: any;
      singleItem?: any;
    }
  >();

  for (const item of items) {
    if (!item) continue;
    // If already grouped, pass through
    if (item.servingMode && (item.shotItem || item.bottleItem || item.singleItem)) {
      const existingKey = `${String(item.category_name || item.category || '').toLowerCase()}::${String(item.baseName || item.name).toLowerCase()}::grouped`;
      groups.set(existingKey, {
        baseName: item.baseName || item.name,
        categoryName: item.category_name || item.category || '',
        shotItem: item.shotItem,
        bottleItem: item.bottleItem,
        singleItem: item.singleItem,
      });
      continue;
    }

    const rawName = String(item.name || '').trim();
    const catName = String(item.category_name || item.category || '').trim();
    const lowerCat = catName.toLowerCase();
    const isBeerOrDraught =
      lowerCat.includes('beer') || lowerCat.includes('draught') || lowerCat.includes('cider');

    let variant: 'shot' | 'bottle' | 'single' = 'single';
    let baseName = rawName;

    if (/\s*\(shot\)$/i.test(rawName)) {
      variant = 'shot';
      baseName = rawName.replace(/\s*\(shot\)$/i, '').trim();
    } else if (!isBeerOrDraught && /\s*\(bottle\)$/i.test(rawName)) {
      variant = 'bottle';
      baseName = rawName.replace(/\s*\(bottle\)$/i, '').trim();
    }

    const key =
      variant === 'single'
        ? `${lowerCat}::${rawName.toLowerCase()}::single::${item.id}`
        : `${lowerCat}::${baseName.toLowerCase()}`;

    const entry = groups.get(key) || {
      baseName,
      categoryName: catName,
    };

    if (variant === 'shot') {
      entry.shotItem = item;
    } else if (variant === 'bottle') {
      entry.bottleItem = item;
    } else {
      entry.singleItem = item;
    }

    groups.set(key, entry);
  }

  const result: GroupedDrinkItem[] = [];

  for (const entry of groups.values()) {
    const { baseName, shotItem, bottleItem, singleItem } = entry;

    if (shotItem && bottleItem) {
      const primary = shotItem;
      result.push({
        ...primary,
        id: primary.id,
        baseName,
        name: baseName,
        description: cleanDrinkDescription(bottleItem.description || shotItem.description || ''),
        price: shotItem.price,
        shotPrice: parseFloat(shotItem.price),
        bottlePrice: parseFloat(bottleItem.price),
        category: primary.category,
        category_name: primary.category_name || primary.category,
        category_id: primary.category_id || bottleItem.category_id,
        image_url: bottleItem.image_url || shotItem.image_url,
        is_vegetarian: false,
        is_spicy: false,
        is_popular: Boolean(shotItem.is_popular || bottleItem.is_popular),
        servingMode: 'shot_and_bottle',
        shotItem,
        bottleItem,
        singleItem: null,
      });
    } else if (bottleItem && !shotItem) {
      result.push({
        ...bottleItem,
        id: bottleItem.id,
        baseName,
        name: baseName,
        description: cleanDrinkDescription(bottleItem.description || ''),
        price: bottleItem.price,
        shotPrice: null,
        bottlePrice: parseFloat(bottleItem.price),
        category: bottleItem.category,
        category_name: bottleItem.category_name || bottleItem.category,
        category_id: bottleItem.category_id,
        image_url: bottleItem.image_url,
        is_vegetarian: false,
        is_spicy: false,
        is_popular: Boolean(bottleItem.is_popular),
        servingMode: 'bottle_only',
        shotItem: null,
        bottleItem,
        singleItem: null,
      });
    } else {
      const item = singleItem || shotItem;
      if (!item) continue;
      result.push({
        ...item,
        id: item.id,
        baseName: item.name,
        name: item.name,
        description: item.description || '',
        price: item.price,
        shotPrice: shotItem ? parseFloat(shotItem.price) : null,
        bottlePrice: null,
        category: item.category,
        category_name: item.category_name || item.category,
        category_id: item.category_id,
        image_url: item.image_url,
        is_vegetarian: false,
        is_spicy: false,
        is_popular: Boolean(item.is_popular),
        servingMode: 'single',
        shotItem: shotItem || null,
        bottleItem: null,
        singleItem: item,
      });
    }
  }

  return result;
}

