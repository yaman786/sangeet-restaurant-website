import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Search, Plus, Minus, Leaf, Flame, Star, X, UtensilsCrossed, Wine } from 'lucide-react';
import { isBarCategory, isBarMenuItem, groupDrinkMenuItems, type MenuSection } from '@/lib/utils/menuSection';

const MenuView = ({ 
  menuItems = [], 
  categories = [], 
  selectedCategory, 
  setSelectedCategory, 
  searchTerm, 
  setSearchTerm, 
  onAddToCart, 
  onUpdateQuantity,
  onViewCart,
  cart = [],
  cartLength = 0
}: any) => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [menuSection, setMenuSection] = useState<MenuSection>('food');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [quickFilter, setQuickFilter] = useState<'all' | 'veg' | 'spicy' | 'popular'>('all');
  const [selectedServingMap, setSelectedServingMap] = useState<Record<number, 'shot' | 'bottle'>>({});

  const topLevelCategories = useMemo(
    () => categories.filter((c: any) => !c.parent_id),
    [categories]
  );
  const subCategories = useMemo(
    () => categories.filter((c: any) => c.parent_id),
    [categories]
  );
  const foodTopLevelCategories = useMemo(
    () => topLevelCategories.filter((c: any) => !isBarCategory(c, categories)),
    [topLevelCategories, categories]
  );
  const barSubCategories = useMemo(
    () => subCategories.filter((c: any) => isBarCategory(c, categories)),
    [subCategories, categories]
  );

  // Food subcategories for currently selected top-level food category (if any)
  const activeFoodParentObj = useMemo(
    () => foodTopLevelCategories.find((c: any) => c.name === selectedCategory),
    [foodTopLevelCategories, selectedCategory]
  );
  const activeFoodSubCategories = useMemo(
    () =>
      activeFoodParentObj
        ? subCategories.filter((c: any) => Number(c.parent_id) === Number(activeFoodParentObj.id))
        : [],
    [activeFoodParentObj, subCategories]
  );

  const foodCount = useMemo(
    () => menuItems.filter((item: any) => !isBarMenuItem(item, categories)).length,
    [menuItems, categories]
  );
  const drinkCount = useMemo(
    () => groupDrinkMenuItems(menuItems.filter((item: any) => isBarMenuItem(item, categories))).length,
    [menuItems, categories]
  );

  const cartQuantityMap = useMemo(() => {
    const map = new Map<number, number>();
    if (Array.isArray(cart)) {
      for (const c of cart) {
        if (c && c.id !== undefined) {
          map.set(Number(c.id), Number(c.quantity || 1));
        }
      }
    }
    return map;
  }, [cart]);

  const handleSectionSwitch = (section: MenuSection) => {
    setMenuSection(section);
    setSelectedCategory(section === 'drinks' ? 'Bar & Drinks' : 'all');
    setSelectedSubCategory('all');
    setQuickFilter('all');
  };

  // Filter menu items strictly by active section (Food vs Bar & Drinks), category/subcategory, quick filter, and search
  const filteredItems = menuItems.filter((item: any) => {
    const itemIsBar = isBarMenuItem(item, categories);
    if (menuSection === 'food' && itemIsBar) return false;
    if (menuSection === 'drinks' && !itemIsBar) return false;

    let matchesCategory = true;
    const itemCat = item.category_name || item.category;

    if (menuSection === 'food') {
      if (selectedSubCategory !== 'all') {
        const subObj = activeFoodSubCategories.find((c: any) => c.name === selectedSubCategory);
        matchesCategory =
          itemCat === selectedSubCategory ||
          Boolean(subObj && Number(item.category_id) === Number(subObj.id));
      } else if (selectedCategory !== 'all') {
        const selectedCatObj = foodTopLevelCategories.find((c: any) => c.name === selectedCategory);
        const childCats = subCategories.filter((c: any) => Number(c.parent_id) === Number(selectedCatObj?.id));
        const childCategoryNames = childCats.map((c: any) => c.name);
        const childCategoryIds = childCats.map((c: any) => c.id);
        const validCategoryNames = [selectedCategory, ...childCategoryNames];
        const validCategoryIds = [selectedCatObj?.id, ...childCategoryIds].filter(Boolean);
        matchesCategory = validCategoryNames.includes(itemCat) || validCategoryIds.includes(item.category_id);
      }
    } else {
      if (selectedSubCategory !== 'all') {
        const subCatObj = barSubCategories.find((c: any) => c.name === selectedSubCategory);
        matchesCategory = itemCat === selectedSubCategory || Boolean(subCatObj && item.category_id === subCatObj.id);
      }
    }

    let matchesQuickFilter = true;
    if (quickFilter === 'veg') matchesQuickFilter = Boolean(item.is_vegetarian);
    else if (quickFilter === 'spicy') matchesQuickFilter = Boolean(item.is_spicy);
    else if (quickFilter === 'popular') matchesQuickFilter = Boolean(item.is_popular);

    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesQuickFilter && matchesSearch;
  });

  // Group items by category (and merge Shot + Bottle pairs when in Bar & Drinks mode)
  const itemsByCategory = useMemo(() => {
    const rawGrouped = filteredItems.reduce((acc: any, item: any) => {
      const catName = item.category_name || item.category;
      if (!acc[catName]) {
        acc[catName] = [];
      }
      acc[catName].push(item);
      return acc;
    }, {});

    if (menuSection === 'drinks') {
      const merged: Record<string, any[]> = {};
      for (const [catName, list] of Object.entries(rawGrouped)) {
        merged[catName] = groupDrinkMenuItems(list as any[]);
      }
      return merged;
    }

    return rawGrouped;
  }, [filteredItems, menuSection]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8 pb-24" // Extra padding for floating cart
    >
      {/* Search and Filter - Liquid Glass Pill */}
      <div className="sticky top-4 z-40 bg-[#1C1917]/85 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-glass">
        {/* Two-Way Menu Switcher: Food Menu vs Bar & Drinks */}
        <div
          role="tablist"
          aria-label="Menu section switcher"
          className="grid grid-cols-2 gap-2 p-1 bg-black/40 border border-white/10 rounded-xl mb-3"
        >
          <button
            type="button"
            role="tab"
            aria-selected={menuSection === 'food'}
            data-testid="qr-menu-food"
            onClick={() => handleSectionSwitch('food')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
              menuSection === 'food'
                ? 'bg-sangeet-400 text-sangeet-neutral-950 shadow-gold-glow'
                : 'text-sangeet-neutral-300 hover:bg-white/5'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4 shrink-0" />
            <span>Food Menu</span>
            {foodCount > 0 && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  menuSection === 'food'
                    ? 'bg-sangeet-neutral-950/15 text-sangeet-neutral-950'
                    : 'bg-white/10 text-sangeet-neutral-400'
                }`}
              >
                {foodCount}
              </span>
            )}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={menuSection === 'drinks'}
            data-testid="qr-menu-drinks"
            onClick={() => handleSectionSwitch('drinks')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
              menuSection === 'drinks'
                ? 'bg-sangeet-400 text-sangeet-neutral-950 shadow-gold-glow'
                : 'text-sangeet-neutral-300 hover:bg-white/5'
            }`}
          >
            <Wine className="w-4 h-4 shrink-0" />
            <span>Bar &amp; Drinks</span>
            {drinkCount > 0 && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  menuSection === 'drinks'
                    ? 'bg-sangeet-neutral-950/15 text-sangeet-neutral-950'
                    : 'bg-white/10 text-sangeet-neutral-400'
                }`}
              >
                {drinkCount}
              </span>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-3">
          <div className="relative group">
            <input
              type="text"
              placeholder={
                menuSection === 'drinks'
                  ? 'Search beers, whiskies, spirits, cocktails...'
                  : 'Search our culinary offerings...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-white/5 border border-white/10 rounded-xl text-sangeet-neutral-100 placeholder-sangeet-neutral-500 focus:outline-hidden focus:border-sangeet-400 focus:bg-white/10 transition-all duration-300"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-sangeet-neutral-500 group-focus-within:text-sangeet-400 transition-colors duration-300 w-5 h-5" />
            {searchTerm && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-sangeet-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills scoped to active section */}
        {menuSection === 'food' ? (
          <div className="space-y-2.5">
            <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide -mx-2 px-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedSubCategory('all');
                }}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-sangeet-400 text-sangeet-neutral-950 shadow-gold-glow'
                    : 'bg-white/5 text-sangeet-neutral-300 hover:bg-white/10 border border-white/5'
                }`}
              >
                All Offerings
              </button>
              {foodTopLevelCategories.map((category: any) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.name);
                    setSelectedSubCategory('all');
                  }}
                  className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer ${
                    selectedCategory === category.name
                      ? 'bg-sangeet-400 text-sangeet-neutral-950 shadow-gold-glow'
                      : 'bg-white/5 text-sangeet-neutral-300 hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Dynamic Food 2nd-Level Subcategories (e.g., Chicken, Lamb, Seafood) */}
            {activeFoodSubCategories.length > 0 && (
              <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide -mx-2 px-2 pt-1 border-t border-white/5" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <button
                  onClick={() => setSelectedSubCategory('all')}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer border ${
                    selectedSubCategory === 'all'
                      ? 'bg-sangeet-400/20 text-sangeet-400 border-sangeet-400/50'
                      : 'bg-white/5 text-sangeet-neutral-400 border-white/10 hover:text-sangeet-neutral-200'
                  }`}
                >
                  All {selectedCategory}
                </button>
                {activeFoodSubCategories.map((sub: any) => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubCategory(sub.name)}
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer border ${
                      selectedSubCategory === sub.name
                        ? 'bg-sangeet-400/20 text-sangeet-400 border-sangeet-400/50'
                        : 'bg-white/5 text-sangeet-neutral-400 border-white/10 hover:text-sangeet-neutral-200'
                    }`}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            )}

            {/* Quick Dietary & Chef's Special Chips for Food */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pt-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <button
                type="button"
                onClick={() => setQuickFilter(quickFilter === 'veg' ? 'all' : 'veg')}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                  quickFilter === 'veg'
                    ? 'bg-green-500/20 text-green-300 border-green-500/50'
                    : 'bg-white/5 text-sangeet-neutral-400 border-white/10 hover:text-sangeet-neutral-200'
                }`}
              >
                <Leaf className="w-3.5 h-3.5 text-green-400" />
                <span>Vegetarian</span>
              </button>
              <button
                type="button"
                onClick={() => setQuickFilter(quickFilter === 'spicy' ? 'all' : 'spicy')}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                  quickFilter === 'spicy'
                    ? 'bg-red-500/20 text-red-300 border-red-500/50'
                    : 'bg-white/5 text-sangeet-neutral-400 border-white/10 hover:text-sangeet-neutral-200'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-red-400" />
                <span>Spicy</span>
              </button>
              <button
                type="button"
                onClick={() => setQuickFilter(quickFilter === 'popular' ? 'all' : 'popular')}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                  quickFilter === 'popular'
                    ? 'bg-sangeet-400/20 text-sangeet-300 border-sangeet-400/50'
                    : 'bg-white/5 text-sangeet-neutral-400 border-white/10 hover:text-sangeet-neutral-200'
                }`}
              >
                <Star className="w-3.5 h-3.5 text-sangeet-400" />
                <span>Chef&apos;s Special</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide -mx-2 px-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <button
                onClick={() => setSelectedSubCategory('all')}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer border ${
                  selectedSubCategory === 'all'
                    ? 'bg-sangeet-400 text-sangeet-neutral-950 border-sangeet-400 shadow-gold-glow'
                    : 'bg-white/5 text-sangeet-neutral-300 border-white/10 hover:bg-white/10'
                }`}
              >
                All Bar &amp; Drinks
              </button>
              {barSubCategories.map((subCat: any) => (
                <button
                  key={subCat.id}
                  onClick={() => setSelectedSubCategory(subCat.name)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border ${
                    selectedSubCategory === subCat.name
                      ? 'bg-sangeet-400 text-sangeet-neutral-950 border-sangeet-400 shadow-gold-glow'
                      : 'bg-white/5 text-sangeet-neutral-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {subCat.name}
                </button>
              ))}
            </div>

            {/* Quick Signature / Popular Chip for Bar & Drinks */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pt-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <button
                type="button"
                onClick={() => setQuickFilter(quickFilter === 'popular' ? 'all' : 'popular')}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                  quickFilter === 'popular'
                    ? 'bg-sangeet-400/20 text-sangeet-300 border-sangeet-400/50'
                    : 'bg-white/5 text-sangeet-neutral-400 border-white/10 hover:text-sangeet-neutral-200'
                }`}
              >
                <Star className="w-3.5 h-3.5 text-sangeet-400" />
                <span>Popular &amp; Signature Serves</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Menu Items */}
      {Object.keys(itemsByCategory).length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 px-4 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10"
        >
          <Search className="w-12 h-12 text-sangeet-neutral-500 mx-auto mb-4 opacity-50" />
          <h3 className="font-display text-2xl text-sangeet-400 mb-2">
            {menuSection === 'drinks' ? 'No drinks found' : 'No culinary items found'}
          </h3>
          <p className="text-sangeet-neutral-400 mb-4">
            Please refine your search or category selection.
          </p>
          {(searchTerm || quickFilter !== 'all' || selectedSubCategory !== 'all' || (menuSection === 'food' && selectedCategory !== 'all')) && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setQuickFilter('all');
                setSelectedSubCategory('all');
                if (menuSection === 'food') setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-xl bg-sangeet-400/20 border border-sangeet-400/40 text-sangeet-400 text-sm font-semibold hover:bg-sangeet-400 hover:text-sangeet-neutral-950 transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-12">
          {Object.entries(itemsByCategory).map(([categoryName, items]) => (
            <div key={categoryName} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-3xl text-sangeet-neutral-100 flex items-center">
                  <span className="bg-sangeet-400 w-1.5 h-8 rounded-full mr-4 inline-block"></span>
                  {categoryName}
                </h2>
                <span className="text-xs font-medium text-sangeet-neutral-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                  {(items as any[]).length} {(items as any[]).length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {(items as any[]).map((item: any) => {
                  const isDualServing = item.servingMode === 'shot_and_bottle' && item.shotItem && item.bottleItem;
                  const isBottleOnly = item.servingMode === 'bottle_only' && item.bottleItem;
                  const activeServing: 'shot' | 'bottle' = selectedServingMap[item.id] || 'shot';
                  const activeVariant = isDualServing
                    ? activeServing === 'bottle'
                      ? item.bottleItem
                      : item.shotItem
                    : isBottleOnly
                    ? item.bottleItem
                    : item;

                  const shotQty = isDualServing ? (cartQuantityMap.get(Number(item.shotItem.id)) || 0) : 0;
                  const bottleQty = isDualServing ? (cartQuantityMap.get(Number(item.bottleItem.id)) || 0) : 0;
                  const quantityInCart = cartQuantityMap.get(Number(activeVariant.id)) || 0;
                  const totalGroupQty = isDualServing ? shotQty + bottleQty : quantityInCart;

                  return (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      whileHover={{ y: -4, scale: 1.01 }}
                      onClick={() => setSelectedItem(item)}
                      className={`group bg-white/5 backdrop-blur-xl rounded-3xl p-4 border transition-all duration-400 shadow-glass overflow-hidden relative cursor-pointer flex flex-col h-full ${
                        totalGroupQty > 0
                          ? 'border-sangeet-400/60 ring-1 ring-sangeet-400/30'
                          : 'border-white/10 hover:border-sangeet-400/30'
                      }`}
                    >
                      {/* Item Image */}
                      <div className="relative mb-5 overflow-hidden rounded-2xl aspect-4/3 shrink-0">
                        <div className="absolute inset-0 bg-linear-to-t from-[#1C1917]/80 to-transparent z-10"></div>
                        <Image
                          src={activeVariant.image_url || item.image_url || 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop'}
                          alt={item.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out-expo"
                        />

                        {/* Quantity in Order Badge (Top-Left) */}
                        {totalGroupQty > 0 && (
                          <div
                            data-testid={`qr-card-qty-badge-${item.id}`}
                            className="absolute top-3 left-3 z-20 bg-sangeet-400 text-sangeet-neutral-950 px-3 py-1 rounded-full text-xs font-bold shadow-lg"
                          >
                            {totalGroupQty} in order
                          </div>
                        )}

                        {/* Dietary / Popular Badges (Top-Right) */}
                        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                          {item.is_popular && (
                            <div className="bg-sangeet-400/90 backdrop-blur-md text-sangeet-neutral-950 p-2 rounded-full shadow-lg" title="Popular">
                              <Star className="w-3.5 h-3.5 fill-current" />
                            </div>
                          )}
                          {item.is_spicy && menuSection === 'food' && (
                            <div className="bg-red-500/90 backdrop-blur-md text-white p-2 rounded-full shadow-lg" title="Spicy">
                              <Flame className="w-3.5 h-3.5" />
                            </div>
                          )}
                          {item.is_vegetarian && menuSection === 'food' && (
                            <div className="bg-green-500/90 backdrop-blur-md text-white p-2 rounded-full shadow-lg" title="Vegetarian">
                              <Leaf className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        <div className="absolute bottom-3 left-3 z-20 flex items-baseline gap-1.5">
                          <span className="font-display text-2xl font-bold text-white tracking-wide">
                            ${parseFloat(activeVariant.price).toFixed(2)}
                          </span>
                          {isDualServing && (
                            <span className="text-xs font-medium text-sangeet-300/90 uppercase tracking-wider">
                              / {activeServing === 'bottle' ? 'Bottle' : 'Shot'}
                            </span>
                          )}
                          {isBottleOnly && (
                            <span className="text-xs font-medium text-sangeet-300/90 uppercase tracking-wider">
                              / Bottle
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Item Details */}
                      <div className="px-2 flex flex-col flex-1">
                        <h3 className="font-display text-xl text-sangeet-neutral-100 mb-2 leading-tight">
                          {item.name}
                        </h3>
                        <p className="text-sangeet-neutral-400 text-sm line-clamp-2 leading-relaxed mb-4 font-light flex-1">
                          {item.description}
                        </p>

                        {/* Two-Way Serving Toggle: Shot vs Full Bottle (for Spirits & Whiskies) */}
                        {isDualServing && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            data-testid={`qr-serving-toggle-${item.id}`}
                            className="grid grid-cols-2 gap-1.5 p-1 bg-black/40 border border-white/10 rounded-xl mb-3"
                          >
                            <button
                              type="button"
                              data-testid={`qr-select-shot-${item.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedServingMap((prev) => ({ ...prev, [item.id]: 'shot' }));
                              }}
                              className={`py-2 px-2.5 min-h-[36px] rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                                activeServing === 'shot'
                                  ? 'bg-sangeet-400 text-sangeet-neutral-950 shadow-xs'
                                  : 'text-sangeet-neutral-300 hover:bg-white/5'
                              }`}
                            >
                              <span>Shot · ${parseFloat(item.shotItem.price).toFixed(0)}</span>
                              {shotQty > 0 && (
                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                  activeServing === 'shot' ? 'bg-black/20 text-sangeet-neutral-950' : 'bg-sangeet-400/20 text-sangeet-400'
                                }`}>
                                  {shotQty}
                                </span>
                              )}
                            </button>
                            <button
                              type="button"
                              data-testid={`qr-select-bottle-${item.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedServingMap((prev) => ({ ...prev, [item.id]: 'bottle' }));
                              }}
                              className={`py-2 px-2.5 min-h-[36px] rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                                activeServing === 'bottle'
                                  ? 'bg-sangeet-400 text-sangeet-neutral-950 shadow-xs'
                                  : 'text-sangeet-neutral-300 hover:bg-white/5'
                              }`}
                            >
                              <span>Bottle · ${parseFloat(item.bottleItem.price).toFixed(0)}</span>
                              {bottleQty > 0 && (
                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                  activeServing === 'bottle' ? 'bg-black/20 text-sangeet-neutral-950' : 'bg-sangeet-400/20 text-sangeet-400'
                                }`}>
                                  {bottleQty}
                                </span>
                              )}
                            </button>
                          </div>
                        )}

                        {isBottleOnly && (
                          <div className="mb-3">
                            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-sangeet-300">
                              Full Bottle Service · ${parseFloat(activeVariant.price).toFixed(0)}
                            </span>
                          </div>
                        )}

                        {/* Inline Quantity Stepper when in Cart, or Add to Order Button */}
                        {quantityInCart > 0 && onUpdateQuantity ? (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            data-testid={`qr-stepper-${activeVariant.id}`}
                            className="w-full bg-sangeet-400/15 border border-sangeet-400/50 rounded-xl p-1.5 flex items-center justify-between mt-auto"
                          >
                            <motion.button
                              type="button"
                              whileTap={{ scale: 0.9 }}
                              data-testid={`qr-decrement-${activeVariant.id}`}
                              aria-label={`Decrease ${activeVariant.name} quantity`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateQuantity(activeVariant.id, quantityInCart - 1);
                              }}
                              className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 text-sangeet-400 flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer"
                            >
                              <Minus className="w-4 h-4" />
                            </motion.button>
                            <span className="font-semibold text-sm text-sangeet-300">
                              {quantityInCart} {isDualServing ? (activeServing === 'bottle' ? 'Bottle' : 'Shot') : ''} in Order
                            </span>
                            <motion.button
                              type="button"
                              whileTap={{ scale: 0.9 }}
                              data-testid={`qr-increment-${activeVariant.id}`}
                              aria-label={`Increase ${activeVariant.name} quantity`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateQuantity(activeVariant.id, quantityInCart + 1);
                              }}
                              className="w-10 h-10 rounded-lg bg-sangeet-400 text-sangeet-neutral-950 flex items-center justify-center hover:bg-sangeet-300 transition-colors cursor-pointer font-bold"
                            >
                              <Plus className="w-4 h-4" />
                            </motion.button>
                          </div>
                        ) : (
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCart(activeVariant);
                            }}
                            className="w-full bg-white/5 border border-white/10 text-sangeet-400 py-3.5 px-4 rounded-xl font-semibold hover:bg-sangeet-400 hover:text-sangeet-neutral-950 transition-all duration-300 flex items-center justify-center space-x-2 shadow-xs mt-auto cursor-pointer"
                          >
                            <Plus className="w-5 h-5" />
                            <span>
                              {isDualServing
                                ? `Add ${activeServing === 'bottle' ? 'Bottle' : 'Shot'} to Order`
                                : 'Add to Order'}
                            </span>
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          ))}
        </div>
      )}

      {/* Item Details Modal */}
      <AnimatePresence>
        {selectedItem && (() => {
          const isModalDual = selectedItem.servingMode === 'shot_and_bottle' && selectedItem.shotItem && selectedItem.bottleItem;
          const modalServing = isModalDual ? (selectedServingMap[selectedItem.id] || 'shot') : 'single';
          const modalVariant = isModalDual
            ? (modalServing === 'bottle' ? selectedItem.bottleItem : selectedItem.shotItem)
            : (selectedItem.singleItem || selectedItem.bottleItem || selectedItem);

          return (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedItem(null)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
              />
              <motion.div
                initial={{ opacity: 0, y: 100, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 100, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 w-full md:max-w-lg bg-[#1C1917] md:rounded-3xl rounded-t-3xl border-t md:border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              >
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="relative w-full aspect-4/3 shrink-0">
                  <Image
                    src={modalVariant.image_url || selectedItem.image_url || 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop'}
                    alt={selectedItem.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-[#1C1917] to-transparent"></div>
                  {selectedItem.is_vegetarian && !isBarMenuItem(selectedItem, categories) && (
                    <div className="absolute top-4 left-4 z-20 bg-green-500/90 backdrop-blur-md text-white p-2 rounded-full shadow-lg">
                      <Leaf className="w-5 h-5" />
                    </div>
                  )}
                </div>
                
                <div className="p-6 overflow-y-auto">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="inline-block text-xs uppercase tracking-wider font-semibold text-sangeet-400/90 mb-1">
                        {selectedItem.category_name || selectedItem.category}
                      </span>
                      <h3 className="font-display text-3xl text-sangeet-neutral-100 leading-tight pr-4">
                        {selectedItem.name}
                      </h3>
                    </div>
                    <span className="font-display text-2xl font-bold text-sangeet-400 shrink-0">
                      ${parseFloat(modalVariant.price).toFixed(2)}
                    </span>
                  </div>

                  {isModalDual && (
                    <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-black/50 border border-white/10 mb-5">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedServingMap((prev) => ({ ...prev, [selectedItem.id]: 'shot' }))
                        }
                        className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                          modalServing === 'shot'
                            ? 'bg-sangeet-400 text-sangeet-neutral-950 shadow-xs'
                            : 'text-sangeet-neutral-300 hover:text-white'
                        }`}
                      >
                        <span>Shot</span>
                        <span className="font-bold">${Number(selectedItem.shotItem.price).toFixed(0)}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedServingMap((prev) => ({ ...prev, [selectedItem.id]: 'bottle' }))
                        }
                        className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                          modalServing === 'bottle'
                            ? 'bg-sangeet-400 text-sangeet-neutral-950 shadow-xs'
                            : 'text-sangeet-neutral-300 hover:text-white'
                        }`}
                      >
                        <span>Bottle</span>
                        <span className="font-bold">${Number(selectedItem.bottleItem.price).toFixed(0)}</span>
                      </button>
                    </div>
                  )}
                  
                  <div className="mb-6">
                    <h4 className="text-sangeet-neutral-100 font-semibold mb-2 text-sm uppercase tracking-wider">
                      {isBarMenuItem(selectedItem, categories) ? 'About this drink' : 'About this dish'}
                    </h4>
                    <p className="text-sangeet-neutral-300 leading-relaxed font-light text-base">
                      {selectedItem.description}
                    </p>
                  </div>
                  
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      onAddToCart(modalVariant);
                      setSelectedItem(null);
                    }}
                    className="w-full bg-sangeet-400 text-sangeet-neutral-950 py-4 px-4 rounded-xl font-bold text-lg hover:bg-sangeet-300 transition-all duration-300 flex items-center justify-center space-x-2 shadow-gold-glow cursor-pointer"
                  >
                    <Plus className="w-6 h-6" />
                    <span>
                      {isModalDual
                        ? `Add ${modalServing === 'bottle' ? 'Bottle' : 'Shot'} to Order - $${parseFloat(modalVariant.price).toFixed(2)}`
                        : `Add to Order - $${parseFloat(modalVariant.price).toFixed(2)}`}
                    </span>
                  </motion.button>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </motion.div>
  );
};

export default MenuView;
