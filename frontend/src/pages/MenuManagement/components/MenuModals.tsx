import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { menuItemSchema, categorySchema } from '../../../utils/validators';
import CustomDropdown from '../../../components/CustomDropdown';

const MenuModals = ({
  showAddModal, setShowAddModal,
  showEditModal, setShowEditModal,
  showCategoryModal, setShowCategoryModal,
  showDeleteModal, setShowDeleteModal,
  deleteType, deleteName,
  selectedItem, selectedCategory,
  categories,
  handleAddItem, handleEditItem,
  handleAddCategory, handleEditCategory,
  confirmDeleteItem, confirmDeleteCategory
}: any) => {
  // Menu Item Form
  const { 
    register: registerItem, 
    handleSubmit: handleSubmitItem, 
    reset: resetItem,
    setValue: setItemValue,
    watch: watchItem,
    formState: { errors: itemErrors } 
  } = useForm({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: '', price: 0, description: '', category_id: 0, image_url: '',
      preparation_time: 15, is_vegetarian: false, is_spicy: false, is_popular: false
    }
  });

  const watchCategoryId = watchItem('category_id');

  useEffect(() => {
    if (showEditModal && selectedItem) {
      resetItem(selectedItem);
    } else if (showAddModal) {
      resetItem({
        name: '', price: 0, description: '', category_id: 0, image_url: '',
        preparation_time: 15, is_vegetarian: false, is_spicy: false, is_popular: false
      });
    }
  }, [showAddModal, showEditModal, selectedItem, resetItem]);

  // Category Form
  const {
    register: registerCategory,
    handleSubmit: handleSubmitCategory,
    reset: resetCategory,
    formState: { errors: categoryErrors }
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', description: '', display_order: 0 } as any
  });

  useEffect(() => {
    if (showCategoryModal) {
      if (selectedCategory) {
        resetCategory(selectedCategory);
      } else {
        resetCategory({ name: '', description: '', display_order: 0 } as any);
      }
    }
  }, [showCategoryModal, selectedCategory, resetCategory]);

  return (
    <>
      {/* Add/Edit Menu Item Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-sangeet-neutral-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-sangeet-400 mb-6">
              {showAddModal ? 'Add Menu Item' : 'Edit Menu Item'}
            </h2>
            <form onSubmit={handleSubmitItem(showAddModal ? handleAddItem : handleEditItem)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">Name</label>
                  <input
                    type="text"
                    {...registerItem('name')}
                    className="w-full px-3 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100"
                  />
                  {itemErrors.name && <p className="text-red-500 text-xs mt-1">{itemErrors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    {...registerItem('price')}
                    className="w-full px-3 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100"
                  />
                  {itemErrors.price && <p className="text-red-500 text-xs mt-1">{itemErrors.price.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">Description</label>
                <textarea
                  {...registerItem('description')}
                  rows={3}
                  className="w-full px-3 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">Category</label>
                  <CustomDropdown
                    value={watchCategoryId || ''}
                    onChange={(categoryId: any) => setItemValue('category_id', categoryId)}
                    options={[
                      { value: '', label: 'Select Category' },
                      ...categories.map((category: any) => ({
                        value: category.id,
                        label: category.name
                      }))
                    ]}
                    className="w-full"
                  />
                  {itemErrors.category_id && <p className="text-red-500 text-xs mt-1">{itemErrors.category_id.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">Image URL</label>
                  <input
                    type="url"
                    {...registerItem('image_url')}
                    className="w-full px-3 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100"
                  />
                  {itemErrors.image_url && <p className="text-red-500 text-xs mt-1">{itemErrors.image_url.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">Preparation Time (minutes)</label>
                  <input
                    type="number"
                    {...registerItem('preparation_time')}
                    className="w-full px-3 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100"
                  />
                  {itemErrors.preparation_time && <p className="text-red-500 text-xs mt-1">{itemErrors.preparation_time.message}</p>}
                </div>
              </div>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input type="checkbox" {...registerItem('is_vegetarian')} className="mr-2" />
                  <span className="text-sangeet-neutral-300">Vegetarian</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" {...registerItem('is_spicy')} className="mr-2" />
                  <span className="text-sangeet-neutral-300">Spicy</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" {...registerItem('is_popular')} className="mr-2" />
                  <span className="text-sangeet-neutral-300">Popular</span>
                </label>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
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
            <form onSubmit={handleSubmitCategory(selectedCategory ? handleEditCategory : handleAddCategory)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">Name</label>
                <input
                  type="text"
                  {...registerCategory('name')}
                  className="w-full px-3 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100"
                />
                {categoryErrors.name && <p className="text-red-500 text-xs mt-1">{categoryErrors.name.message as string}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">Description</label>
                <textarea
                  {...registerCategory('description')}
                  rows={3}
                  className="w-full px-3 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">Position</label>
                <input
                  type="number"
                  {...registerCategory('display_order' as any)}
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
