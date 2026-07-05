import React from 'react';

const MenuCategories = ({
  categories,
  openCategoryModal,
  handleDeleteCategory
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-sangeet-400">Categories</h2>
        <button
          onClick={() => openCategoryModal()}
          className="bg-sangeet-400 text-sangeet-neutral-950 px-4 py-2 rounded-lg font-semibold hover:bg-sangeet-300 transition-colors"
        >
          + Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-sangeet-neutral-900 rounded-lg border border-sangeet-neutral-700 p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-sangeet-neutral-100">{category.name}</h3>
              <span className="text-sangeet-400 font-bold">{category.item_count} items</span>
            </div>
            <p className="text-sangeet-neutral-400 mb-4">{category.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sangeet-neutral-500 text-sm">
                Position: {category.display_order} 
                <span className="text-sangeet-neutral-600 ml-1">
                  ({category.display_order === 1 ? 'First' : 
                    category.display_order === 2 ? 'Second' :
                    category.display_order === 3 ? 'Third' :
                    category.display_order === 4 ? 'Fourth' :
                    category.display_order === 5 ? 'Fifth' :
                    category.display_order === 6 ? 'Sixth' :
                    category.display_order === 7 ? 'Seventh' :
                    category.display_order === 8 ? 'Eighth' : `${category.display_order}th`})
                </span>
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => openCategoryModal(category)}
                  className="text-sangeet-400 hover:text-sangeet-300 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuCategories;
