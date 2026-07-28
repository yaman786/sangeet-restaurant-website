import { prisma } from '../src/lib/db';

const menuData = {
  "restaurant": "Sangeet - Taste of South Asia",
  "address": "17 Fenwick Street, Wanchai, Hong Kong",
  "category": "Full Restaurant Menu",
  "currency": "HKD",
  "notes": "All prices are subject to 10% service charge",
  "items": [
    {
      "subcategory": "STARTERS",
      "name": "SOMOSA",
      "price": 60,
      "description": "Crispy pastry filled with spiced potatoes and peas."
    },
    {
      "subcategory": "STARTERS",
      "name": "VEG. PAKORA",
      "price": 60,
      "description": "Crispy, golden fritters made from chickpea batter, mixed with sliced onions, spinach, or potatoes, and seasoned with spices. Deep-fried to a perfect crunch."
    },
    {
      "subcategory": "STARTERS",
      "name": "PAPADUM",
      "price": 60,
      "description": "Thin, crisp, and savory lentil wafers, lightly seasoned and flame-toasted or deep-fried to a perfect golden crunch."
    },
    {
      "subcategory": "STARTERS",
      "name": "PAU BHAJI",
      "price": 75,
      "description": "A spiced, buttery mash of mixed vegetables served hot with soft, toasted buns, generously topped with butter and fresh onions."
    },
    {
      "subcategory": "STARTERS",
      "name": "VEG. SEEKH KEBAB",
      "price": 132,
      "description": "Minced vegetables seasoned with our special aromatic spices, skewered and grilled."
    },
    {
      "subcategory": "STARTERS",
      "name": "TANDOORI CHICKEN (HALF)",
      "price": 138,
      "description": "Half chicken marinated in yogurt, lemon, and a special blend of spices, then roasted in a traditional tandoor. Tender and smoky."
    },
    {
      "subcategory": "STARTERS",
      "name": "TANDOORI CHICKEN (FULL)",
      "price": 235,
      "description": "Full chicken marinated in yogurt, lemon, and a special blend of spices, then roasted in a traditional tandoor. Tender and smoky."
    },
    {
      "subcategory": "STARTERS",
      "name": "CHICKEN TIKKA",
      "price": 149,
      "description": "Boneless chicken chunks marinated in yogurt and aromatic spices, skewered and grilled in the tandoor. Juicy, tender, and lightly charred."
    },
    {
      "subcategory": "STARTERS",
      "name": "KALMI KEBAB",
      "price": 163,
      "description": "Chicken drumsticks marinated in yogurt, spices, and saffron, then grilled in the tandoor until tender and charred. Juicy and flavorful."
    },
    {
      "subcategory": "STARTERS",
      "name": "SEEKH KEBAB",
      "price": 168,
      "description": "Spiced, minced lamb seasoned with herbs, skewered, and grilled in the tandoor until smoky and charred. Juicy, flavorful, and aromatic."
    },
    {
      "subcategory": "STARTERS",
      "name": "RESHMI KEBAB",
      "price": 149,
      "description": "Delicate, melt-in-your-mouth kebabs made from minced chicken or lamb, marinated in cream, cashew paste, and mild spices. Grilled until soft and lightly charred."
    },
    {
      "subcategory": "STARTERS",
      "name": "TANDOORI TIGER PRAWN",
      "price": 215,
      "description": "Jumbo tiger prawns marinated in yogurt, lemon, and aromatic spices, then roasted in the tandoor. Succulent, smoky, and lightly charred."
    },
    {
      "subcategory": "STARTERS",
      "name": "FISH TIKKA",
      "price": 198,
      "description": "Tender cubes of marinated fish, infused with yogurt, lemon, and aromatic spices, grilled in the tandoor. Flaky, moist, and lightly charred."
    },
    {
      "subcategory": "STARTERS",
      "name": "PANEER TIKKA",
      "price": 138,
      "description": "Cubes of soft paneer marinated in spiced yogurt, skewered with bell peppers and onions, and grilled in the tandoor."
    },
    {
      "subcategory": "CHICKEN",
      "name": "BUTTER CHICKEN",
      "price": 128,
      "description": "Made with tender pieces of spiced roasted chicken in a richly spiced tomato and cream based sauce."
    },
    {
      "subcategory": "CHICKEN",
      "name": "CHICKEN KADAI",
      "price": 128,
      "description": "Made with tender chicken pieces simmered in a rich tomato and onion gravy, and crisp bell peppers."
    },
    {
      "subcategory": "CHICKEN",
      "name": "MURGH SAAG",
      "price": 128,
      "description": "Made with tender chicken pieces, leafy greens like spinach, and warm home made spices."
    },
    {
      "subcategory": "CHICKEN",
      "name": "TANDORRI CHICKEN TIKKA MASALA",
      "price": 148,
      "description": "Made of smoky, yogurt-marinated grilled chicken chunks served in a rich, spiced tomato-onion cream sauce."
    },
    {
      "subcategory": "CHICKEN",
      "name": "CHICKEN VINDALOO",
      "price": 138,
      "description": "Chicken is marinated and slow-cooked in a potent, vinegar-based sauce with blend of chilies and spices."
    },
    {
      "subcategory": "CHICKEN",
      "name": "CHICKEN KORMA",
      "price": 128,
      "description": "Tender chicken braised in a luxuriously creamy, mild, and fragrant sauce of yogurt, nuts, and aromatic spices. A classic, rich, and comforting dish fit for royalty."
    },
    {
      "subcategory": "LAMB",
      "name": "ROGAN JOSH",
      "price": 148,
      "description": "Aromatic lamb slow-cooked in a rich, crimson gravy of yogurt, tomatoes, and a warming blend of Kashmiri spices."
    },
    {
      "subcategory": "LAMB",
      "name": "KEEMA MUTTER",
      "price": 148,
      "description": "Savory, spiced ground lamb (or beef) simmered with sweet green peas in a rich, aromatic gravy."
    },
    {
      "subcategory": "LAMB",
      "name": "KADAI GOSHT",
      "price": 148,
      "description": "Tender pieces of lamb stir-fried with onions and bell peppers in a robust, dry masala of coarse-ground spices."
    },
    {
      "subcategory": "LAMB",
      "name": "GOSHT SAGWALA",
      "price": 148,
      "description": "A delicious North Indian curry made with tender meat and leafy greens."
    },
    {
      "subcategory": "LAMB",
      "name": "MUTTON VINDALOO",
      "price": 148,
      "description": "Mutton marinated and slow-cooked in a fiery, tangy, and intensely flavorful sauce of vinegar, chilies, and spices."
    },
    {
      "subcategory": "LAMB",
      "name": "BHUNA GOSHT",
      "price": 148,
      "description": "Lamb sauteed with onions and tomatoes to a medium dry gravy."
    },
    {
      "subcategory": "LAMB",
      "name": "MUGHLAI GOSHT",
      "price": 148,
      "description": "Tender lamb is slow-cooked in a luxurious, creamy, and fragrant gravy enriched with yogurt, ground nuts, saffron, and a delicate blend of Mughlai spices."
    },
    {
      "subcategory": "FISH & SHRIMP",
      "name": "GOAN FISH CURRY",
      "price": 135,
      "description": "Fresh fish in a creamy, tangy coconut curry, simmered with aromatic Goan spices. A comforting taste of coastal India."
    },
    {
      "subcategory": "FISH & SHRIMP",
      "name": "FISH MASALA",
      "price": 135,
      "description": "Tender fish fillets, marinated in a vibrant blend of toasted spices, simmered in a rich and aromatic tomato-onion curry."
    },
    {
      "subcategory": "FISH & SHRIMP",
      "name": "MADRAS FISH CURRY",
      "price": 135,
      "description": "Tender fish in a bold, tangy, and fiery red curry, bursting with classic South Indian spice."
    },
    {
      "subcategory": "FISH & SHRIMP",
      "name": "SHRIMP MASALA",
      "price": 158,
      "description": "Plump, juicy shrimp cooked in a rich, aromatic sauce of tomatoes, onions, and a warm, fragrant blend of spices."
    },
    {
      "subcategory": "FISH & SHRIMP",
      "name": "SHRIMP KADAI",
      "price": 158,
      "description": "Shrimp stir-fried with crisp bell peppers and onions in a robust, coarse-ground spice blend, finished with fresh coriander."
    },
    {
      "subcategory": "FISH & SHRIMP",
      "name": "GOAN SHRIMP CURRY",
      "price": 158,
      "description": "Plump shrimp simmered in a luscious, golden coconut curry, infused with the tang of tamarind and the warmth of Goan spices."
    },
    {
      "subcategory": "RICE & BIRYANI",
      "name": "BASMATI STEAM RICE",
      "price": 48,
      "description": "Steamed basmati rice."
    },
    {
      "subcategory": "RICE & BIRYANI",
      "name": "SAFFRON PULAO",
      "price": 58,
      "description": "Fragrant long-grain basmati rice, delicately infused with saffron, whole spices, and fried onions."
    },
    {
      "subcategory": "RICE & BIRYANI",
      "name": "VEGETARIAN BIRYANI",
      "price": 128,
      "description": "Aromatic basmati rice, layered with fresh vegetables and fragrant spices, slow-cooked to perfection."
    },
    {
      "subcategory": "RICE & BIRYANI",
      "name": "CHICKEN BIRYANI",
      "price": 148,
      "description": "Chicken marinated in yogurt and spices, layered with aromatic basmati rice and slow-cooked to perfection. Infused with saffron and caramelized onions."
    },
    {
      "subcategory": "RICE & BIRYANI",
      "name": "MUTTON BIRYANI",
      "price": 168,
      "description": "Tender, slow-cooked mutton pieces layered with fragrant basmati rice and aromatic whole spices, sealed and dum-cooked to perfection."
    },
    {
      "subcategory": "RICE & BIRYANI",
      "name": "SHRIMP BIRYANI",
      "price": 168,
      "description": "Plump, juicy shrimp marinated in spices, layered with fragrant basmati rice and slow-cooked to perfection. Lightly spiced and infused with saffron."
    },
    {
      "subcategory": "VEGETARIAN MAINS",
      "name": "DAL MAKHANI / DAL TARKA",
      "price": 88,
      "description": "Black lentils simmered overnight finished with ginger, garlic and tomato."
    },
    {
      "subcategory": "VEGETARIAN MAINS",
      "name": "ALOO JIRA",
      "price": 88,
      "description": "Potatoes cooked with cumin seeds and handmade spices."
    },
    {
      "subcategory": "VEGETARIAN MAINS",
      "name": "ALOO GOBI",
      "price": 88,
      "description": "Healthy dish made of potatoes and fresh cauliflower cooked in light spices."
    },
    {
      "subcategory": "VEGETARIAN MAINS",
      "name": "SABJI MAKHANWALA",
      "price": 88,
      "description": "Garden-fresh mixed vegetables are simmered in our signature rich, creamy, and lightly spiced tomato-butter sauce."
    },
    {
      "subcategory": "VEGETARIAN MAINS",
      "name": "BHINDI MASALA",
      "price": 88,
      "description": "Fresh okra is pan-fried until tender, then sautéed with onions, tomatoes, and a blend of spices."
    },
    {
      "subcategory": "VEGETARIAN MAINS",
      "name": "MALAI KOFTA",
      "price": 125,
      "description": "Delicate, creamy dumplings made from paneer and potatoes are fried golden and served in a rich, velvety, and mildly spiced tomato-cashew gravy."
    },
    {
      "subcategory": "VEGETARIAN MAINS",
      "name": "PANEER TIKKA MASALA",
      "price": 125,
      "description": "Grilled cubes of marinated paneer are simmered in our signature rich, creamy, and aromatic tomato-cashew gravy."
    },
    {
      "subcategory": "VEGETARIAN MAINS",
      "name": "PALAK PANEER",
      "price": 125,
      "description": "Soft cubes of paneer are nestled in a creamy, smooth purée of fresh spinach, gently spiced with garlic, ginger, and aromatic herbs."
    },
    {
      "subcategory": "VEGETARIAN MAINS",
      "name": "KADAI PANEER",
      "price": 125,
      "description": "Cubes of paneer and crisp bell peppers are stir-fried in a robust, dry masala of coarsely ground spices, cooked in a traditional Indian wok."
    },
    {
      "subcategory": "VEGETARIAN MAINS",
      "name": "MUTTER PANEER",
      "price": 125,
      "description": "Soft cubes of paneer and sweet green peas are simmered together in a mildly spiced, creamy, and rich tomato-based gravy."
    },
    {
      "subcategory": "VEGETARIAN MAINS",
      "name": "BAIGAN BHARTA",
      "price": 125,
      "description": "Whole eggplant is roasted over an open flame until tender, then mashed and sautéed with onions, tomatoes, garlic, and spices."
    },
    {
      "subcategory": "VEGETARIAN MAINS",
      "name": "CHANA MASALA",
      "price": 88,
      "description": "A beloved classic. Chickpeas are simmered in a tangy, aromatic, and robust gravy of tomatoes, onions, and a special blend of spices."
    },
    {
      "subcategory": "INDIAN BREAD (NAAN)",
      "name": "PLAIN NAAN",
      "price": 35,
      "description": "Traditional tandoor-baked flatbread."
    },
    {
      "subcategory": "INDIAN BREAD (NAAN)",
      "name": "BUTTER NAAN",
      "price": 43,
      "description": "Tandoor-baked flatbread brushed with butter."
    },
    {
      "subcategory": "INDIAN BREAD (NAAN)",
      "name": "GARLIC NAAN",
      "price": 43,
      "description": "Tandoor-baked flatbread topped with minced garlic and herbs."
    },
    {
      "subcategory": "INDIAN BREAD (NAAN)",
      "name": "TANDOORI ROTI",
      "price": 35,
      "description": "Whole wheat flatbread baked in the tandoor."
    },
    {
      "subcategory": "INDIAN BREAD (NAAN)",
      "name": "BUTTER ROTI",
      "price": 43,
      "description": "Whole wheat tandoori flatbread brushed with butter."
    },
    {
      "subcategory": "INDIAN BREAD (NAAN)",
      "name": "PARATHA",
      "price": 43,
      "description": "Flaky, buttery Indian flatbread, layered and pan-fried until golden brown and crispy."
    },
    {
      "subcategory": "INDIAN BREAD (NAAN)",
      "name": "ONION KULCHA",
      "price": 58,
      "description": "A soft, tandoor-baked flatbread generously stuffed with spiced, finely chopped onions and fresh herbs. Lightly brushed with butter for a golden finish."
    },
    {
      "subcategory": "INDIAN BREAD (NAAN)",
      "name": "CHEESE KULCHA",
      "price": 68,
      "description": "A soft, tandoor-baked flatbread generously stuffed with a gooey, melted blend of cheese and mild spices. Lightly brushed with butter for a golden, indulgent finish."
    },
    {
      "subcategory": "INDIAN DESSERTS",
      "name": "HOMEMADE RASMALAI",
      "price": 78,
      "description": "Soft, spongy cottage cheese dumplings soaked in chilled, saffron-infused milk. Garnished with chopped pistachios and a hint of cardamom."
    },
    {
      "subcategory": "INDIAN DESSERTS",
      "name": "GULAB JAMUN",
      "price": 75,
      "description": "Warm, soft milk-solid dumplings deep-fried to golden perfection and soaked in a fragrant sugar syrup infused with cardamom and rose water."
    },
    {
      "subcategory": "INDIAN DESSERTS",
      "name": "HOMEMADE PISTA KULFI",
      "price": 95,
      "description": "A rich, creamy Indian ice cream made from slow-cooked milk, generously flavored with pistachios and cardamom."
    },
    {
      "subcategory": "INDIAN DESSERTS",
      "name": "GAJAR HALWA",
      "price": 88,
      "description": "A warm, decadent dessert made from slow-cooked carrots, simmered in milk and ghee until rich and thick. Loaded with nuts and sweetened to perfection."
    },
    {
      "subcategory": "INDIAN DESSERTS",
      "name": "ICE CREAMS (SUBJECT TO AVAILABILITY)",
      "price": 68,
      "description": "Assorted flavors, subject to availability."
    }
  ]
};

