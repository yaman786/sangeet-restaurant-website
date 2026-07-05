import React from 'react';
import AdminHeader from '../../components/AdminHeader';
import { useMenuManagement } from './hooks/useMenuManagement';
import MenuFilters from './components/MenuFilters';
import MenuList from './components/MenuList';
import MenuCategories from './components/MenuCategories';
import MenuModals from './components/MenuModals';

const MenuManagement = () => {
  const {
    menuItems, filteredItems, categories, loading, activeTab, setActiveTab,
    showAddModal, setShowAddModal, showEditModal, setShowEditModal,
    showCategoryModal, setShowCategoryModal, showDeleteModal, setShowDeleteModal,
    deleteType, deleteName, selectedItem, selectedCategory,
    filters,
    handleFilterChange, clearFilters,
    handleAddItem, handleEditItem, handleDeleteItem, confirmDeleteItem,
    handleAddCategory, handleEditCategory, handleDeleteCategory, confirmDeleteCategory,
    openEditModal, openCategoryModal
  } = useMenuManagement();

  if (loading) {
    return (
      <div className="min-h-screen bg-sangeet-neutral-950 flex items-center justify-center">
        <div className="text-sangeet-400 text-xl">Loading menu management...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sangeet-neutral-950">
      <AdminHeader />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex space-x-1 bg-sangeet-neutral-900 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('items')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'items'
                ? 'bg-sangeet-400 text-sangeet-neutral-950'
                : 'text-sangeet-neutral-400 hover:text-sangeet-neutral-200'
            }`}
          >
            Menu Items ({filteredItems.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'categories'
                ? 'bg-sangeet-400 text-sangeet-neutral-950'
                : 'text-sangeet-neutral-400 hover:text-sangeet-neutral-200'
            }`}
          >
            Categories ({categories.length})
          </button>
        </div>

        {activeTab === 'items' && (
          <div>
            <MenuFilters 
              filters={filters}
              handleFilterChange={handleFilterChange}
              categories={categories}
              clearFilters={clearFilters}
            />
            <MenuList 
              filteredItems={filteredItems}
              menuItems={menuItems}
              setShowAddModal={setShowAddModal}
              openEditModal={openEditModal}
              handleDeleteItem={handleDeleteItem}
            />
          </div>
        )}

        {activeTab === 'categories' && (
          <MenuCategories 
            categories={categories}
            openCategoryModal={openCategoryModal}
            handleDeleteCategory={handleDeleteCategory}
          />
        )}
      </div>

      <MenuModals 
        showAddModal={showAddModal} setShowAddModal={setShowAddModal}
        showEditModal={showEditModal} setShowEditModal={setShowEditModal}
        showCategoryModal={showCategoryModal} setShowCategoryModal={setShowCategoryModal}
        showDeleteModal={showDeleteModal} setShowDeleteModal={setShowDeleteModal}
        deleteType={deleteType} deleteName={deleteName}
        selectedItem={selectedItem} selectedCategory={selectedCategory}
        categories={categories}
        handleAddItem={handleAddItem} handleEditItem={handleEditItem}
        handleAddCategory={handleAddCategory} handleEditCategory={handleEditCategory}
        confirmDeleteItem={confirmDeleteItem} confirmDeleteCategory={confirmDeleteCategory}
      />
    </div>
  );
};

export default MenuManagement;
