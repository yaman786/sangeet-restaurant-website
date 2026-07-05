import React from 'react';
import CustomDropdown from '../../../components/CustomDropdown';

const MenuModals = ({
  showAddModal, setShowAddModal,
  showEditModal, setShowEditModal,
  showCategoryModal, setShowCategoryModal,
  showDeleteModal, setShowDeleteModal,
  deleteType, deleteName,
  selectedCategory,
  categories,
  formData, setFormData,
  categoryFormData, setCategoryFormData,
  handleInputChange, handleCategoryInputChange,
  handleAddItem, handleEditItem,
  handleAddCategory, handleEditCategory,
  confirmDeleteItem, confirmDeleteCategory
}) => {
  return (
    <>
      {/* Add/Edit Menu Item Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-sangeet-neutral-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-sangeet-400 mb-6">
              {showAddModal ? 'Add Menu Item' : 'Edit Menu Item'}
            </h2>
            <form onSubmit={showAddModal ? handleAddItem : handleEditItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">Category</label>
                  <CustomDropdown
                    value={formData.category_id}
                    onChange={(categoryId) => {
                      setFormData(prev => ({ ...prev, category_id: categoryId }));
                    }}
                    options={[
                      { value: '', label: 'Select Category' },
                      ...categories.map((category) => ({
                        value: category.id,
                        label: category.name
                      }))
                    ]}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">Image URL</label>
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">Preparation Time (minutes)</label>
                  <input
                    type="number"
                    name="preparation_time"
                    value={formData.preparation_time}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100"
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_vegetarian"
                    checked={formData.is_vegetarian}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sangeet-neutral-300">Vegetarian</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_spicy"
                    checked={formData.is_spicy}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sangeet-neutral-300">Spicy</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_popular"
                    checked={formData.is_popular}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sangeet-neutral-300">Popular</span>
                </label>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="px-4 py-2 text-sangeet-neutral-400 hover:text-sangeet-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-sangeet-400 text-sangeet-neutral-950 px-4 py-2 rounded-lg font-semibold hover:bg-sangeet-300 transition-colors"
                >
                  {showAddModal ? 'Create' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-sangeet-neutral-900 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-sangeet-400 mb-6">
              {selectedCategory ? 'Edit Category' : 'Add Category'}
            </h2>
            <form onSubmit={selectedCategory ? handleEditCategory : handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={categoryFormData.name}
                  onChange={handleCategoryInputChange}
                  className="w-full px-3 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">Description</label>
                <textarea
                  name="description"
                  value={categoryFormData.description}
                  onChange={handleCategoryInputChange}
                  rows="3"
                  className="w-full px-3 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">Position</label>
                <input
                  type="number"
                  name="display_order"
                  value={categoryFormData.display_order}
                  onChange={handleCategoryInputChange}
                  className="w-full px-3 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100"
                  placeholder="1 = First, 2 = Second, etc."
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 text-sangeet-neutral-400 hover:text-sangeet-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-sangeet-400 text-sangeet-neutral-950 px-4 py-2 rounded-lg font-semibold hover:bg-sangeet-300 transition-colors"
                >
                  {selectedCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-sangeet-neutral-900 rounded-lg p-6 w-full max-w-md">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-sangeet-neutral-100 mb-2">
                Delete {deleteType === 'item' ? 'Menu Item' : 'Category'}
              </h3>
              <p className="text-sm text-sangeet-neutral-300 mb-6">
                Are you sure you want to delete <span className="font-semibold text-sangeet-400">"{deleteName}"</span>? 
                This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sangeet-neutral-400 hover:text-sangeet-neutral-200 border border-sangeet-neutral-600 rounded-lg hover:border-sangeet-neutral-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={deleteType === 'item' ? confirmDeleteItem : confirmDeleteCategory}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuModals;
