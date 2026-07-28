"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { menuItemSchema, categorySchema } from '@/lib/validations';
import CustomDropdown from '../../../components/CustomDropdown';
import { uploadMenuImageAction } from '@/app/actions/menuActions';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/lib/utils/cropImage';

const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: 0.5,           // Target max 500KB per image
  maxWidthOrHeight: 1200,   // Max dimension — plenty for web menu cards
  useWebWorker: true,       // Non-blocking compression in a Web Worker
  fileType: 'image/webp' as const,  // WebP = best size-to-quality ratio
  initialQuality: 0.82,     // 82% quality — visually indistinguishable from 100%
};

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
      name: '', price: 0, description: '', category: '', image_url: '',
      preparation_time: 15, is_vegetarian: false, is_spicy: false, is_popular: false
    }
  });

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cropper state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  const watchCategory = watchItem('category');

  useEffect(() => {
    if (showEditModal && selectedItem) {
      resetItem({
        name: selectedItem.name || '',
        price: Number(selectedItem.price) || 0,
        description: selectedItem.description || '',
        category: selectedItem.category || selectedItem.category_name || '',
        image_url: selectedItem.image_url || '',
        preparation_time: Number(selectedItem.preparation_time) || 15,
        is_vegetarian: selectedItem.is_vegetarian ?? false,
        is_spicy: selectedItem.is_spicy ?? false,
        is_popular: selectedItem.is_popular ?? false,
      });
    } else if (showAddModal) {
      resetItem({
        name: '', price: 0, description: '', category: '', image_url: '',
        preparation_time: 15, is_vegetarian: false, is_spicy: false, is_popular: false
      });
    }
  }, [showAddModal, showEditModal, selectedItem, resetItem]);

  // Category Form
  const {
    register: registerCategory,
    handleSubmit: handleSubmitCategory,
    reset: resetCategory,
    setValue: setCategoryValue,
    watch: watchCategoryForm,
    formState: { errors: categoryErrors }
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', description: '', display_order: 0, parent_id: null } as any
  });

  useEffect(() => {
    if (showCategoryModal) {
      if (selectedCategory) {
        resetCategory({ ...selectedCategory, parent_id: selectedCategory.parent_id || '' });
      } else {
        resetCategory({ name: '', description: '', display_order: 0, parent_id: '' } as any);
      }
    }
  }, [showCategoryModal, selectedCategory, resetCategory]);

  const itemCategoryOptions = categories.flatMap((c: any) => {
    if (c.parent_id) return []; // skip children, handled by parent
    
    const children = categories.filter((child: any) => child.parent_id === c.id);
    if (children.length > 0) {
      return children.map((child: any) => ({ label: `${c.name} > ${child.name}`, value: child.name }));
    }
    return [{ label: c.name, value: c.name }];
  });

  const parentCategoryOptions = [
    { label: 'None (Top Level)', value: '' },
    ...categories
      .filter((c: any) => !c.parent_id && (!selectedCategory || c.id !== selectedCategory.id))
      .map((c: any) => ({ label: c.name, value: c.id }))
  ];

  return (
    <>
      {/* Add/Edit Menu Item Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-sangeet-neutral-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-sangeet-400 mb-6">
              {showAddModal ? 'Add Menu Item' : 'Edit Menu Item'}
            </h2>
            <form onSubmit={handleSubmitItem(
              showAddModal ? handleAddItem : handleEditItem,
              (errors) => {
                console.error('Form validation errors:', errors);
                const firstError = Object.values(errors)[0];
                toast.error(`Validation: ${(firstError as any)?.message || 'Please check all fields'}`);
              }
            )} className="space-y-4">
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
                    label="Category"
                    options={itemCategoryOptions}
                    value={watchItem('category')}
                    onChange={(val: any) => setItemValue('category', val, { shouldValidate: true })}
                    error={itemErrors.category?.message}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">Image</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      {...registerItem('image_url')}
                      placeholder="https://..."
                      className="w-full px-3 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100"
                    />
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isUploading ? 'bg-sangeet-neutral-700 text-sangeet-neutral-400 cursor-not-allowed' : 'bg-sangeet-400 text-sangeet-neutral-950 hover:bg-sangeet-300 cursor-pointer'}`}
                    >
                      {isUploading ? 'Uploading...' : '📷 Upload'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        // Instead of uploading directly, read the file and open cropper
                        const reader = new FileReader();
                        reader.addEventListener('load', () => {
                          setCropImageSrc(reader.result?.toString() || null);
                          setIsCropModalOpen(true);
                        });
                        reader.readAsDataURL(file);

                        // Reset so same file can be re-selected
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    />
                  </div>
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
                <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">Parent Category</label>
                <CustomDropdown
                  label="Parent Category"
                  options={parentCategoryOptions}
                  value={watchCategoryForm('parent_id') || ''}
                  onChange={(val: any) => setCategoryValue('parent_id', val === '' ? null : Number(val), { shouldValidate: true })}
                  className="w-full"
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
                Are you sure you want to delete <span className="font-semibold text-sangeet-400">&quot;{deleteName}&quot;</span>? 
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

      {/* Image Cropper Modal */}
      {isCropModalOpen && cropImageSrc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCropModalOpen(false)}></div>
          <div className="relative bg-sangeet-neutral-900 border border-sangeet-neutral-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[80vh]">
            <div className="p-4 border-b border-sangeet-neutral-800 flex justify-between items-center bg-sangeet-neutral-900/50 backdrop-blur">
              <h3 className="text-lg font-semibold text-sangeet-neutral-100">Crop Image (4:3 Ratio)</h3>
              <button onClick={() => setIsCropModalOpen(false)} className="text-sangeet-neutral-400 hover:text-white transition-colors">
                ✕
              </button>
            </div>
            
            <div className="relative flex-grow bg-black">
              <Cropper
                image={cropImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3}
                onCropChange={setCrop}
                onCropComplete={(_, croppedPixels: any) => setCroppedAreaPixels(croppedPixels)}
                onZoomChange={setZoom}
              />
            </div>

            <div className="p-4 border-t border-sangeet-neutral-800 bg-sangeet-neutral-900/50 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-sangeet-neutral-400">Zoom</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-sangeet-400"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCropModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-sangeet-neutral-300 hover:bg-sangeet-neutral-800 transition-colors"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isUploading}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isUploading ? 'bg-sangeet-neutral-700 text-sangeet-neutral-400 cursor-not-allowed' : 'bg-sangeet-400 text-sangeet-neutral-950 hover:bg-sangeet-300'
                  }`}
                  onClick={async () => {
                    try {
                      setIsUploading(true);
                      
                      const croppedFile = await getCroppedImg(cropImageSrc, croppedAreaPixels as any);
                      if (!croppedFile) throw new Error('Failed to crop image');
                      
                      const originalSizeMB = (croppedFile.size / 1024 / 1024).toFixed(1);
                      const toastId = toast.loading(`Compressing cropped image...`);
                      
                      const compressedFile = await imageCompression(croppedFile, IMAGE_COMPRESSION_OPTIONS);
                      const compressedSizeKB = (compressedFile.size / 1024).toFixed(0);
                      toast.loading(`Uploading ${compressedSizeKB}KB...`, { id: toastId });

                      const formData = new FormData();
                      formData.append('file', compressedFile);
                      const res = await uploadMenuImageAction(formData);
                      
                      if (res.success) {
                        setItemValue('image_url', res.url, { shouldValidate: true });
                        toast.success('Image cropped & uploaded!', { id: toastId });
                        setIsCropModalOpen(false);
                      } else {
                        toast.error(res.error || 'Upload failed', { id: toastId });
                      }
                    } catch (err: any) {
                      toast.error('Upload failed: ' + err.message);
                    } finally {
                      setIsUploading(false);
                    }
                  }}
                >
                  {isUploading ? 'Uploading...' : 'Crop & Upload'}
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