function titleCase(str: string) {
  return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
}

async function main() {
  console.log("Starting menu seeding...");
  
  // 1. Clean slate
  console.log("Deleting existing menu items and categories...");
  await prisma.order_items.deleteMany({});
  await prisma.menu_items.deleteMany({});
  await prisma.categories.deleteMany({});
  
  // 2. Create Categories
  console.log("Creating categories...");
  const starters = await prisma.categories.create({
    data: { name: 'Starters', display_order: 1, description: 'Delicious Indian appetizers and tandoor-grilled starters' }
  });
  
  const nonVegMains = await prisma.categories.create({
    data: { name: 'Non-Veg Mains', display_order: 2, description: 'Authentic non-vegetarian curries and specialities' }
  });
  
  const vegMains = await prisma.categories.create({
    data: { name: 'Vegetarian Mains', display_order: 3, description: 'Authentic vegetarian curries and specialities' }
  });
  
  const indianBread = await prisma.categories.create({
    data: { name: 'Indian Bread', display_order: 4, description: 'Traditional tandoor-baked breads' }
  });
  
  const indianDesserts = await prisma.categories.create({
    data: { name: 'Indian Desserts', display_order: 5, description: 'Classic Indian sweets and desserts' }
  });
  
  // Create Subcategories under Non-Veg Mains
  const chicken = await prisma.categories.create({
    data: { name: 'Chicken', parent_id: nonVegMains.id, display_order: 1, description: 'Chicken curries and specialities' }
  });
  
  const lamb = await prisma.categories.create({
    data: { name: 'Lamb', parent_id: nonVegMains.id, display_order: 2, description: 'Lamb and mutton curries' }
  });
  
  const fishShrimp = await prisma.categories.create({
    data: { name: 'Fish & Shrimp', parent_id: nonVegMains.id, display_order: 3, description: 'Seafood curries and specialities' }
  });
  
  const riceBiryani = await prisma.categories.create({
    data: { name: 'Rice & Biryani', parent_id: nonVegMains.id, display_order: 4, description: 'Aromatic rice dishes and biryanis' }
  });
  
  const categoryMap = {
    'STARTERS': starters.id,
    'CHICKEN': chicken.id,
    'LAMB': lamb.id,
    'FISH & SHRIMP': fishShrimp.id,
    'RICE & BIRYANI': riceBiryani.id,
    'VEGETARIAN MAINS': vegMains.id,
    'INDIAN BREAD (NAAN)': indianBread.id,
    'INDIAN DESSERTS': indianDesserts.id
  };
  
  const categoryNameMap = {
    'STARTERS': 'Starters',
    'CHICKEN': 'Chicken',
    'LAMB': 'Lamb',
    'FISH & SHRIMP': 'Fish & Shrimp',
    'RICE & BIRYANI': 'Rice & Biryani',
    'VEGETARIAN MAINS': 'Vegetarian Mains',
    'INDIAN BREAD (NAAN)': 'Indian Bread',
    'INDIAN DESSERTS': 'Indian Desserts'
  };

  const vegNames = new Set([
    'SOMOSA', 'VEG. PAKORA', 'PAPADUM', 'PAU BHAJI', 'VEG. SEEKH KEBAB', 'PANEER TIKKA',
    'BASMATI STEAM RICE', 'SAFFRON PULAO', 'VEGETARIAN BIRYANI'
  ]);
  
  const spicyNames = new Set([
    'CHICKEN VINDALOO', 'MUTTON VINDALOO', 'MADRAS FISH CURRY'
  ]);
  
  const popularNames = new Set([
    'BUTTER CHICKEN', 'TANDOORI CHICKEN (HALF)', 'CHICKEN TIKKA', 'CHICKEN BIRYANI', 
    'DAL MAKHANI / DAL TARKA', 'PALAK PANEER', 'BUTTER NAAN', 'GARLIC NAAN', 'GULAB JAMUN'
  ]);

  // 3. Create Menu Items
  console.log("Creating menu items...");
  let count = 0;
  for (const item of menuData.items) {
    const isVegetarian = vegNames.has(item.name) || 
      ['VEGETARIAN MAINS', 'INDIAN BREAD (NAAN)', 'INDIAN DESSERTS'].includes(item.subcategory);
    const isSpicy = spicyNames.has(item.name);
    const isPopular = popularNames.has(item.name);
    
    await prisma.menu_items.create({
      data: {
        name: titleCase(item.name).replace('Veg. ', 'Veg ').replace(' / ', ' / '),
        price: item.price,
        description: item.description,
        category: categoryNameMap[item.subcategory as keyof typeof categoryNameMap],
        category_id: categoryMap[item.subcategory as keyof typeof categoryMap],
        is_vegetarian: isVegetarian,
        is_spicy: isSpicy,
        is_popular: isPopular,
        preparation_time: 15,
        is_active: true
      }
    });
    count++;
  }
  
  console.log(`Successfully seeded ${count} menu items!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
