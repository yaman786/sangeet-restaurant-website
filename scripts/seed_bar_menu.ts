import 'dotenv/config';
import { prisma } from '../src/lib/db';
import { Prisma } from '@prisma/client';

interface SeedItem {
  name: string;
  price: number;
  description: string;
  isPopular?: boolean;
  imageUrl?: string;
}

const DRINK_IMAGES = {
  draughtLager: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800&h=600&fit=crop',
  wheatBeer: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&h=600&fit=crop',
  darkStout: 'https://images.unsplash.com/photo-1518176258769-f227c798150e?w=800&h=600&fit=crop',
  bottledBeer: 'https://images.unsplash.com/photo-1618885472179-5e474019f2a9?w=800&h=600&fit=crop',
  coronaBeer: 'https://images.unsplash.com/photo-1566633806327-68e152aaf26d?w=800&h=600&fit=crop',
  craftIpa: 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=800&h=600&fit=crop',
  appleCider: 'https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=800&h=600&fit=crop',
  whiskyShot: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=800&h=600&fit=crop',
  whiskyBottle: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800&h=600&fit=crop',
  bourbonShot: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=600&fit=crop',
  singleMaltBottle: 'https://images.unsplash.com/photo-1582819509237-d5b75f20ff7a?w=800&h=600&fit=crop',
  whiteRum: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&h=600&fit=crop',
  darkRum: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&h=600&fit=crop',
  vodkaShot: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&h=600&fit=crop',
  vodkaBottle: 'https://images.unsplash.com/photo-1598018553943-29ace5bf9867?w=800&h=600&fit=crop',
  ginGlass: 'https://images.unsplash.com/photo-1541546006121-5c3bc5e8c7b9?w=800&h=600&fit=crop',
  tequilaShot: 'https://images.unsplash.com/photo-1516535794938-6063878f08cc?w=800&h=600&fit=crop',
  aperolSpritz: 'https://images.unsplash.com/photo-1560512823-829485b8bf24?w=800&h=600&fit=crop',
  cosmopolitan: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800&h=600&fit=crop',
  whiteRussian: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&h=600&fit=crop',
  longIsland: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&h=600&fit=crop',
  mojito: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&h=600&fit=crop',
  margarita: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&h=600&fit=crop',
  strawberryDaiquiri: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=800&h=600&fit=crop',
  pinaColada: 'https://images.unsplash.com/photo-1582106245687-cbb466a9f07f?w=800&h=600&fit=crop',
  champagneBrut: 'https://images.unsplash.com/photo-1594372365401-3b5ff14eaaed?w=800&h=600&fit=crop',
  champagneRose: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=600&fit=crop',
} as const;

