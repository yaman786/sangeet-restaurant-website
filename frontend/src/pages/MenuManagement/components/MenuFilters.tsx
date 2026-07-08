import React from 'react';
import CustomDropdown from '../../../components/CustomDropdown';

const MenuFilters = ({ filters, handleFilterChange, categories, clearFilters }: any) => {
  const priceRangeOptions = [
    { value: '', label: 'All Prices' },
    { value: '0-10', label: 'Under $10' },
    { value: '10-20', label: '$10 - $20' },
    { value: '20-30', label: '$20 - $30' },
    { value: '30-999', label: 'Over $30' }
  ];

  const sortOptions = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'price-asc', label: 'Price (Low-High)' },
    { value: 'price-desc', label: 'Price (High-Low)' },
    { value: 'category-asc', label: 'Category (A-Z)' }
  ];

  return (
    <div className="bg-sangeet-neutral-900 rounded-lg p-6 border border-sangeet-neutral-700 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-sangeet-neutral-100">Filters & Search</h3>
        <button
          onClick={clearFilters}
          className="text-sangeet-neutral-400 hover:text-sangeet-neutral-200 text-sm"
        >
          Clear All Filters
        </button>
      </div>
      
      {/* Active Filters Summary */}
      {(filters.search || filters.category || filters.priceRange || filters.tags.length > 0) && (
        <div className="mb-4 p-3 bg-sangeet-neutral-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sangeet-400 text-sm font-medium">Active Filters:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className="bg-sangeet-400/20 text-sangeet-400 px-2 py-1 rounded text-xs">
                Search: "{filters.search}"
              </span>
            )}
            {filters.category && (
              <span className="bg-sangeet-400/20 text-sangeet-400 px-2 py-1 rounded text-xs">
                Category: {filters.category}
              </span>
            )}
            {filters.priceRange && (
              <span className="bg-sangeet-400/20 text-sangeet-400 px-2 py-1 rounded text-xs">
                Price: {filters.priceRange === '0-10' ? 'Under $10' : 
                       filters.priceRange === '10-20' ? '$10 - $20' :
                       filters.priceRange === '20-30' ? '$20 - $30' :
                       filters.priceRange === '30-999' ? 'Over $30' : filters.priceRange}
              </span>
            )}
            {filters.tags.map((tag: any) => (
              <span key={tag} className="bg-sangeet-400/20 text-sangeet-400 px-2 py-1 rounded text-xs">
                {tag === 'vegetarian' ? '🥬 Vegetarian' :
                 tag === 'spicy' ? '🌶️ Spicy' :
                 tag === 'popular' ? '⭐ Popular' : tag}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">Search</label>
          <input
            type="text"
            placeholder="Search items..."
            value={filters.search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('search', e.target.value)}
            className="w-full px-3 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100"
          />
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">Category</label>
          <CustomDropdown
            value={filters.category}
            onChange={(category: string) => handleFilterChange('category', category)}
            options={[
              { value: '', label: 'All Categories' },
              ...categories.map((category: { name: string; item_count: number }) => ({
                value: category.name,
                label: `${category.name} (${category.item_count})`
              }))
            ]}
            className="w-full"
          />
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">Price Range</label>
          <CustomDropdown
            value={filters.priceRange}
            onChange={(priceRange: any) => handleFilterChange('priceRange', priceRange)}
            options={priceRangeOptions}
            className="w-full"
          />
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">Sort By</label>
          <CustomDropdown
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(value: any) => {
              const [sortBy, sortOrder] = value.split('-');
              handleFilterChange('sortBy', sortBy);
              handleFilterChange('sortOrder', sortOrder);
            }}
            options={sortOptions}
            className="w-full"
          />
        </div>
      </div>

      {/* Tags Filter */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">Tags</label>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
            { key: 'spicy', label: 'Spicy', icon: '🌶️' },
            { key: 'popular', label: 'Popular', icon: '⭐' }
          ].map((tag) => (
            <button
              key={tag.key}
              onClick={() => {
                const newTags = filters.tags.includes(tag.key)
                  ? filters.tags.filter((t: any) => t !== tag.key)
                  : [...filters.tags, tag.key];
                handleFilterChange('tags', newTags);
              }}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filters.tags.includes(tag.key)
                  ? 'bg-sangeet-400 text-sangeet-neutral-950'
                  : 'bg-sangeet-neutral-800 text-sangeet-neutral-400 hover:bg-sangeet-neutral-700'
              }`}
            >
              {tag.icon} {tag.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuFilters;
