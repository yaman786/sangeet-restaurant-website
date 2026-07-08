import api, { apiCallWrapper, serverFetch } from './client';
import { MenuItemRow, CategoryRow } from '../../types';

// Menu read API calls
export const fetchMenuItems = async (filters: Record<string, string | number | boolean> = {}): Promise<MenuItemRow[]> => {
  return apiCallWrapper(async () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    const url = queryString ? `/menu/items?${queryString}` : '/menu/items';
    return await api.get(url);
  }, 'fetchMenuItems');
};

export const fetchMenuCategories = async (): Promise<CategoryRow[]> => {
  return apiCallWrapper(async () => {
    return await api.get('/menu/categories');
  }, 'fetchMenuCategories');
};

export const fetchPopularMenuItems = async (): Promise<MenuItemRow[]> => {
  return apiCallWrapper(async () => {
    return await api.get('/menu/popular');
  }, 'fetchPopularMenuItems');
};

export const fetchMenuItemsByCategory = async (category: string): Promise<MenuItemRow[]> => {
  return apiCallWrapper(async () => {
    return await api.get(`/menu/category/${encodeURIComponent(category)}`);
  }, 'fetchMenuItemsByCategory');
};

export const fetchMenuItemById = async (id: string | number): Promise<MenuItemRow> => {
  return apiCallWrapper(async () => {
    return await api.get(`/menu/items/${encodeURIComponent(id)}`);
  }, 'fetchMenuItemById');
};

// Menu management (admin) API calls
export const createMenuItem = async (menuData: Partial<MenuItemRow>) => {
  return apiCallWrapper(async () => {
    return await api.post('/menu/items', menuData);
  }, 'createMenuItem', false);
};

export const updateMenuItem = async (id: string | number, menuData: Partial<MenuItemRow>) => {
  return apiCallWrapper(async () => {
    return await api.put(`/menu/items/${encodeURIComponent(id)}`, menuData);
  }, 'updateMenuItem', false);
};

export const deleteMenuItem = async (id: string | number) => {
  return apiCallWrapper(async () => {
    return await api.delete(`/menu/items/${encodeURIComponent(id)}`);
  }, 'deleteMenuItem', false);
};

export const createCategory = async (categoryData: Partial<CategoryRow>) => {
  return apiCallWrapper(async () => {
    return await api.post('/menu/categories', categoryData);
  }, 'createCategory', false);
};

export const updateCategory = async (id: string | number, categoryData: Partial<CategoryRow>) => {
  return apiCallWrapper(async () => {
    return await api.put(`/menu/categories/${encodeURIComponent(id)}`, categoryData);
  }, 'updateCategory', false);
};

export const deleteCategory = async (id: string | number) => {
  return apiCallWrapper(async () => {
    return await api.delete(`/menu/categories/${encodeURIComponent(id)}`);
  }, 'deleteCategory', false);
};

export const getMenuStats = async (): Promise<{ totalItems: number, categories: number, popular: number }> => {
  return apiCallWrapper(async () => {
    return await api.get('/menu/stats');
  }, 'getMenuStats');
};

// SERVER COMPONENT FETCHERS
export const serverFetchMenuItems = async (filters: Record<string, string | number | boolean> = {}): Promise<MenuItemRow[]> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  const queryString = params.toString();
  const url = queryString ? `/menu/items?${queryString}` : '/menu/items';
  return serverFetch<MenuItemRow[]>(url, { next: { revalidate: 3600 } });
};

export const serverFetchMenuCategories = async (): Promise<CategoryRow[]> => {
  return serverFetch<CategoryRow[]>('/menu/categories', { next: { revalidate: 3600 } });
};
