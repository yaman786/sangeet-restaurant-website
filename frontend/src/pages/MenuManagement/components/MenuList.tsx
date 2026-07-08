import React from 'react';

const MenuList = ({
  filteredItems,
  menuItems,
  setShowAddModal,
  openEditModal,
  handleDeleteItem
}: any) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-sangeet-400">
          Menu Items ({filteredItems.length} of {menuItems.length})
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-sangeet-400 text-sangeet-neutral-950 px-4 py-2 rounded-lg font-semibold hover:bg-sangeet-300 transition-colors"
        >
          + Add Menu Item
        </button>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-semibold text-sangeet-neutral-300 mb-2">No items found</h3>
          <p className="text-sangeet-neutral-500">Try adjusting your filters or add a new menu item.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item: any) => (
            <div key={item.id} className="bg-sangeet-neutral-900 rounded-lg border border-sangeet-neutral-700 overflow-hidden">
              <img
                src={item.image_url || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'}
                alt={item.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-sangeet-neutral-100">{item.name}</h3>
                  <span className="text-sangeet-400 font-bold">${item.price}</span>
                </div>
                <p className="text-sangeet-neutral-400 text-sm mb-3">{item.description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {item.is_vegetarian && (
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">Vegetarian</span>
                  )}
                  {item.is_spicy && (
                    <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs">Spicy</span>
                  )}
                  {item.is_popular && (
                    <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs">Popular</span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sangeet-neutral-500 text-sm">
                    {item.category_name || 'Uncategorized'}
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
