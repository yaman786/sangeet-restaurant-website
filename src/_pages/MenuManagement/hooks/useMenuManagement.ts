import { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { 
  fetchMenuItems, 
  fetchMenuCategories
} from '../../../services/api';
import { 
  createMenuItemAction, 
  updateMenuItemAction, 
  deleteMenuItemAction,
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction
} from '@/app/actions/menuActions';
import { 
  isBarCategory, 
  isBarMenuItem, 
  groupDrinkMenuItems, 
  stripDrinkVariantSuffix, 
  type MenuSection 
} from '@/lib/utils/menuSection';

export const useMenuManagement = () => {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('items');
  const [menuSection, setMenuSection] = useState<MenuSection>('food');
  
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
    queueMicrotask(() => {
      loadData();
    });
  }, [loadData]);

  const foodItems = useMemo(
    () => menuItems.filter((item: any) => !isBarMenuItem(item, categories)),
    [menuItems, categories]
  );

  const drinkItems = useMemo(
    () => menuItems.filter((item: any) => isBarMenuItem(item, categories)),
    [menuItems, categories]
  );

  const groupedDrinkItems = useMemo(
    () => groupDrinkMenuItems(drinkItems),
    [drinkItems]
  );

  const sectionItems = useMemo(
    () => (menuSection === 'drinks' ? groupedDrinkItems : foodItems),
    [menuSection, groupedDrinkItems, foodItems]
  );

  const sectionCategories = useMemo(
    () =>
      categories.filter((c: any) =>
        menuSection === 'drinks' ? isBarCategory(c, categories) : !isBarCategory(c, categories)
      ),
    [categories, menuSection]
  );

  const handleSectionChange = useCallback((section: MenuSection) => {
    setMenuSection(section);
    setFilters((prev) => ({
      ...prev,
      category: '',
      tags: section === 'drinks' ? prev.tags.filter((t: string) => t === 'popular') : prev.tags,
    }));
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...sectionItems];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter((item: any) => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm) ||
        item.category_name?.toLowerCase().includes(searchTerm) ||
        item.category?.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.category) {
      const selectedCatObj = categories.find((c: any) => c.name === filters.category);
      const childCats = categories.filter(
        (c: any) => selectedCatObj && Number(c.parent_id) === Number(selectedCatObj.id)
      );
      const childCategoryNames = childCats.map((c: any) => c.name);
      const childCategoryIds = childCats.map((c: any) => Number(c.id));
      const validCategoryNames = [filters.category, ...childCategoryNames];
      const validCategoryIds = [selectedCatObj?.id, ...childCategoryIds].filter(Boolean).map(Number);

      filtered = filtered.filter((item: any) => 
        validCategoryNames.includes(item.category_name) ||
        validCategoryNames.includes(item.category) ||
        validCategoryIds.includes(Number(item.category_id))
      );
    }

    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      const inRange = (p: number) => (max ? p >= min && p <= max : p >= min);
      filtered = filtered.filter((item: any) => {
        if (item.servingMode === 'shot_and_bottle') {
          return inRange(Number(item.shotPrice || 0)) || inRange(Number(item.bottlePrice || 0));
        }
        const price = parseFloat(item.price);
        return inRange(price);
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
          aValue = a.category_name || a.category || ''; bValue = b.category_name || b.category || ''; break;
        default:
          aValue = a.name.toLowerCase(); bValue = b.name.toLowerCase();
      }
      return filters.sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });

    setFilteredItems(filtered);
  }, [sectionItems, categories, filters]);

  useEffect(() => {
    queueMicrotask(() => {
      if (sectionItems.length > 0) {
        applyFilters();
      } else {
        setFilteredItems([]);
      }
    });
  }, [sectionItems, applyFilters]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', priceRange: '', tags: [], sortBy: 'name', sortOrder: 'asc' });
  };

  const handleAddItem = async (data: any) => {
    if (menuSection === 'drinks') {
      const servingMode = data.serving_mode || 'single';
      const baseName = stripDrinkVariantSuffix(data.name);
      const commonDrinkFields = {
        description: data.description || '',
        category: data.category,
        image_url: data.image_url || '',
        is_vegetarian: false,
        is_spicy: false,
        is_popular: Boolean(data.is_popular),
        preparation_time: 5,
      };

      if (servingMode === 'shot_and_bottle') {
        const shotPrice = Number(data.shot_price) || 0;
        const bottlePrice = Number(data.bottle_price) || 0;
        if (shotPrice <= 0 || bottlePrice <= 0) {
          toast.error('Please enter valid Shot and Full Bottle prices');
          return;
        }
        const [shotRes, bottleRes] = await Promise.all([
          createMenuItemAction({
            ...commonDrinkFields,
            name: `${baseName} (Shot)`,
            price: shotPrice,
          }),
          createMenuItemAction({
            ...commonDrinkFields,
            name: `${baseName} (Bottle)`,
            price: bottlePrice,
          }),
        ]);
        if (shotRes.success && bottleRes.success) {
          toast.success(`${baseName} (Shot & Bottle) created successfully!`);
          setShowAddModal(false);
          loadData();
        } else {
          toast.error(shotRes.error || bottleRes.error || 'Failed to create drink item');
        }
        return;
      }

      if (servingMode === 'bottle_only') {
        const bottlePrice = Number(data.bottle_price || data.price) || 0;
        if (bottlePrice <= 0) {
          toast.error('Please enter a valid Full Bottle price');
          return;
        }
        const res = await createMenuItemAction({
          ...commonDrinkFields,
          name: `${baseName} (Bottle)`,
          price: bottlePrice,
        });
        if (res.success) {
          toast.success(`${baseName} (Bottle) created successfully!`);
          setShowAddModal(false);
          loadData();
        } else {
          toast.error(res.error || 'Failed to create drink item');
        }
        return;
      }

      const singlePrice = Number(data.price) || 0;
      if (singlePrice <= 0) {
        toast.error('Please enter a valid price');
        return;
      }
      const res = await createMenuItemAction({
        ...commonDrinkFields,
        name: String(data.name || '').trim(),
        price: singlePrice,
      });
      if (res.success) {
        toast.success('Drink item created successfully!');
        setShowAddModal(false);
        loadData();
      } else {
        toast.error(res.error || 'Failed to create drink item');
      }
      return;
    }

    const result = await createMenuItemAction(data);
    if (result.success) {
      toast.success('Menu item created successfully!');
      setShowAddModal(false);
      loadData();
    } else {
      console.error('Error creating menu item:', result.error);
      toast.error(result.error || 'Failed to create menu item');
    }
  };

  const handleEditItem = async (data: any) => {
    const current: any = selectedItem;
    if (menuSection === 'drinks' && current) {
      const servingMode = data.serving_mode || current.servingMode || 'single';
      const baseName = stripDrinkVariantSuffix(data.name);
      const commonDrinkFields = {
        description: data.description || '',
        category: data.category,
        image_url: data.image_url || '',
        is_vegetarian: false,
        is_spicy: false,
        is_popular: Boolean(data.is_popular),
        preparation_time: 5,
      };

      if (servingMode === 'shot_and_bottle') {
        const shotPrice = Number(data.shot_price) || 0;
        const bottlePrice = Number(data.bottle_price) || 0;
        if (shotPrice <= 0 || bottlePrice <= 0) {
          toast.error('Please enter valid Shot and Full Bottle prices');
          return;
        }
        const shotPayload = {
          ...commonDrinkFields,
          name: `${baseName} (Shot)`,
          image_url: data.image_url || current.shotItem?.image_url || '',
          price: shotPrice,
        };
        const bottlePayload = {
          ...commonDrinkFields,
          name: `${baseName} (Bottle)`,
          image_url: data.image_url || current.bottleItem?.image_url || '',
          price: bottlePrice,
        };

        const shotPromise = current.shotItem?.id
          ? updateMenuItemAction(current.shotItem.id, shotPayload)
          : createMenuItemAction(shotPayload);
        const bottlePromise = current.bottleItem?.id
          ? updateMenuItemAction(current.bottleItem.id, bottlePayload)
          : createMenuItemAction(bottlePayload);

        const [shotRes, bottleRes] = await Promise.all([shotPromise, bottlePromise]);
        if (shotRes.success && bottleRes.success) {
          toast.success(`${baseName} (Shot & Bottle) updated successfully!`);
          setShowEditModal(false);
          setSelectedItem(null);
          loadData();
        } else {
          toast.error(shotRes.error || bottleRes.error || 'Failed to update drink item');
        }
        return;
      }

      if (servingMode === 'bottle_only') {
        const bottlePrice = Number(data.bottle_price || data.price) || 0;
        if (bottlePrice <= 0) {
          toast.error('Please enter a valid Full Bottle price');
          return;
        }
        const targetId = current.bottleItem?.id || current.id;
        const res = await updateMenuItemAction(targetId, {
          ...commonDrinkFields,
          name: `${baseName} (Bottle)`,
          price: bottlePrice,
        });
        if (current.shotItem?.id && current.shotItem.id !== targetId) {
          await deleteMenuItemAction(current.shotItem.id);
        }
        if (res.success) {
          toast.success(`${baseName} updated successfully!`);
          setShowEditModal(false);
          setSelectedItem(null);
          loadData();
        } else {
          toast.error(res.error || 'Failed to update drink item');
        }
        return;
      }

      const singlePrice = Number(data.price) || 0;
      const targetId = current.singleItem?.id || current.shotItem?.id || current.id;
      const res = await updateMenuItemAction(targetId, {
        ...commonDrinkFields,
        name: String(data.name || '').trim(),
        price: singlePrice,
      });
      if (current.bottleItem?.id && current.bottleItem.id !== targetId) {
        await deleteMenuItemAction(current.bottleItem.id);
      }
      if (res.success) {
        toast.success('Drink item updated successfully!');
        setShowEditModal(false);
        setSelectedItem(null);
        loadData();
      } else {
        toast.error(res.error || 'Failed to update drink item');
      }
      return;
    }

    const result = await updateMenuItemAction((selectedItem as any)?.id, data);
    if (result.success) {
      toast.success('Menu item updated successfully!');
      setShowEditModal(false);
      setSelectedItem(null);
      loadData();
    } else {
      console.error('Error updating menu item:', result.error);
      toast.error(result.error || 'Failed to update menu item');
    }
  };

  const handleDeleteItem = async (id: string | number | null) => {
    const item = sectionItems.find((i: any) => i.id === id) || menuItems.find((i: any) => i.id === id);
    setDeleteType('item');
    setDeleteId(id as any);
    setDeleteName(item?.name || 'this menu item');
    setSelectedItem(item || null);
    setShowDeleteModal(true);
  };

  const confirmDeleteItem = async () => {
    const targetItem: any =
      sectionItems.find((i: any) => i.id === deleteId) ||
      selectedItem ||
      menuItems.find((i: any) => i.id === deleteId);

    if (targetItem?.servingMode === 'shot_and_bottle' && targetItem.shotItem?.id && targetItem.bottleItem?.id) {
      const [r1, r2] = await Promise.all([
        deleteMenuItemAction(targetItem.shotItem.id),
        deleteMenuItemAction(targetItem.bottleItem.id),
      ]);
      if (r1.success && r2.success) {
        toast.success('Drink item (Shot & Bottle) deleted successfully!');
        setShowDeleteModal(false);
        setSelectedItem(null);
        loadData();
      } else {
        toast.error(r1.error || r2.error || 'Failed to delete drink item');
      }
      return;
    }

    const result = await deleteMenuItemAction(deleteId as any);
    if (result.success) {
      toast.success('Menu item deleted successfully!');
      setShowDeleteModal(false);
      setSelectedItem(null);
      loadData();
    } else {
      console.error('Error deleting menu item:', result.error);
      toast.error(result.error || 'Failed to delete menu item');
    }
  };

  const handleAddCategory = async (data: any) => {
    const result = await createCategoryAction(data);
    if (result.success) {
      toast.success('Category created successfully!');
      setShowCategoryModal(false);
      loadData();
    } else {
      console.error('Error creating category:', result.error);
      toast.error(result.error || 'Failed to create category');
    }
  };

  const handleEditCategory = async (data: any) => {
    const result = await updateCategoryAction((selectedCategory as any)?.id, data);
    if (result.success) {
      toast.success('Category updated successfully!');
      setShowCategoryModal(false);
      setSelectedCategory(null);
      loadData();
    } else {
      console.error('Error updating category:', result.error);
      toast.error(result.error || 'Failed to update category');
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
    const result = await deleteCategoryAction(deleteId as any);
    if (result.success) {
      toast.success('Category deleted successfully!');
      setShowDeleteModal(false);
      loadData();
    } else {
      console.error('Error deleting category:', result.error);
      toast.error(result.error || 'Failed to delete category');
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
    menuSection, handleSectionChange,
    foodCount: foodItems.length, drinkCount: groupedDrinkItems.length,
    sectionItems, sectionCategories,
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
