import React, { useState, useEffect, useCallback } from 'react';
import { 
  fetchMenuItems, 
  fetchMenuCategories, 
  createMenuItem, 
  updateMenuItem, 
  deleteMenuItem,
  createCategory,
  updateCategory,
  deleteCategory
} from '../services/api';
import toast from 'react-hot-toast';
import AdminHeader from '../components/AdminHeader';
import CustomDropdown from '../components/CustomDropdown';

const MenuManagementPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('items');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState(''); // 'item' or 'category'
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    priceRange: '',
    tags: [],
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    is_vegetarian: false,
    is_spicy: false,
    is_popular: false,
    preparation_time: 15
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    display_order: 0
  });

  // Dropdown options
  const priceRangeOptions = [
    { value: '', label: 'All Prices' },
    { value: '0-10', label: 'Under $10' },
    { value: '10-20', label: '$10 - $20' },
    { value: '20-30', label: '$20 - $30' },
    { value: '30-999', label: 'Over $30' }
  ];

  const sortOptions = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'price-asc', label: 'Price (Low-High)' },
    { value: 'price-desc', label: 'Price (High-Low)' },
    { value: 'category-asc', label: 'Category (A-Z)' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...menuItems];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm) ||
        item.category_name?.toLowerCase().includes(searchTerm)
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(item => 
        item.category_name === filters.category
      );
    }

    // Price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filtered = filtered.filter(item => {
        const price = parseFloat(item.price);
        if (max) {
          return price >= min && price <= max;
        } else {
          return price >= min;
        }
      });
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(item => {
        return filters.tags.some(tag => {
          switch (tag) {
            case 'vegetarian':
              return item.is_vegetarian;
            case 'spicy':
              return item.is_spicy;
            case 'popular':
              return item.is_popular;
            default:
              return false;
          }
        });
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = parseFloat(a.price);
          bValue = parseFloat(b.price);
          break;
        case 'category':
          aValue = a.category_name || '';
          bValue = b.category_name || '';
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredItems(filtered);
  }, [menuItems, filters]);

  useEffect(() => {
    if (menuItems.length > 0) {
      applyFilters();
    }
  }, [applyFilters, menuItems]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsData, categoriesData] = await Promise.all([
        fetchMenuItems(),
        fetchMenuCategories()
      ]);
      
      setMenuItems(itemsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load menu data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      priceRange: '',
      tags: [],
      sortBy: 'name',
      sortOrder: 'asc'
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    try {
      await createMenuItem(formData);
      toast.success('Menu item created successfully!');
      setShowAddModal(false);
      setFormData({
        name: '',
        description: '',
        price: '',
        category_id: '',
        image_url: '',
        is_vegetarian: false,
        is_spicy: false,
        is_popular: false,
        preparation_time: 15
      });
      loadData();
    } catch (error) {
      console.error('Error creating menu item:', error);
      toast.error(error.response?.data?.error || 'Failed to create menu item');
    }
  };

  const handleEditItem = async (e) => {
    e.preventDefault();
    try {
      await updateMenuItem(selectedItem.id, formData);
      toast.success('Menu item updated successfully!');
      setShowEditModal(false);
      setSelectedItem(null);
      loadData();
    } catch (error) {
      console.error('Error updating menu item:', error);
      toast.error(error.response?.data?.error || 'Failed to update menu item');
    }
  };

  const handleDeleteItem = async (id) => {
    const item = menuItems.find(item => item.id === id);
    setDeleteType('item');
    setDeleteId(id);
    setDeleteName(item?.name || 'this menu item');
    setShowDeleteModal(true);
  };

  const confirmDeleteItem = async () => {
    try {
      await deleteMenuItem(deleteId);
      toast.success('Menu item deleted successfully!');
      setShowDeleteModal(false);
      loadData();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error(error.response?.data?.error || 'Failed to delete menu item');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await createCategory(categoryFormData);
      toast.success('Category created successfully!');
      setShowCategoryModal(false);
      setCategoryFormData({
        name: '',
        description: '',
        display_order: 0
      });
      loadData();
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error(error.response?.data?.error || 'Failed to create category');
    }
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();
    try {
      await updateCategory(selectedCategory.id, categoryFormData);
      toast.success('Category updated successfully!');
      setShowCategoryModal(false);
      setSelectedCategory(null);
      loadData();
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error(error.response?.data?.error || 'Failed to update category');
    }
  };

  const handleDeleteCategory = async (id) => {
    const category = categories.find(cat => cat.id === id);
    setDeleteType('category');
    setDeleteId(id);
    setDeleteName(category?.name || 'this category');
    setShowDeleteModal(true);
  };

  const confirmDeleteCategory = async () => {
    try {
      await deleteCategory(deleteId);
      toast.success('Category deleted successfully!');
      setShowDeleteModal(false);
      loadData();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error.response?.data?.error || 'Failed to delete category');
    }
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category_id: item.category_id || '',
      image_url: item.image_url || '',
      is_vegetarian: item.is_vegetarian,
      is_spicy: item.is_spicy,
      is_popular: item.is_popular,
      preparation_time: item.preparation_time
    });
    setShowEditModal(true);
  };

  const openCategoryModal = (category = null) => {
    if (category) {
      setSelectedCategory(category);
      setCategoryFormData({
        name: category.name,
        description: category.description || '',
        display_order: category.display_order
      });
    } else {
      setSelectedCategory(null);
      setCategoryFormData({
        name: '',
        description: '',
        display_order: 0
      });
    }
    setShowCategoryModal(true);
  };

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

        {/* Menu Items Tab */}
        {activeTab === 'items' && (
          <div>
            {/* Filters Section */}
            <div className="bg-sangeet-neutral-900 rounded-lg p-6 border border-sangeet-neutral-700 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-sangeet-neutral-100">Filters & Search</h3>
                <button
                  onClick={clearFilters}
                  className="text-sangeet-neutral-400 hover:text-sangeet-neutral-200 text-sm"
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
                      <span className="bg-sangeet-400/20 text-sangeet-400 px-2 py-1 rounded text-xs">
                        Search: "{filters.search}"
                      </span>
                    )}
                    {filters.category && (
                      <span className="bg-sangeet-400/20 text-sangeet-400 px-2 py-1 rounded text-xs">
                        Category: {filters.category}
                      </span>
                    )}
                    {filters.priceRange && (
                      <span className="bg-sangeet-400/20 text-sangeet-400 px-2 py-1 rounded text-xs">
                        Price: {filters.priceRange === '0-10' ? 'Under $10' : 
                               filters.priceRange === '10-20' ? '$10 - $20' :
                               filters.priceRange === '20-30' ? '$20 - $30' :
                               filters.priceRange === '30-999' ? 'Over $30' : filters.priceRange}
                      </span>
                    )}
                    {filters.tags.map(tag => (
                      <span key={tag} className="bg-sangeet-400/20 text-sangeet-400 px-2 py-1 rounded text-xs">
                        {tag === 'vegetarian' ? '🥬 Vegetarian' :
                         tag === 'spicy' ? '🌶️ Spicy' :
                         tag === 'popular' ? '⭐ Popular' : tag}
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
                    placeholder="Search items..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full px-3 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100"
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">Category</label>
                  <CustomDropdown
                    value={filters.category}
                    onChange={(category) => handleFilterChange('category', category)}
                    options={[
                      { value: '', label: 'All Categories' },
                      ...categories.map((category) => ({
                        value: category.name,
                        label: `${category.name} (${category.item_count})`
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
                    onChange={(priceRange) => handleFilterChange('priceRange', priceRange)}
                    options={priceRangeOptions}
                    className="w-full"
                  />
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">Sort By</label>
                  <CustomDropdown
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={(value) => {
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
                  {[
                    { key: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
                    { key: 'spicy', label: 'Spicy', icon: '🌶️' },
                    { key: 'popular', label: 'Popular', icon: '⭐' }
                  ].map((tag) => (
                    <button
                      key={tag.key}
                      onClick={() => {
                        const newTags = filters.tags.includes(tag.key)
                          ? filters.tags.filter(t => t !== tag.key)
                          : [...filters.tags, tag.key];
                        handleFilterChange('tags', newTags);
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        filters.tags.includes(tag.key)
                          ? 'bg-sangeet-400 text-sangeet-neutral-950'
                          : 'bg-sangeet-neutral-800 text-sangeet-neutral-400 hover:bg-sangeet-neutral-700'
                      }`}
                    >
                      {tag.icon} {tag.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

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
                {filteredItems.map((item) => (
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
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
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
        )}

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
                        console.log('Category selected:', categoryId);
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
      </div>
    </div>
  );
};

export default MenuManagementPage; 