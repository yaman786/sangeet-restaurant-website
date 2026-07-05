import api, { apiCallWrapper } from './client';

export const loginUser = async (credentials) => {
  try {
    const result = await apiCallWrapper(async () => {
      const response = await api.post('/auth/login', credentials);
      return response;
    }, 'loginUser', false);
    return result;
  } catch (error) {
    console.error('❌ loginUser failed:', error);
    throw error;
  }
};

export const getProfile = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/auth/profile');
  }, 'getProfile');
};

export const changePassword = async (passwordData) => {
  return apiCallWrapper(async () => {
    return await api.post('/auth/change-password', passwordData);
  }, 'changePassword', false);
};

// User management API calls
export const getAllUsers = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/auth/users');
  }, 'getAllUsers');
};

export const createUser = async (userData) => {
  return apiCallWrapper(async () => {
    return await api.post('/auth/users', userData);
  }, 'createUser', false);
};

export const updateUser = async (id, userData) => {
  return apiCallWrapper(async () => {
    return await api.put(`/auth/users/${encodeURIComponent(id)}`, userData);
  }, 'updateUser', false);
};

export const deleteUser = async (id) => {
  return apiCallWrapper(async () => {
    return await api.delete(`/auth/users/${encodeURIComponent(id)}`);
  }, 'deleteUser', false);
};

export const toggleUserStatus = async (id) => {
  return apiCallWrapper(async () => {
    return await api.patch(`/auth/users/${encodeURIComponent(id)}/toggle-status`);
  }, 'toggleUserStatus', false);
};

export const getUserStats = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/auth/users/stats');
  }, 'getUserStats');
};
