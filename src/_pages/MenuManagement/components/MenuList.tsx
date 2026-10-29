"use client";
import React from 'react';
import Image from 'next/image';
import { UtensilsCrossed, Wine } from 'lucide-react';

const MenuList = ({
  filteredItems,
  menuItems,
  categories = [],
  menuSection = 'food',
  setShowAddModal,
  openEditModal,
  handleDeleteItem
}: any) => {
  const getCategoryDisplay = (categoryId: number, categoryName: string) => {
    if (!categoryId) return categoryName || 'Uncategorized';
    const cat = categories.find((c: any) => c.id === categoryId);
    if (cat && cat.parent_id) {
      const parent = categories.find((p: any) => p.id === cat.parent_id);
      if (parent) return `${cat.name} (${parent.name})`;
    }
    return categoryName || 'Uncategorized';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-sangeet-400">
          {menuSection === 'drinks' ? 'Bar & Drinks Items' : 'Food Menu Items'} ({filteredItems.length} of {menuItems.length})
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-sangeet-400 text-sangeet-neutral-950 px-4 py-2 rounded-lg font-semibold hover:bg-sangeet-300 transition-colors cursor-pointer"
        >
          + Add {menuSection === 'drinks' ? 'Drink Item' : 'Food Item'}
        </button>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sangeet-neutral-900 border border-sangeet-neutral-800 mb-4 text-sangeet-400">
            {menuSection === 'drinks' ? <Wine className="w-8 h-8" /> : <UtensilsCrossed className="w-8 h-8" />}
          </div>
          <h3 className="text-xl font-semibold text-sangeet-neutral-300 mb-2">No items found</h3>
          <p className="text-sangeet-neutral-500">Try adjusting your filters or add a new {menuSection === 'drinks' ? 'drink' : 'food'} item.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item: any) => (
            <div key={item.id} className="bg-sangeet-neutral-900 rounded-lg border border-sangeet-neutral-700 overflow-hidden">
              <div className="relative w-full h-48">
                <Image
                  src={item.image_url || 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop'}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-sangeet-neutral-100">{item.name}</h3>
                  {item.servingMode === 'shot_and_bottle' ? (
                    <div className="flex flex-col items-end shrink-0 gap-1" data-testid={`admin-drink-dual-price-${item.id}`}>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sangeet-400/15 text-sangeet-400 border border-sangeet-400/30">
                        Shot: ${item.shotPrice}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-sangeet-neutral-200 border border-white/15">
                        Bottle: ${item.bottlePrice}
                      </span>
                    </div>
                  ) : item.servingMode === 'bottle_only' ? (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-sangeet-400/15 text-sangeet-400 border border-sangeet-400/30 shrink-0">
                      Bottle: ${item.bottlePrice ?? item.price}
                    </span>
                  ) : (
                    <span className="text-sangeet-400 font-bold shrink-0">${item.price}</span>
                  )}
                </div>
                <p className="text-sangeet-neutral-400 text-sm mb-3">{item.description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {menuSection === 'food' && item.is_vegetarian && (
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-sm text-xs">Vegetarian</span>
                  )}
                  {menuSection === 'food' && item.is_spicy && (
                    <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-sm text-xs">Spicy</span>
                  )}
                  {item.is_popular && (
                    <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-sm text-xs">Popular</span>
                  )}
                  {menuSection === 'drinks' && item.servingMode === 'shot_and_bottle' && (
                    <span className="bg-sangeet-400/10 text-sangeet-300 border border-sangeet-400/20 px-2 py-1 rounded-sm text-xs">
                      Shot &amp; Full Bottle
                    </span>
                  )}
                  {menuSection === 'drinks' && item.servingMode === 'bottle_only' && (
                    <span className="bg-sangeet-400/10 text-sangeet-300 border border-sangeet-400/20 px-2 py-1 rounded-sm text-xs">
                      Full Bottle Service
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sangeet-neutral-500 text-sm">
                    {getCategoryDisplay(item.category_id, item.category_name)}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="text-sangeet-400 hover:text-sangeet-300 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuList;
