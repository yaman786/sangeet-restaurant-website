"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Leaf } from 'lucide-react';

const MenuView = ({ 
  menuItems, 
  categories, 
  selectedCategory, 
  setSelectedCategory, 
  searchTerm, 
  setSearchTerm, 
  onAddToCart, 
  onViewCart,
  cartLength = 0
}: any) => {

  // Filter menu items by category and search
  const filteredItems = menuItems.filter((item: any) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Group items by category
  const itemsByCategory = filteredItems.reduce((acc: any, item: any) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

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
      <div className="sticky top-4 z-40 bg-[#1C1917]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-glass">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative group">
            <input
              type="text"
              placeholder="Search our culinary offerings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3.5 pl-12 bg-white/5 border border-white/10 rounded-xl text-sangeet-neutral-100 placeholder-sangeet-neutral-500 focus:outline-none focus:border-sangeet-400 focus:bg-white/10 transition-all duration-300"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-sangeet-neutral-500 group-focus-within:text-sangeet-400 transition-colors duration-300 w-5 h-5" />
          </div>
        </div>

        {/* Category Pills (Horizontal Scroll) */}
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide -mx-2 px-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
              selectedCategory === 'all'
                ? 'bg-sangeet-400 text-sangeet-neutral-950 shadow-gold-glow'
                : 'bg-white/5 text-sangeet-neutral-300 hover:bg-white/10 border border-white/5'
            }`}
          >
            All Offerings
          </button>
          {categories.map((category: any) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.name)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                selectedCategory === category.name
                  ? 'bg-sangeet-400 text-sangeet-neutral-950 shadow-gold-glow'
                  : 'bg-white/5 text-sangeet-neutral-300 hover:bg-white/10 border border-white/5'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      {Object.keys(itemsByCategory).length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 px-4 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10"
        >
          <Search className="w-12 h-12 text-sangeet-neutral-500 mx-auto mb-4 opacity-50" />
          <h3 className="font-display text-2xl text-sangeet-400 mb-2">No culinary items found</h3>
          <p className="text-sangeet-neutral-400">Please refine your search or category selection.</p>
        </motion.div>
      ) : (
        <div className="space-y-12">
          {Object.entries(itemsByCategory).map(([categoryName, items]) => (
            <div key={categoryName} className="space-y-6">
              <h2 className="font-display text-3xl text-sangeet-neutral-100 flex items-center">
                <span className="bg-sangeet-400 w-1.5 h-8 rounded-full mr-4 inline-block"></span>
                {categoryName}
              </h2>
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {(items as any[]).map((item: any) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    whileHover={{ y: -4, scale: 1.01 }}
                    className="group bg-white/5 backdrop-blur-xl rounded-3xl p-4 border border-white/10 hover:border-sangeet-400/30 transition-all duration-400 shadow-glass overflow-hidden relative"
                  >
                    {/* Item Image */}
                    <div className="relative mb-5 overflow-hidden rounded-2xl aspect-[4/3]">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/80 to-transparent z-10"></div>
                      <img
                        src={item.image_url || '/placeholder-food.jpg'}
                        alt={item.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out-expo"
                        onError={(e) => { (e.target as any).src = 'https://via.placeholder.com/400x300?text=Sangeet+Cuisine' }}
                      />
                      {item.is_vegetarian && (
                        <div className="absolute top-3 right-3 z-20 bg-green-500/90 backdrop-blur-md text-white p-2 rounded-full shadow-lg">
                          <Leaf className="w-4 h-4" />
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 z-20">
                        <span className="font-display text-2xl font-bold text-white tracking-wide">
                          ${parseFloat(item.price).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Item Details */}
                    <div className="px-2">
                      <h3 className="font-display text-xl text-sangeet-neutral-100 mb-2 leading-tight">
                        {item.name}
                      </h3>
                      <p className="text-sangeet-neutral-400 text-sm line-clamp-2 leading-relaxed mb-6 font-light">
                        {item.description}
                      </p>

                      {/* Add to Cart Button */}
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onAddToCart(item)}
                        className="w-full bg-white/5 border border-white/10 text-sangeet-400 py-3.5 px-4 rounded-xl font-semibold hover:bg-sangeet-400 hover:text-sangeet-neutral-950 transition-all duration-300 flex items-center justify-center space-x-2 shadow-sm"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Add to Order</span>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default MenuView;
