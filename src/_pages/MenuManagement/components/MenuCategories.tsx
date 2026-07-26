"use client";
import React from 'react';

const MenuCategories = ({
  categories,
  openCategoryModal,
  handleDeleteCategory
}: any) => {
  const topLevelCategories = categories.filter((c: any) => !c.parent_id);
  const getChildren = (parentId: number) => categories.filter((c: any) => c.parent_id === parentId);

  const renderCategoryCard = (category: any, isChild: boolean = false) => (
    <div key={category.id} className={`bg-sangeet-neutral-800 rounded-lg border ${isChild ? 'border-sangeet-neutral-600' : 'border-sangeet-neutral-700'} p-5`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className={`${isChild ? 'text-lg' : 'text-xl'} font-semibold text-sangeet-neutral-100`}>{category.name}</h3>
        <span className="text-sangeet-400 font-bold text-sm">{category.item_count} items</span>
      </div>
      <p className="text-sangeet-neutral-400 mb-4 text-sm">{category.description}</p>
      <div className="flex justify-between items-center mt-auto">
        <span className="text-sangeet-neutral-500 text-xs">
          Order: {category.display_order} 
        </span>
        <div className="flex space-x-3">
          <button
            onClick={() => openCategoryModal(category)}
            className="text-sangeet-400 hover:text-sangeet-300 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteCategory(category.id)}
            className="text-red-400 hover:text-red-300 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

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

      <div className="space-y-6">
        {topLevelCategories.map((parent: any) => {
          const children = getChildren(parent.id);
          
          return (
            <div key={parent.id} className="bg-sangeet-neutral-900 rounded-xl border border-sangeet-neutral-700 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-sangeet-neutral-100 mb-1">{parent.name}</h3>
                  <p className="text-sangeet-neutral-400">{parent.description}</p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className="text-sangeet-400 font-bold">{parent.item_count} items</span>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => openCategoryModal(parent)}
                      className="text-sangeet-400 hover:text-sangeet-300 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(parent.id)}
                      className="text-red-400 hover:text-red-300 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="text-sangeet-neutral-500 text-sm mb-4">
                Display Order: {parent.display_order}
              </div>
              
              {children.length > 0 && (
                <div className="mt-6 pt-6 border-t border-sangeet-neutral-700">
                  <h4 className="text-sm font-semibold text-sangeet-neutral-300 mb-4 uppercase tracking-wider">Subcategories</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {children.map((child: any) => renderCategoryCard(child, true))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MenuCategories;
