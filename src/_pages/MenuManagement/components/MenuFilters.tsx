"use client";
import React from 'react';
import { Leaf, Flame, Star } from 'lucide-react';
import CustomDropdown from '../../../components/CustomDropdown';

const MenuFilters = ({ filters, handleFilterChange, categories, menuSection = 'food', clearFilters }: any) => {
  const priceRangeOptions = [
    { value: '', label: 'All Prices' },
    { value: '0-100', label: 'Under $100' },
    { value: '100-200', label: '$100 - $200' },
    { value: '200-500', label: '$200 - $500' },
    { value: '500-99999', label: 'Over $500' }
  ];

  const sortOptions = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'price-asc', label: 'Price (Low-High)' },
    { value: 'price-desc', label: 'Price (High-Low)' },
    { value: 'category-asc', label: 'Category (A-Z)' }
  ];

  const filterableCategories =
    menuSection === 'drinks'
      ? categories.filter((c: any) => c.parent_id)
      : categories;

  const availableTags =
    menuSection === 'drinks'
      ? [{ key: 'popular', label: 'Popular / Signature', Icon: Star }]
      : [
          { key: 'vegetarian', label: 'Vegetarian', Icon: Leaf },
          { key: 'spicy', label: 'Spicy', Icon: Flame },
          { key: 'popular', label: 'Popular', Icon: Star }
        ];

  return (
    <div className="bg-sangeet-neutral-900 rounded-lg p-6 border border-sangeet-neutral-700 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-sangeet-neutral-100">Filters &amp; Search</h3>
        <button
          onClick={clearFilters}
          className="text-sangeet-neutral-400 hover:text-sangeet-neutral-200 text-sm cursor-pointer"
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
              <span className="bg-sangeet-400/20 text-sangeet-400 px-2 py-1 rounded-sm text-xs">
                Search: &quot;{filters.search}&quot;
              </span>
            )}
            {filters.category && (
              <span className="bg-sangeet-400/20 text-sangeet-400 px-2 py-1 rounded-sm text-xs">
                Category: {filters.category}
              </span>
            )}
            {filters.priceRange && (
              <span className="bg-sangeet-400/20 text-sangeet-400 px-2 py-1 rounded-sm text-xs">
                Price: {filters.priceRange === '0-100' ? 'Under $100' : 
                       filters.priceRange === '100-200' ? '$100 - $200' :
                       filters.priceRange === '200-500' ? '$200 - $500' :
                       filters.priceRange === '500-99999' ? 'Over $500' : filters.priceRange}
              </span>
            )}
            {filters.tags.map((tag: any) => (
              <span key={tag} className="bg-sangeet-400/20 text-sangeet-400 px-2 py-1 rounded-sm text-xs">
                {tag === 'vegetarian' ? 'Vegetarian' :
                 tag === 'spicy' ? 'Spicy' :
                 tag === 'popular' ? 'Popular' : tag}
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
            placeholder={menuSection === 'drinks' ? 'Search drinks...' : 'Search food items...'}
            value={filters.search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('search', e.target.value)}
            className="w-full px-3 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100"
          />
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">
            {menuSection === 'drinks' ? 'Bar Subcategory' : 'Food Category'}
          </label>
          <CustomDropdown
            value={filters.category}
            onChange={(category: string) => handleFilterChange('category', category)}
            options={[
              { value: '', label: menuSection === 'drinks' ? 'All Bar Subcategories' : 'All Food Categories' },
              ...filterableCategories.map((category: { name: string; item_count?: number; parent?: any }) => ({
                value: category.name,
                label: category.item_count !== undefined
                  ? `${category.name} (${category.item_count})`
                  : category.name
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
          {availableTags.map((tag) => {
            const IconComponent = tag.Icon;
            return (
              <button
                key={tag.key}
                onClick={() => {
                  const newTags = filters.tags.includes(tag.key)
                    ? filters.tags.filter((t: any) => t !== tag.key)
                    : [...filters.tags, tag.key];
                  handleFilterChange('tags', newTags);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                  filters.tags.includes(tag.key)
                    ? 'bg-sangeet-400 text-sangeet-neutral-950'
                    : 'bg-sangeet-neutral-800 text-sangeet-neutral-400 hover:bg-sangeet-neutral-700'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{tag.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MenuFilters;
