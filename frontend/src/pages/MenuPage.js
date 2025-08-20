import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchMenuItems, fetchMenuCategories } from '../services/api';

/**
 * MenuPage Component
 * Mobile-first menu display with 3-column grid layout
 * Features: Category filtering, dietary filters, responsive design
 * Optimized for touch interactions and mobile performance
 */
const MenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    vegetarian: false,
    spicy: false,
    popular: false
  });
  
  useEffect(() => {
    const loadMenuData = async () => {
      try {
        setLoading(true);
    
        
        const [menuData, categoriesData] = await Promise.all([
          fetchMenuItems(filters),
          fetchMenuCategories()
        ]);
        
        
        
        setMenuItems(Array.isArray(menuData) ? menuData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (error) {
        console.error('Error loading menu data:', error);
        
        
        // Fallback categories
        setCategories([
          { id: 1, name: 'Appetizers' },
          { id: 2, name: 'Main Course' },
          { id: 3, name: 'Biryani' },
          { id: 4, name: 'Breads' },
          { id: 5, name: 'Desserts' }
        ]);
        
        // Fallback data if API fails
        setMenuItems([
          {
            id: 1,
            name: "Butter Chicken",
            description: "Creamy tomato-based curry with tender chicken",
            price: 18.99,
            category_name: "Main Course",
            image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
            is_vegetarian: false,
            is_spicy: false,
            is_popular: true,
            preparation_time: 20
          },
          {
            id: 2,
            name: "Paneer Tikka",
            description: "Grilled cottage cheese with aromatic spices",
            price: 16.99,
            category_name: "Appetizers",
            image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
            is_vegetarian: true,
            is_spicy: false,
            is_popular: true,
            preparation_time: 15
          },
          {
            id: 3,
            name: "Biryani",
            description: "Fragrant rice dish with tender meat and spices",
            price: 22.99,
            category_name: "Main Course",
            image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
            is_vegetarian: false,
            is_spicy: true,
            is_popular: true,
            preparation_time: 25
          }
        ]);
        setCategories([
          { id: 1, name: "Appetizers" },
          { id: 2, name: "Main Course" },
          { id: 3, name: "Desserts" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadMenuData();
  }, [filters]);

  const filteredMenuItems = selectedCategory === 'all' 
    ? menuItems
    : menuItems.filter(item => item.category_name === selectedCategory);

  return (
    <div className="min-h-screen bg-sangeet-neutral-950">
      {/* Hero Section - Mobile Optimized */}
      <div className="relative bg-gradient-to-br from-sangeet-neutral-950 via-sangeet-neutral-900 to-sangeet-neutral-950 py-12 md:py-20">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=1920&h=1080&fit=crop"
            alt="Authentic South Asian cuisine"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-sangeet-neutral-950 via-sangeet-neutral-950/95 to-sangeet-neutral-950"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 md:mb-12"
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-sangeet-400/20 to-sangeet-red-500/20 backdrop-blur-md border border-sangeet-400/30 rounded-full px-4 md:px-6 py-2 mb-4">
              <span className="text-xl md:text-2xl">🍽️</span>
              <span className="text-sangeet-400 font-semibold text-sm md:text-base">Our Menu</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-sangeet-400 mb-3 md:mb-4">Our Menu</h1>
            <p className="text-sangeet-neutral-400 text-base md:text-lg max-w-2xl mx-auto">
              Discover authentic Indian & Nepali flavors
            </p>
          </motion.div>

          {/* Filter Controls - Mobile Optimized */}
          <div className="mb-6 md:mb-8">
            {/* Dietary Filters */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFilters(prev => ({ ...prev, vegetarian: !prev.vegetarian }))}
                className={`px-3 md:px-4 py-2 md:py-2 rounded-full font-medium transition-all duration-200 text-xs md:text-sm touch-manipulation min-h-[44px] ${
                  filters.vegetarian
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-sangeet-neutral-800 text-sangeet-neutral-400 hover:bg-sangeet-neutral-700 border border-sangeet-neutral-600'
                }`}
              >
                🌱 Vegetarian
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFilters(prev => ({ ...prev, spicy: !prev.spicy }))}
                className={`px-3 md:px-4 py-2 md:py-2 rounded-full font-medium transition-all duration-200 text-xs md:text-sm touch-manipulation min-h-[44px] ${
                  filters.spicy
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-sangeet-neutral-800 text-sangeet-neutral-400 hover:bg-sangeet-neutral-700 border border-sangeet-neutral-600'
                }`}
              >
                🔥 Spicy
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFilters(prev => ({ ...prev, popular: !prev.popular }))}
                className={`px-3 md:px-4 py-2 md:py-2 rounded-full font-medium transition-all duration-200 text-xs md:text-sm touch-manipulation min-h-[44px] ${
                  filters.popular
                    ? 'bg-yellow-600 text-white shadow-lg'
                    : 'bg-sangeet-neutral-800 text-sangeet-neutral-400 hover:bg-sangeet-neutral-700 border border-sangeet-neutral-600'
                }`}
              >
                ⭐ Popular
              </motion.button>
            </div>

            {/* Category Filter - Horizontal Scroll on Mobile */}
            <div className="relative w-full">
              <div className="flex overflow-x-auto gap-2 md:gap-4 pb-2 md:pb-0 scrollbar-hide max-w-full">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCategory('all')}
                  className={`flex-shrink-0 px-3 md:px-4 py-2 md:py-2 rounded-full font-medium transition-all duration-200 text-xs md:text-sm touch-manipulation min-h-[44px] ${
                    selectedCategory === 'all'
                      ? 'bg-sangeet-400 text-sangeet-neutral-950 shadow-lg'
                      : 'bg-sangeet-neutral-800 text-sangeet-neutral-400 hover:bg-sangeet-neutral-700 border border-sangeet-neutral-600'
                  }`}
                >
                  All Items
                </motion.button>
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`flex-shrink-0 px-3 md:px-4 py-2 md:py-2 rounded-full font-medium transition-all duration-200 text-xs md:text-sm touch-manipulation min-h-[44px] ${
                      selectedCategory === category.name
                        ? 'bg-sangeet-400 text-sangeet-neutral-950 shadow-lg'
                        : 'bg-sangeet-neutral-800 text-sangeet-neutral-400 hover:bg-sangeet-neutral-700 border border-sangeet-neutral-600'
                    }`}
                  >
                    {category.name}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 md:pb-12">
        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 md:py-20"
          >
            <div className="inline-block animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-sangeet-400 mb-4"></div>
            <p className="text-sangeet-neutral-400 text-base md:text-lg">Loading our delicious menu...</p>
          </motion.div>
        )}

        {/* Menu Grid - Mobile First */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {filteredMenuItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="group bg-sangeet-neutral-900 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-sangeet-neutral-800 hover:border-sangeet-400/30"
              >
                {/* Image Container */}
                <div className="relative h-48 md:h-56 overflow-hidden">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  
                  {/* Price Badge */}
                  <div className="absolute top-3 right-3 bg-sangeet-400 text-sangeet-neutral-950 px-2 py-1 rounded-full font-bold text-sm shadow-lg">
                    ${item.price}
                  </div>
                  
                  {/* Dietary Badges */}
                  <div className="absolute bottom-3 left-3 flex gap-1 md:gap-2 flex-wrap">
                    {item.is_vegetarian && (
                      <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full font-medium shadow-sm">🌱 Veg</span>
                    )}
                    {item.is_spicy && (
                      <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full font-medium shadow-sm">🔥 Spicy</span>
                    )}
                    {item.is_popular && (
                      <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full font-medium shadow-sm">⭐ Popular</span>
                    )}
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4 md:p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg md:text-xl font-bold text-sangeet-400 group-hover:text-sangeet-300 transition-colors">
                      {item.name}
                    </h3>
                  </div>
                  <p className="text-sangeet-neutral-400 text-sm md:text-base mb-3 leading-relaxed">
                    {item.description}
                  </p>
                  
                  {/* Preparation Time */}
                  <div className="flex items-center text-sangeet-neutral-500 text-xs">
                    <span className="mr-1">⏱️</span>
                    <span>Ready in {item.preparation_time || 15} minutes</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredMenuItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 md:py-20"
          >
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">No items found</h3>
            <p className="text-sangeet-neutral-400 text-base md:text-lg">
              No menu items match your current filters. Try adjusting your selection.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MenuPage; 