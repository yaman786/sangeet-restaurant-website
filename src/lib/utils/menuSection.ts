export type MenuSection = 'food' | 'drinks';

export const BAR_PARENT_CATEGORY_NAME = 'Bar & Drinks';

export const BAR_SUBCATEGORY_NAMES = [
  'Draught Beers',
  'Bottled Beers & Cider',
  'Whisky & Bourbon',
  'Whiskey',
  'Spirits (Rum, Vodka, Gin, Tequila)',
  'Wines',
  'Cocktails',
  'Champagne',
  'Soft Drinks',
] as const;

const NON_ALCOHOLIC_CATEGORY_KEYWORDS = [
  'soft drink',
  'mocktail',
  'juice',
  'lassi',
  'water',
  'tea',
  'coffee',
  'soda',
  'non-alcoholic',
  'non alcoholic',
];

export function defaultIsAlcoholicForCategory(categoryName: string): boolean {
  const lower = String(categoryName || '').toLowerCase().trim();
  if (!lower) return true;
  if (NON_ALCOHOLIC_CATEGORY_KEYWORDS.some((kw) => lower.includes(kw))) {
    return false;
  }
  return true;
}

export function parseItemAllergenTags(allergens: any): string[] {
  if (!allergens) return [];
  if (Array.isArray(allergens)) {
    return allergens.map((a) => String(a).toLowerCase().trim());
  }
  if (typeof allergens === 'string') {
    const trimmed = allergens.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((a) => String(a).toLowerCase().trim());
      }
    } catch {
      return trimmed
        .split(',')
        .map((a) => a.toLowerCase().trim())
        .filter(Boolean);
    }
  }
  return [];
}

export function isAlcoholicDrink(item: any, categories: any[] = []): boolean {
  if (!item) return false;
  if (!isBarMenuItem(item, categories)) return false;

  if (typeof item.is_alcoholic === 'boolean') {
    return item.is_alcoholic;
  }

  const tags = [
    ...parseItemAllergenTags(item.allergens),
    ...parseItemAllergenTags(item.shotItem?.allergens),
    ...parseItemAllergenTags(item.bottleItem?.allergens),
    ...parseItemAllergenTags(item.singleItem?.allergens),
  ];

  if (tags.includes('non_alcoholic') || tags.includes('soft_drink')) {
    return false;
  }
  if (tags.includes('alcoholic')) {
    return true;
  }

  const catName = String(item.category_name || item.category || '').trim();
  return defaultIsAlcoholicForCategory(catName);
}

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
  if (item.section === 'drinks' || item.station === 'bot') return true;
  if (item.section === 'food' || item.station === 'kot') return false;

  const target = item.menu_items ? { ...item.menu_items, ...item } : item;

  const parentCatName = String(
    target.parent_category_name || target.categories?.parent?.name || ''
  ).toLowerCase();
  if (parentCatName === BAR_PARENT_CATEGORY_NAME.toLowerCase()) {
    return true;
  }

  const barIds = getBarCategoryIds(categories);
  const catId = target.category_id ?? item.menu_items?.category_id;
  if (catId && barIds.has(Number(catId))) {
    return true;
  }
  const catName = String(
    target.category_name || target.category || item.menu_items?.category || ''
  ).toLowerCase();
  return BAR_CATEGORY_SET.has(catName);
}

export type OrderStation = 'kot' | 'bot' | 'all';

export function getItemStation(item: any, categories: any[] = []): 'kot' | 'bot' {
  return isBarMenuItem(item, categories) ? 'bot' : 'kot';
}

export function getStationItems(
  order: any,
  station: OrderStation,
  categories: any[] = []
): any[] {
  const rawItems = order?.items || order?.order_items || [];
  if (station === 'all') return rawItems;
  return rawItems.filter((item: any) => getItemStation(item, categories) === station);
}

export function getStationTicketStatus(
  order: any,
  station: 'kot' | 'bot',
  categories: any[] = []
): string | null {
  if (!order) return null;
  const stationItems = getStationItems(order, station, categories);
  if (stationItems.length === 0) return null;

  const activeItems = stationItems.filter((i: any) => i.status !== 'cancelled');
  if (activeItems.length === 0) return 'cancelled';

  if (order.status === 'cancelled' || order.status === 'completed') {
    return order.status;
  }
  if (order.status === 'pending') {
    return 'pending';
  }

  // If the master order was already marked ready/served and items have default 'active' status
  if (
    (order.status === 'ready' || order.status === 'served') &&
    activeItems.every((i: any) => !i.status || i.status === 'active' || i.status === 'ready' || i.status === 'served')
  ) {
    return 'ready';
  }

  if (activeItems.every((i: any) => i.status === 'completed')) {
    return 'completed';
  }
  if (
    activeItems.every(
      (i: any) => i.status === 'ready' || i.status === 'served' || i.status === 'completed'
    )
  ) {
    return 'ready';
  }
  if (
    activeItems.some(
      (i: any) => i.status === 'preparing' || i.status === 'ready' || i.status === 'served'
    )
  ) {
    return 'preparing';
  }

  return order.status === 'accepted' ? 'accepted' : 'preparing';
}

export function getOrderStationSummary(order: any, categories: any[] = []) {
  const kotItems = getStationItems(order, 'kot', categories);
  const botItems = getStationItems(order, 'bot', categories);
  const kotStatus = getStationTicketStatus(order, 'kot', categories);
  const botStatus = getStationTicketStatus(order, 'bot', categories);

  const kotTotal = kotItems
    .filter((i: any) => i.status !== 'cancelled')
    .reduce((sum: number, i: any) => sum + Number(i.total_price || Number(i.unit_price || 0) * Number(i.quantity || 1)), 0);

  const botTotal = botItems
    .filter((i: any) => i.status !== 'cancelled')
    .reduce((sum: number, i: any) => sum + Number(i.total_price || Number(i.unit_price || 0) * Number(i.quantity || 1)), 0);

  return {
    hasKot: kotItems.length > 0 && kotStatus !== 'cancelled',
    hasBot: botItems.length > 0 && botStatus !== 'cancelled',
    kotItems,
    botItems,
    kotStatus,
    botStatus,
    kotTotal,
    botTotal,
  };
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
  is_alcoholic?: boolean;
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
  if (!defaultIsAlcoholicForCategory(categoryName)) {
    return 'single';
  }
  if (lower.includes('whisky') || lower.includes('whiskey') || lower.includes('bourbon') || lower.includes('spirit')) {
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
        is_alcoholic: isAlcoholicDrink(primary),
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
        is_alcoholic: isAlcoholicDrink(bottleItem),
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
        is_alcoholic: isAlcoholicDrink(item),
        servingMode: 'single',
        shotItem: shotItem || null,
        bottleItem: null,
        singleItem: item,
      });
    }
  }

  return result;
}

