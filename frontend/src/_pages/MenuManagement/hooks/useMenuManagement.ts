import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { 
  fetchMenuItems, 
  fetchMenuCategories, 
  createMenuItem, 
  updateMenuItem, 
  deleteMenuItem,
  createCategory,
  updateCategory,
  deleteCategory
} from '../../../services/api';

export const useMenuManagement = () => {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('items');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [deleteType, setDeleteType] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    priceRange: '',
    tags: [],
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [itemsData, categoriesData] = await Promise.all([
        fetchMenuItems(), fetchMenuCategories()
      ]);
      setMenuItems(itemsData as any[]);
      setCategories(categoriesData as any[]);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Failed to load menu data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const applyFilters = useCallback(() => {
    let filtered = [...menuItems];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter((item: any) => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm) ||
        item.category_name?.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.category) {
      filtered = filtered.filter((item: any) => item.category_name === filters.category);
    }

    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filtered = filtered.filter((item: any) => {
        const price = parseFloat(item.price);
        return max ? (price >= min && price <= max) : (price >= min);
      });
    }

    if (filters.tags.length > 0) {
      filtered = filtered.filter((item: any) => {
        return filters.tags.some((tag: any) => {
          if (tag === 'vegetarian') return item.is_vegetarian;
          if (tag === 'spicy') return item.is_spicy;
          if (tag === 'popular') return item.is_popular;
          return false;
        });
      });
    }

    filtered.sort((a: any, b: any) => {
      let aValue, bValue;
      switch (filters.sortBy) {
        case 'price':
          aValue = parseFloat(a.price); bValue = parseFloat(b.price); break;
        case 'category':
          aValue = a.category_name || ''; bValue = b.category_name || ''; break;
        default:
          aValue = a.name.toLowerCase(); bValue = b.name.toLowerCase();
      }
      return filters.sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });

    setFilteredItems(filtered);
  }, [menuItems, filters]);

  useEffect(() => {
    if (menuItems.length > 0) {
      applyFilters();
    } else {
      setFilteredItems([]);
    }
  }, [applyFilters, menuItems]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', priceRange: '', tags: [], sortBy: 'name', sortOrder: 'asc' });
  };

  const handleAddItem = async (data: any) => {
    try {
      await createMenuItem(data);
      toast.success('Menu item created successfully!');
      setShowAddModal(false);
      loadData();
    } catch (error: any) {
      console.error('Error creating menu item:', error);
      toast.error(error.response?.data?.error || 'Failed to create menu item');
    }
  };

  const handleEditItem = async (data: any) => {
    try {
      await updateMenuItem((selectedItem as any)?.id, data);
      toast.success('Menu item updated successfully!');
      setShowEditModal(false);
      setSelectedItem(null);
      loadData();
    } catch (error: any) {
      console.error('Error updating menu item:', error);
      toast.error(error.response?.data?.error || 'Failed to update menu item');
    }
  };

  const handleDeleteItem = async (id: string | number | null) => {
    const item = menuItems.find((item: any) => item.id === id);
    setDeleteType('item');
    setDeleteId(id as any);
    setDeleteName(item?.name || 'this menu item');
    setShowDeleteModal(true);
  };

  const confirmDeleteItem = async () => {
    try {
      await deleteMenuItem(deleteId as any);
      toast.success('Menu item deleted successfully!');
      setShowDeleteModal(false);
      loadData();
    } catch (error: any) {
      console.error('Error deleting menu item:', error);
      toast.error(error.response?.data?.error || 'Failed to delete menu item');
    }
  };

  const handleAddCategory = async (data: any) => {
    try {
      await createCategory(data);
      toast.success('Category created successfully!');
      setShowCategoryModal(false);
      loadData();
    } catch (error: any) {
      console.error('Error creating category:', error);
      toast.error(error.response?.data?.error || 'Failed to create category');
    }
  };

  const handleEditCategory = async (data: any) => {
    try {
      await updateCategory((selectedCategory as any)?.id, data);
      toast.success('Category updated successfully!');
      setShowCategoryModal(false);
      setSelectedCategory(null);
      loadData();
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast.error(error.response?.data?.error || 'Failed to update category');
    }
  };

  const handleDeleteCategory = async (id: string | number | null) => {
    const category = categories.find((cat: any) => cat.id === id);
    setDeleteType('category');
    setDeleteId(id as any);
    setDeleteName(category?.name || 'this category');
    setShowDeleteModal(true);
  };

  const confirmDeleteCategory = async () => {
    try {
      await deleteCategory(deleteId as any);
      toast.success('Category deleted successfully!');
      setShowDeleteModal(false);
      loadData();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error(error.response?.data?.error || 'Failed to delete category');
    }
  };

  const openEditModal = (item: any) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const openCategoryModal = (category: any = null) => {
    if (category) {
      setSelectedCategory(category);
    } else {
      setSelectedCategory(null);
    }
    setShowCategoryModal(true);
  };

  const getCategoryItems = (categoryId: number) => {
    return menuItems.filter((item: any) => item.category_id === categoryId);
  };

  return {
    menuItems, filteredItems, categories, loading, activeTab, setActiveTab,
    showAddModal, setShowAddModal, showEditModal, setShowEditModal,
    showCategoryModal, setShowCategoryModal, showDeleteModal, setShowDeleteModal,
    deleteType, setDeleteType, deleteId, setDeleteId, deleteName, setDeleteName,
    selectedItem, setSelectedItem, selectedCategory, setSelectedCategory,
    filters, setFilters,
    handleFilterChange, clearFilters,
    handleAddItem, handleEditItem, handleDeleteItem, confirmDeleteItem,
    handleAddCategory, handleEditCategory, handleDeleteCategory, confirmDeleteCategory,
    openEditModal, openCategoryModal
  };
};
