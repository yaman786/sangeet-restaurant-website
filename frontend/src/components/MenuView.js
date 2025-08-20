import React from 'react';
import { motion } from 'framer-motion';

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
}) => {

  // Filter menu items by category and search
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Group items by category
  const itemsByCategory = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-sangeet-400 mb-4">Our Menu</h1>
        <p className="text-sangeet-neutral-300 text-lg">
          Discover our delicious selection of dishes
        </p>
      </div>

      {/* Search and Filter */}
      <div className="bg-gradient-to-r from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-xl p-6 border border-sangeet-neutral-700">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for dishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 placeholder-sangeet-neutral-500 focus:outline-none focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400/20 transition-all"
            />
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-sangeet-neutral-500">
              🔍
            </span>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              selectedCategory === 'all'
                ? 'bg-sangeet-400 text-sangeet-neutral-950'
                : 'bg-sangeet-neutral-700 text-sangeet-neutral-300 hover:bg-sangeet-neutral-600'
            }`}
          >
            All Categories
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                selectedCategory === category.name
                  ? 'bg-sangeet-400 text-sangeet-neutral-950'
                  : 'bg-sangeet-neutral-700 text-sangeet-neutral-300 hover:bg-sangeet-neutral-600'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      {Object.keys(itemsByCategory).length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-semibold text-sangeet-400 mb-2">No items found</h3>
          <p className="text-sangeet-neutral-400">Try adjusting your search or category filter</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(itemsByCategory).map(([categoryName, items]) => (
            <div key={categoryName} className="space-y-4">
              <h2 className="text-2xl font-bold text-sangeet-400 border-b border-sangeet-neutral-700 pb-2">
                {categoryName}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(item => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-r from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-xl p-6 border border-sangeet-neutral-700 hover:border-sangeet-neutral-600 transition-all duration-300"
                  >
                    {/* Item Image */}
                    <div className="relative mb-4">
                      <img
                        src={item.image_url || '/placeholder-food.jpg'}
                        alt={item.name}
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = '/placeholder-food.jpg';
                        }}
                      />
                      {item.is_vegetarian && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          🌱 Veg
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-sangeet-neutral-200">
                          {item.name}
                        </h3>
                        <span className="text-xl font-bold text-sangeet-400">
                          ${parseFloat(item.price).toFixed(2)}
                        </span>
                      </div>
                      
                      <p className="text-sangeet-neutral-400 text-sm line-clamp-2">
                        {item.description}
                      </p>

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => onAddToCart(item)}
                        className="w-full bg-sangeet-400 text-sangeet-neutral-950 py-3 px-4 rounded-lg font-semibold hover:bg-sangeet-300 transition-colors duration-300 flex items-center justify-center space-x-2"
                      >
                        <span>🛒</span>
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Cart Button */}
      <div className="text-center pt-6">
        <button
          onClick={onViewCart}
          className="bg-gradient-to-r from-sangeet-400 to-sangeet-500 hover:from-sangeet-300 hover:to-sangeet-400 text-sangeet-neutral-950 py-4 px-8 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto"
        >
          <span>📋</span>
          <span>View Cart</span>
        </button>
      </div>


    </motion.div>
  );
};

export default MenuView;
