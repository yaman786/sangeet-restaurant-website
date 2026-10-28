"use client";
import React from 'react';
import { UtensilsCrossed, Wine } from 'lucide-react';
import AdminHeader from '../../components/AdminHeader';
import { useMenuManagement } from './hooks/useMenuManagement';
import MenuFilters from './components/MenuFilters';
import MenuList from './components/MenuList';
import MenuCategories from './components/MenuCategories';
import MenuModals from './components/MenuModals';

const MenuManagement = () => {
  const {
    menuItems, filteredItems, categories, loading, activeTab, setActiveTab,
    menuSection, handleSectionChange, foodCount, drinkCount,
    sectionItems, sectionCategories,
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
      <AdminHeader title="Menu Management" subtitle="Manage your restaurant food and bar menus" />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Top-Level Two-Way Menu Switcher: Food Menu vs Bar & Drinks */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-sangeet-neutral-900 border border-sangeet-neutral-800 rounded-xl p-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-sangeet-neutral-100">
              {menuSection === 'food' ? 'Kitchen & Culinary Menu' : 'Bar & Beverage Menu'}
            </h2>
            <p className="text-sm text-sangeet-neutral-400">
              {menuSection === 'food'
                ? 'Manage starters, mains, breads, biryanis, and desserts'
                : 'Manage draught beers, bottled beers, whiskies, spirits, cocktails, and champagne'}
            </p>
          </div>
          <div
            role="tablist"
            aria-label="Menu section switcher"
            className="inline-flex bg-sangeet-neutral-950 p-1.5 rounded-xl border border-sangeet-neutral-800 self-start sm:self-auto"
          >
            <button
              type="button"
              role="tab"
              aria-selected={menuSection === 'food'}
              data-testid="menu-section-food"
              onClick={() => handleSectionChange('food')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                menuSection === 'food'
                  ? 'bg-sangeet-400 text-sangeet-neutral-950 shadow-md'
                  : 'text-sangeet-neutral-400 hover:text-sangeet-neutral-200'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Food Menu</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  menuSection === 'food'
                    ? 'bg-sangeet-neutral-950/20 text-sangeet-neutral-950'
                    : 'bg-sangeet-neutral-800 text-sangeet-neutral-300'
                }`}
              >
                {foodCount}
              </span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={menuSection === 'drinks'}
              data-testid="menu-section-drinks"
              onClick={() => handleSectionChange('drinks')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                menuSection === 'drinks'
                  ? 'bg-sangeet-400 text-sangeet-neutral-950 shadow-md'
                  : 'text-sangeet-neutral-400 hover:text-sangeet-neutral-200'
              }`}
            >
              <Wine className="w-4 h-4" />
              <span>Bar &amp; Drinks</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  menuSection === 'drinks'
                    ? 'bg-sangeet-neutral-950/20 text-sangeet-neutral-950'
                    : 'bg-sangeet-neutral-800 text-sangeet-neutral-300'
                }`}
              >
                {drinkCount}
              </span>
            </button>
          </div>
        </div>

        {/* Sub-Tabs: Menu Items vs Categories (scoped to active Menu Section) */}
        <div className="flex space-x-1 bg-sangeet-neutral-900 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('items')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors cursor-pointer ${
              activeTab === 'items'
                ? 'bg-sangeet-400 text-sangeet-neutral-950 font-semibold'
                : 'text-sangeet-neutral-400 hover:text-sangeet-neutral-200'
            }`}
          >
            {menuSection === 'food' ? 'Food Items' : 'Drink Items'} ({filteredItems.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-sangeet-400 text-sangeet-neutral-950 font-semibold'
                : 'text-sangeet-neutral-400 hover:text-sangeet-neutral-200'
            }`}
          >
            {menuSection === 'food' ? 'Food Categories' : 'Bar Categories'} ({sectionCategories.length})
          </button>
        </div>

        {activeTab === 'items' && (
          <div>
            <MenuFilters 
              filters={filters}
              handleFilterChange={handleFilterChange}
              categories={sectionCategories}
              menuSection={menuSection}
              clearFilters={clearFilters}
            />
            <MenuList 
              filteredItems={filteredItems}
              menuItems={sectionItems}
              categories={categories}
              menuSection={menuSection}
              setShowAddModal={setShowAddModal}
              openEditModal={openEditModal}
              handleDeleteItem={handleDeleteItem}
            />
          </div>
        )}

        {activeTab === 'categories' && (
          <MenuCategories 
            categories={sectionCategories}
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
        sectionCategories={sectionCategories}
        menuSection={menuSection}
        handleAddItem={handleAddItem} handleEditItem={handleEditItem}
        handleAddCategory={handleAddCategory} handleEditCategory={handleEditCategory}
        confirmDeleteItem={confirmDeleteItem} confirmDeleteCategory={confirmDeleteCategory}
      />
    </div>
  );
};

export default MenuManagement;