function getDrinkImageUrl(name: string, categoryName: string): string {
  const lower = name.toLowerCase();

  // 1. Draught Beers
  if (categoryName === 'Draught Beers') {
    if (lower.includes('guinness')) return DRINK_IMAGES.darkStout;
    if (lower.includes('1664') || lower.includes('blanc')) return DRINK_IMAGES.wheatBeer;
    return DRINK_IMAGES.draughtLager;
  }

  // 2. Bottled Beers & Cider
  if (categoryName === 'Bottled Beers & Cider') {
    if (lower.includes('cider') || lower.includes('thatcher') || lower.includes('somersby')) {
      return DRINK_IMAGES.appleCider;
    }
    if (lower.includes('ipa') || lower.includes('ym pt')) {
      return DRINK_IMAGES.craftIpa;
    }
    if (lower.includes('tetley')) {
      return DRINK_IMAGES.wheatBeer;
    }
    if (lower.includes('corona') || lower.includes('00%') || lower.includes('zero') || lower.includes('afb') || lower.includes('light')) {
      return DRINK_IMAGES.coronaBeer;
    }
    return DRINK_IMAGES.bottledBeer;
  }

  // 3. Whisky & Bourbon
  if (categoryName === 'Whisky & Bourbon') {
    const isBottle = lower.includes('(bottle)');
    const isSingleMalt =
      lower.includes('glenfiddich') ||
      lower.includes('glenlivet') ||
      lower.includes('macallan') ||
      lower.includes('glenmorangie') ||
      lower.includes('laphroaig');
    const isBourbon =
      lower.includes('jim beam') ||
      lower.includes('jack daniels') ||
      lower.includes("maker's mark");

    if (isBottle) {
      return isSingleMalt ? DRINK_IMAGES.singleMaltBottle : DRINK_IMAGES.whiskyBottle;
    }
    return isBourbon ? DRINK_IMAGES.bourbonShot : DRINK_IMAGES.whiskyShot;
  }

  // 4. Spirits (Rum, Vodka, Gin, Tequila)
  if (categoryName === 'Spirits (Rum, Vodka, Gin, Tequila)') {
    if (
      lower.includes('rum') ||
      lower.includes('bacardi') ||
      lower.includes('captain morgan') ||
      lower.includes('myers') ||
      lower.includes('havana')
    ) {
      if (lower.includes('captain') || lower.includes('myers') || lower.includes('7yrs')) {
        return DRINK_IMAGES.darkRum;
      }
      return DRINK_IMAGES.whiteRum;
    }
    if (
      lower.includes('vodka') ||
      lower.includes('grey goose') ||
      lower.includes('absolut') ||
      lower.includes('belvedere') ||
      lower.includes('smirnoff') ||
      lower.includes('coral')
    ) {
      return lower.includes('(bottle)') ? DRINK_IMAGES.vodkaBottle : DRINK_IMAGES.vodkaShot;
    }
    if (
      lower.includes('gin') ||
      lower.includes('bombay') ||
      lower.includes('tanqueray') ||
      lower.includes('hendrick') ||
      lower.includes('monkey 47')
    ) {
      return DRINK_IMAGES.ginGlass;
    }
    return DRINK_IMAGES.tequilaShot;
  }

  // 5. Cocktails
  if (categoryName === 'Cocktails') {
    if (lower.includes('aperol')) return DRINK_IMAGES.aperolSpritz;
    if (lower.includes('cosmopolitan')) return DRINK_IMAGES.cosmopolitan;
    if (lower.includes('russian')) return DRINK_IMAGES.whiteRussian;
    if (lower.includes('long island')) return DRINK_IMAGES.longIsland;
    if (lower.includes('mojito')) return DRINK_IMAGES.mojito;
    if (lower.includes('margarita')) return DRINK_IMAGES.margarita;
    if (lower.includes('daiquiri')) return DRINK_IMAGES.strawberryDaiquiri;
    if (lower.includes('colada')) return DRINK_IMAGES.pinaColada;
    return DRINK_IMAGES.aperolSpritz;
  }

  // 6. Champagne
  if (categoryName === 'Champagne') {
    if (lower.includes('rosé') || lower.includes('rose')) return DRINK_IMAGES.champagneRose;
    return DRINK_IMAGES.champagneBrut;
  }

  return DRINK_IMAGES.draughtLager;
}

interface CategoryGroup {
  name: string;
  description: string;
  displayOrder: number;
  items: SeedItem[];
}

