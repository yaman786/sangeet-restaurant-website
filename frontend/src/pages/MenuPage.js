import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Flame, Star, ChefHat, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchMenuItems, fetchMenuCategories } from '../services/api';

const FALLBACK_MENU = [
  { id: 1, name: "Butter Chicken", description: "Creamy tomato-based curry with tender chicken", price: 18.99, category_name: "Main Course", image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop", is_vegetarian: false, is_spicy: false, is_popular: true, preparation_time: 20 },
  { id: 2, name: "Paneer Tikka", description: "Grilled cottage cheese with aromatic spices", price: 16.99, category_name: "Appetizers", image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop", is_vegetarian: true, is_spicy: false, is_popular: true, preparation_time: 15 },
  { id: 3, name: "Biryani", description: "Fragrant rice dish with tender meat and spices", price: 22.99, category_name: "Main Course", image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop", is_vegetarian: false, is_spicy: true, is_popular: true, preparation_time: 25 }
];

const FALLBACK_CATEGORIES = [
  { id: 1, name: 'Appetizers' }, { id: 2, name: 'Main Course' }, { id: 3, name: 'Biryani' }, { id: 4, name: 'Breads' }, { id: 5, name: 'Desserts' }
];

/**
 * MenuPage Component
 * Mobile-first menu display with 3-column grid layout
 * Features: Category filtering, dietary filters, responsive design
 * Optimized for touch interactions and mobile performance
 */
const MenuPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filters, setFilters] = useState({
    vegetarian: false,
    spicy: false,
    popular: false
  });

  const { data: menuItems = FALLBACK_MENU, isLoading: menuLoading } = useQuery({
    queryKey: ['menuItems', filters],
    queryFn: () => fetchMenuItems(filters),
    placeholderData: FALLBACK_MENU,
    select: (data) => Array.isArray(data) ? data : [],
  });

  const { data: categories = FALLBACK_CATEGORIES } = useQuery({
    queryKey: ['menuCategories'],
    queryFn: fetchMenuCategories,
    placeholderData: FALLBACK_CATEGORIES,
    select: (data) => Array.isArray(data) ? data : [],
  });

  const loading = menuLoading;

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
              <ChefHat className="w-5 h-5 text-sangeet-400" />
              <span className="text-sangeet-400 font-semibold text-sm md:text-base">Culinary Excellence</span>
            </div>
            <p className="text-sangeet-neutral-400 text-base md:text-lg max-w-2xl mx-auto">
              Experience the finest Indian & Nepali cuisine crafted with passion
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
                className={`filter-tab ${filters.vegetarian ? 'filter-tab-active' : 'filter-tab-inactive'}`}
              >
                <Leaf className="w-4 h-4" /> Vegetarian
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFilters(prev => ({ ...prev, spicy: !prev.spicy }))}
                className={`filter-tab ${filters.spicy ? 'filter-tab-active' : 'filter-tab-inactive'}`}
              >
                <Flame className="w-4 h-4" /> Spicy
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFilters(prev => ({ ...prev, popular: !prev.popular }))}
                className={`filter-tab ${filters.popular ? 'filter-tab-active' : 'filter-tab-inactive'}`}
              >
                <Star className="w-4 h-4" /> Chef's Signature
              </motion.button>
            </div>

            {/* Category Filter - Horizontal Scroll on Mobile */}
            <div className="relative w-full">
              <div className="flex overflow-x-auto gap-2 md:gap-4 pb-2 md:pb-0 scrollbar-hide max-w-full">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCategory('all')}
                  className={`filter-tab ${selectedCategory === 'all' ? 'filter-tab-active' : 'filter-tab-inactive'}`}
                >
                  All Items
                </motion.button>
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`filter-tab ${selectedCategory === category.name ? 'filter-tab-active' : 'filter-tab-inactive'}`}
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

        {/* Menu Grid - Mobile First with Fluid Layout Animations */}
        {!loading && (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredMenuItems.map((item) => (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -4 }}
                  className="group bg-sangeet-neutral-900 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-sangeet-neutral-800 hover:border-sangeet-400/30 flex flex-col h-full"
                >
                  {/* Image Container */}
                  <div className="relative h-48 md:h-56 overflow-hidden flex-shrink-0">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out-expo"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    {/* Price Badge */}
                    <div className="absolute top-3 right-3 bg-sangeet-neutral-950/80 backdrop-blur-md text-sangeet-400 border border-sangeet-400/20 px-3 py-1.5 rounded-full font-semibold text-sm shadow-glass">
                      ${item.price}
                    </div>
                    
                    {/* Premium Dietary Badges */}
                    <div className="absolute bottom-3 left-3 flex gap-2 flex-wrap">
                      {item.is_vegetarian && (
                        <span className="badge-dietary badge-veg">
                          <Leaf className="w-3 h-3" /> Veg
                        </span>
                      )}
                      {item.is_spicy && (
                        <span className="badge-dietary badge-spicy">
                          <Flame className="w-3 h-3" /> Spicy
                        </span>
                      )}
                      {item.is_popular && (
                        <span className="badge-dietary badge-signature">
                          <Star className="w-3 h-3" /> Signature
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Content (Removed fast-food prep time) */}
                  <div className="p-4 md:p-6 flex-grow flex flex-col">
                    <h3 className="text-lg md:text-xl font-display font-semibold text-sangeet-neutral-100 group-hover:text-sangeet-300 transition-colors mb-2">
                      {item.name}
                    </h3>
                    <p className="text-sangeet-neutral-400 text-sm md:text-base leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Premium Empty State */}
        {!loading && filteredMenuItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 md:py-24"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-sangeet-neutral-900 border border-sangeet-neutral-800 mb-6 shadow-glass">
              <Search className="w-8 h-8 text-sangeet-neutral-500" />
            </div>
            <h3 className="text-heading-md font-display text-sangeet-neutral-100 mb-3">No culinary selections found</h3>
            <p className="text-sangeet-neutral-400 text-body-lg max-w-md mx-auto">
              We couldn't find any items matching your precise preferences. Please adjust your filters to explore our full menu.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MenuPage; 