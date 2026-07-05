import api, { apiCallWrapper } from './client';

// Menu read API calls
export const fetchMenuItems = async (filters = {}) => {
  return apiCallWrapper(async () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    const url = queryString ? `/menu/items?${queryString}` : '/menu/items';
    return await api.get(url);
  }, 'fetchMenuItems');
};

export const fetchMenuCategories = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/menu/categories');
  }, 'fetchMenuCategories');
};

export const fetchPopularMenuItems = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/menu/popular');
  }, 'fetchPopularMenuItems');
};

export const fetchMenuItemsByCategory = async (category) => {
  return apiCallWrapper(async () => {
    return await api.get(`/menu/category/${encodeURIComponent(category)}`);
  }, 'fetchMenuItemsByCategory');
};

export const fetchMenuItemById = async (id) => {
  return apiCallWrapper(async () => {
    return await api.get(`/menu/items/${encodeURIComponent(id)}`);
  }, 'fetchMenuItemById');
};

// Menu management (admin) API calls
export const createMenuItem = async (menuData) => {
  return apiCallWrapper(async () => {
    return await api.post('/menu/items', menuData);
  }, 'createMenuItem', false);
};

export const updateMenuItem = async (id, menuData) => {
  return apiCallWrapper(async () => {
    return await api.put(`/menu/items/${encodeURIComponent(id)}`, menuData);
  }, 'updateMenuItem', false);
};

export const deleteMenuItem = async (id) => {
  return apiCallWrapper(async () => {
    return await api.delete(`/menu/items/${encodeURIComponent(id)}`);
  }, 'deleteMenuItem', false);
};

export const createCategory = async (categoryData) => {
  return apiCallWrapper(async () => {
    return await api.post('/menu/categories', categoryData);
  }, 'createCategory', false);
};

export const updateCategory = async (id, categoryData) => {
  return apiCallWrapper(async () => {
    return await api.put(`/menu/categories/${encodeURIComponent(id)}`, categoryData);
  }, 'updateCategory', false);
};

export const deleteCategory = async (id) => {
  return apiCallWrapper(async () => {
    return await api.delete(`/menu/categories/${encodeURIComponent(id)}`);
  }, 'deleteCategory', false);
};

export const getMenuStats = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/menu/stats');
  }, 'getMenuStats');
};