const BAR_CATEGORIES: CategoryGroup[] = [
  {
    name: 'Draught Beers',
    description: 'Freshly poured cold draught beers',
    displayOrder: 1,
    items: [
      { name: 'Carlsberg (Draught)', price: 75, description: 'Fresh, crisp European pilsner on tap', isPopular: true },
      { name: 'Sapporo (Draught)', price: 75, description: 'Iconic Japanese crisp draught lager', isPopular: true },
      { name: '1664 Blanc (Draught)', price: 75, description: 'French wheat beer with subtle citrus and coriander hints', isPopular: true },
      { name: 'Young Master Classic (Draught)', price: 75, description: 'Hong Kong local craft pale ale on tap' },
      { name: 'Guinness (Draught)', price: 90, description: 'Rich, creamy Irish dry stout on tap', isPopular: true }
    ]
  },
  {
    name: 'Bottled Beers & Cider',
    description: 'Selection of chilled international bottled beers and ciders',
    displayOrder: 2,
    items: [
      { name: 'Carlsberg (Bottle)', price: 65, description: 'Classic Danish pilsner bottle (330ml)' },
      { name: 'Thatcher\'s Cider', price: 65, description: 'Refreshing Somerset apple cider' },
      { name: 'Carlsberg 00% (Alcohol Free)', price: 65, description: 'Zero alcohol crisp lager' },
      { name: 'Sapporo (Bottle)', price: 65, description: 'Japanese premium bottled lager' },
      { name: 'Carlsberg AFB', price: 65, description: 'Carlsberg alcohol-free beer' },
      { name: 'Brooklyn IPA', price: 65, description: 'Bold and aromatic American craft IPA' },
      { name: 'YM pt Lager', price: 65, description: 'Young Master local craft lager' },
      { name: 'Poretti Zero', price: 65, description: 'Italian non-alcoholic malt beer' },
      { name: 'San Miguel', price: 65, description: 'Full-bodied golden lager' },
      { name: 'San Mig Light', price: 65, description: 'Low-calorie smooth light lager' },
      { name: 'Tetley\'s', price: 81, description: 'Smooth English ale' },
      { name: 'Budweiser', price: 65, description: 'King of beers American lager' },
      { name: 'Corona Extra', price: 65, description: 'Mexican classic served with a fresh lime wedge', isPopular: true },
      { name: 'Somersby Cider', price: 65, description: 'Crisp and sweet sparkling fruit cider' },
      { name: 'Heineken', price: 65, description: 'Premium Dutch lager' },
      { name: 'Tsing Tao', price: 65, description: 'Classic Chinese crisp lager' },
      { name: 'Blue Girl', price: 65, description: 'Hong Kong favourite German-style pilsner' },
      { name: 'Gorkha Beer', price: 65, description: 'Authentic Himalayan premium brew', isPopular: true },
      { name: 'King Fisher', price: 65, description: 'The premier authentic Indian lager', isPopular: true }
    ]
  },
  {
    name: 'Whisky & Bourbon',
    description: 'Premium Blended, Bourbon, Tennessee & Single Malt Whiskies',
    displayOrder: 3,
    items: [
      // Blended / Bourbon / Tennessee
      { name: 'House Whiskey (Shot)', price: 65, description: 'Standard house pour (single shot)' },
      { name: 'House Whiskey (Bottle)', price: 1299, description: 'Full bottle service' },
      { name: 'Chivas Regal 12yrs (Shot)', price: 88, description: '12-year blended Scotch whisky (shot)' },
      { name: 'Chivas Regal 12yrs (Bottle)', price: 1788, description: '12-year blended Scotch whisky (bottle)', isPopular: true },
      { name: 'JW Black Label (Shot)', price: 88, description: 'Johnnie Walker Black Label 12yo (shot)' },
      { name: 'JW Black Label (Bottle)', price: 1788, description: 'Johnnie Walker Black Label 12yo (bottle)', isPopular: true },
      { name: 'JW Blue Label (Bottle)', price: 5888, description: 'Johnnie Walker Blue Label prestige blend (bottle only)' },
      { name: 'Canadian Club (Shot)', price: 88, description: 'Smooth blended Canadian whisky (shot)' },
      { name: 'Canadian Club (Bottle)', price: 1788, description: 'Smooth blended Canadian whisky (bottle)' },
      { name: 'Jameson Irish Whiskey (Shot)', price: 88, description: 'Triple distilled smooth Irish whiskey (shot)' },
      { name: 'Jameson Irish Whiskey (Bottle)', price: 1788, description: 'Triple distilled smooth Irish whiskey (bottle)' },
      { name: 'Jim Beam Bourbon (Shot)', price: 88, description: 'Kentucky straight bourbon whiskey (shot)' },
      { name: 'Jim Beam Bourbon (Bottle)', price: 1788, description: 'Kentucky straight bourbon whiskey (bottle)' },
      { name: 'Jack Daniels No. 7 (Shot)', price: 92, description: 'Tennessee sour mash whiskey (shot)' },
      { name: 'Jack Daniels No. 7 (Bottle)', price: 2099, description: 'Tennessee sour mash whiskey (bottle)', isPopular: true },
      { name: 'Maker\'s Mark (Shot)', price: 85, description: 'Handcrafted Kentucky straight bourbon (shot)' },
      { name: 'Maker\'s Mark (Bottle)', price: 1599, description: 'Handcrafted Kentucky straight bourbon (bottle)' },

      // Single Malt
      { name: 'Glenfiddich 12Yrs (Shot)', price: 90, description: 'Speyside single malt Scotch (shot)' },
      { name: 'Glenfiddich 12Yrs (Bottle)', price: 2399, description: 'Speyside single malt Scotch (bottle)', isPopular: true },
      { name: 'Glenfiddich 18Yrs (Bottle)', price: 3800, description: 'Small batch 18-year Speyside single malt (bottle only)' },
      { name: 'Glenlivet 12Yrs (Shot)', price: 85, description: 'Smooth, balanced Speyside single malt (shot)' },
      { name: 'Glenlivet 12Yrs (Bottle)', price: 2299, description: 'Smooth, balanced Speyside single malt (bottle)' },
      { name: 'Macallan 12Yrs (Shot)', price: 105, description: 'Sherry oak / double cask 12yo single malt (shot)' },
      { name: 'Macallan 12Yrs (Bottle)', price: 2777, description: 'Sherry oak / double cask 12yo single malt (bottle)', isPopular: true },
      { name: 'Macallan 18Yrs (Bottle)', price: 5499, description: 'Exceptional 18-year Sherry Oak single malt (bottle only)' },
      { name: 'Glenmorangie 10Yrs (Shot)', price: 85, description: 'Highland single malt Scotch (shot)' },
      { name: 'Glenmorangie 10Yrs (Bottle)', price: 2299, description: 'Highland single malt Scotch (bottle)' },
      { name: 'Laphroaig 10 Years (Shot)', price: 85, description: 'Peaty and rich Islay single malt (shot)' },
      { name: 'Laphroaig 10 Years (Bottle)', price: 2299, description: 'Peaty and rich Islay single malt (bottle)' }
    ]
  },
  {
    name: 'Spirits (Rum, Vodka, Gin, Tequila)',
    description: 'Fine selection of Rums, Vodkas, Gins and Tequilas',
    displayOrder: 4,
    items: [
      // Rum
      { name: 'House Rum (Shot)', price: 65, description: 'House selected white/dark rum (shot)' },
      { name: 'House Rum (Bottle)', price: 999, description: 'Full bottle service' },
      { name: 'Bacardi Carta Blanca (Shot)', price: 88, description: 'Superior white rum (shot)' },
      { name: 'Bacardi Carta Blanca (Bottle)', price: 2099, description: 'Superior white rum (bottle)' },
      { name: 'Captain Morgan Spiced (Shot)', price: 88, description: 'Original spiced gold rum (shot)' },
      { name: 'Captain Morgan Spiced (Bottle)', price: 2099, description: 'Original spiced gold rum (bottle)' },
      { name: 'Myers\'s Dark Rum (Shot)', price: 88, description: 'Rich Jamaican dark rum (shot)' },
      { name: 'Myers\'s Dark Rum (Bottle)', price: 2099, description: 'Rich Jamaican dark rum (bottle)' },
      { name: 'Havana Club 3yr Old (Shot)', price: 88, description: 'Authentic Cuban white rum aged 3 years (shot)' },
      { name: 'Havana Club 3yr Old (Bottle)', price: 2099, description: 'Authentic Cuban white rum aged 3 years (bottle)' },
      { name: 'Havana Club 7yrs Old (Shot)', price: 92, description: 'Aged dark Cuban rum (shot)' },
      { name: 'Havana Club 7yrs Old (Bottle)', price: 2499, description: 'Aged dark Cuban rum (bottle)' },

      // Vodka
      { name: 'House Vodka (Shot)', price: 65, description: 'Standard house pour vodka (shot)' },
      { name: 'House Vodka (Bottle)', price: 999, description: 'Full bottle service' },
      { name: 'Grey Goose 75cl (Shot)', price: 88, description: 'French premium wheat vodka (shot)' },
      { name: 'Grey Goose 75cl (Bottle)', price: 2149, description: 'French premium wheat vodka (bottle)', isPopular: true },
      { name: 'Absolut Vodka (Shot)', price: 88, description: 'Swedish winter wheat vodka (shot)' },
      { name: 'Absolut Vodka (Bottle)', price: 2099, description: 'Swedish winter wheat vodka (bottle)' },
      { name: 'Belvedere 70cl (Shot)', price: 88, description: 'Polish luxury rye vodka (shot)' },
      { name: 'Belvedere 70cl (Bottle)', price: 2099, description: 'Polish luxury rye vodka (bottle)' },
      { name: 'Smirnoff No. 21 (Shot)', price: 75, description: 'Triple distilled classic vodka (shot)' },
      { name: 'Smirnoff No. 21 (Bottle)', price: 1999, description: 'Triple distilled classic vodka (bottle)' },
      { name: 'Coral Vodka (Shot)', price: 75, description: 'Filtered smooth vodka (shot)' },
      { name: 'Coral Vodka (Bottle)', price: 1599, description: 'Filtered smooth vodka (bottle)' },

      // Gin
      { name: 'House Gin (Shot)', price: 65, description: 'Classic London dry house gin (shot)' },
      { name: 'House Gin (Bottle)', price: 899, description: 'Full bottle service' },
      { name: 'Bombay Sapphire (Shot)', price: 88, description: 'Vapour infused botanical dry gin (shot)' },
      { name: 'Bombay Sapphire (Bottle)', price: 2099, description: 'Vapour infused botanical dry gin (bottle)', isPopular: true },
      { name: 'Tanqueray Dry Gin (Shot)', price: 88, description: 'Four-botanical London dry gin (shot)' },
      { name: 'Tanqueray Dry Gin (Bottle)', price: 2099, description: 'Four-botanical London dry gin (bottle)' },
      { name: 'Hendrick\'s Gin (Shot)', price: 98, description: 'Scottish gin infused with rose and cucumber (shot)' },
      { name: 'Hendrick\'s Gin (Bottle)', price: 2499, description: 'Scottish gin infused with rose and cucumber (bottle)', isPopular: true },
      { name: 'Monkey 47 (Shot)', price: 98, description: 'Schwarzwald dry gin with 47 handpicked botanicals (shot)' },
      { name: 'Monkey 47 (Bottle)', price: 2599, description: 'Schwarzwald dry gin with 47 handpicked botanicals (bottle)' },
      { name: 'Gin Billingsgate (Shot)', price: 75, description: 'London dry specialty gin (shot)' },
      { name: 'Gin Billingsgate (Bottle)', price: 1499, description: 'London dry specialty gin (bottle)' },

      // Tequila
      { name: 'House Tequila (Shot)', price: 85, description: 'House golden tequila (shot)' },
      { name: 'House Tequila (Bottle)', price: 1799, description: 'Full bottle service' },
      { name: 'Jose Cuervo Especial (Shot)', price: 90, description: 'Gold reposado tequila (shot)' },
      { name: 'Jose Cuervo Especial (Bottle)', price: 2199, description: 'Gold reposado tequila (bottle)' },
      { name: 'Patron Silver (Shot)', price: 95, description: '100% Weber blue agave crystal clear tequila (shot)' },
      { name: 'Patron Silver (Bottle)', price: 2499, description: '100% Weber blue agave crystal clear tequila (bottle)', isPopular: true },
      { name: 'Patron Anejo (Shot)', price: 105, description: 'Oak barrel-aged premium tequila (shot)' },
      { name: 'Patron Anejo (Bottle)', price: 2699, description: 'Oak barrel-aged premium tequila (bottle)' },
      { name: 'Don Julio Blanco (Shot)', price: 110, description: 'Crisp agave luxury tequila (shot)' },
      { name: 'Don Julio Blanco (Bottle)', price: 2888, description: 'Crisp agave luxury tequila (bottle)', isPopular: true }
    ]
  },
  {
    name: 'Cocktails',
    description: 'Handcrafted signature and classic cocktails',
    displayOrder: 5,
    items: [
      { name: 'Aperol Spritz', price: 125, description: 'Aperol, prosecco, splash of soda, slice of orange', isPopular: true },
      { name: 'Cosmopolitan', price: 110, description: 'Vodka, triple sec, cranberry juice, freshly squeezed lime' },
      { name: 'Black Russian / White Russian', price: 110, description: 'Vodka and coffee liqueur (optional fresh cream float)' },
      { name: 'Long Island Iced Tea', price: 125, description: 'Vodka, gin, rum, tequila, triple sec, lemon, cola splash', isPopular: true },
      { name: 'Classic Mojito', price: 125, description: 'White rum, fresh mint leaves, lime juice, brown sugar, soda', isPopular: true },
      { name: 'Classic Margarita', price: 110, description: 'Tequila, triple sec, fresh lime juice with salted rim', isPopular: true },
      { name: 'Strawberry Daiquiri', price: 110, description: 'White rum, strawberry puree, fresh lime juice' },
      { name: 'Piña Colada', price: 125, description: 'White rum, coconut cream, pineapple juice garnished with pineapple', isPopular: true }
    ]
  },
  {
    name: 'Champagne',
    description: 'Prestige and Vintage Champagnes (Bottle Service)',
    displayOrder: 6,
    items: [
      { name: 'Moët & Chandon Brut Impérial (Bottle)', price: 2130, description: 'Vibrant, generous and alluring classic Champagne (750ml)', isPopular: true },
      { name: 'Moët & Chandon Rosé Impérial (Bottle)', price: 2350, description: 'Spontaneous, radiant and romantic rosé Champagne (750ml)' },
      { name: 'Moët & Chandon Magnum (Bottle)', price: 3550, description: 'Celebratory 1.5L Magnum bottle' },
      { name: 'Veuve Clicquot Yellow Label (Bottle)', price: 2230, description: 'Iconic Champagne with perfect balance of strength and silkiness', isPopular: true },
      { name: 'Veuve Clicquot Rosé (Bottle)', price: 2430, description: 'Delicate burst of red fruit aromas and elegance (750ml)' },
      { name: 'Veuve Clicquot Magnum (Bottle)', price: 3650, description: 'Prestige 1.5L Magnum bottle' },
      { name: 'Perrier-Jouët Grand Brut (Bottle)', price: 2315, description: 'Floral and intricate cuvée from Épernay' },
      { name: 'Dom Pérignon Vintage (Bottle)', price: 5555, description: 'Legendary prestige vintage Champagne', isPopular: true },
      { name: 'Louis Roederer Cristal (Bottle)', price: 6888, description: 'The pinnacle of luxury Champagne, produced only in exceptional years', isPopular: true }
    ]
  }
];

async function main() {
  console.log('🚀 Seeding Sangeet Bar & Drinks Menu into Supabase...');

  // 1. Create or retrieve parent category "Bar & Drinks"
  let parentCat = await prisma.categories.findFirst({
    where: { name: 'Bar & Drinks' }
  });

  if (!parentCat) {
    parentCat = await prisma.categories.create({
      data: {
        name: 'Bar & Drinks',
        description: 'Fine beers, premium spirits, handcrafted cocktails & prestige champagne',
        display_order: 20,
        is_active: true
      }
    });
    console.log(`✅ Created parent category: ${parentCat.name} (id: ${parentCat.id})`);
  } else {
    console.log(`ℹ️ Found existing parent category: ${parentCat.name} (id: ${parentCat.id})`);
  }

  let totalItemsCreated = 0;
  let totalItemsUpdated = 0;

  const allSeedNames = BAR_CATEGORIES.flatMap((group) => group.items.map((item) => item.name));
  const existingMenuItems = await prisma.menu_items.findMany({
    where: { name: { in: allSeedNames } },
    select: { id: true, name: true, is_popular: true }
  });
  const existingByName = new Map(existingMenuItems.map((item) => [item.name, item]));

  for (const group of BAR_CATEGORIES) {
    // 2. Create or update subcategory
    let subCat = await prisma.categories.findFirst({
      where: {
        name: group.name,
        parent_id: parentCat.id
      }
    });

    if (!subCat) {
      // Also check if exists with null parent
      subCat = await prisma.categories.findFirst({
        where: { name: group.name }
      });
      if (subCat) {
        subCat = await prisma.categories.update({
          where: { id: subCat.id },
          data: {
            parent_id: parentCat.id,
            description: group.description,
            display_order: group.displayOrder
          }
        });
      } else {
        subCat = await prisma.categories.create({
          data: {
            name: group.name,
            description: group.description,
            parent_id: parentCat.id,
            display_order: group.displayOrder,
            is_active: true
          }
        });
      }
      console.log(`✅ Subcategory configured: ${subCat.name} (id: ${subCat.id})`);
    } else {
      console.log(`ℹ️ Subcategory exists: ${subCat.name} (id: ${subCat.id})`);
    }

    // 3. Batch upsert menu items under this subcategory
    const subCatId = subCat.id;
    await Promise.all(
      group.items.map(async (item) => {
        const existing = existingByName.get(item.name);
        const decimalPrice = new Prisma.Decimal(item.price);
        const imageUrl = item.imageUrl ?? getDrinkImageUrl(item.name, group.name);

        if (!existing) {
          await prisma.menu_items.create({
            data: {
              name: item.name,
              description: item.description,
              price: decimalPrice,
              category: group.name,
              category_id: subCatId,
              image_url: imageUrl,
              is_vegetarian: false,
              is_spicy: false,
              is_popular: item.isPopular ?? false,
              is_active: true,
              preparation_time: 5
            }
          });
          totalItemsCreated++;
        } else {
          await prisma.menu_items.update({
            where: { id: existing.id },
            data: {
              price: decimalPrice,
              description: item.description,
              category: group.name,
              category_id: subCatId,
              image_url: imageUrl,
              is_vegetarian: false,
              is_active: true,
              is_popular: item.isPopular ?? existing.is_popular
            }
          });
          totalItemsUpdated++;
        }
      })
    );
  }

  console.log(`\n🎉 Bar & Drinks Seed Complete!`);
  console.log(`📦 Categories added/verified: ${BAR_CATEGORIES.length}`);
  console.log(`✨ New Menu Items Created: ${totalItemsCreated}`);
  console.log(`🔄 Existing Items Updated: ${totalItemsUpdated}`);
  console.log(`📊 Total Bar Items Active: ${totalItemsCreated + totalItemsUpdated}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
