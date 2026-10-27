import api, { apiCallWrapper } from './client';
import { UserInfo, UserRow, UserStats, PaginatedResult } from '@/lib/types';

export const loginUser = async (credentials: Record<string, string>) => {
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

export const getProfile = async (): Promise<UserInfo> => {
  return apiCallWrapper(async () => {
    return await api.get('/auth/profile');
  }, 'getProfile');
};

export const changePassword = async (passwordData: Record<string, string>) => {
  return apiCallWrapper(async () => {
    return await api.post('/auth/change-password', passwordData);
  }, 'changePassword', false);
};

// User management API calls
export const getAllUsers = async (params: { page?: number; limit?: number } = {}): Promise<PaginatedResult<UserInfo>> => {
  return apiCallWrapper(async () => {
    return await api.get('/auth/users', { params });
  }, 'getAllUsers');
};

export const createUser = async (userData: Partial<UserRow>) => {
  return apiCallWrapper(async () => {
    return await api.post('/auth/users', userData);
  }, 'createUser', false);
};

export const updateUser = async (id: string | number, userData: Partial<UserRow>) => {
  return apiCallWrapper(async () => {
    return await api.put(`/auth/users/${encodeURIComponent(id)}`, userData);
  }, 'updateUser', false);
};

export const deleteUser = async (id: string | number) => {
  return apiCallWrapper(async () => {
    return await api.delete(`/auth/users/${encodeURIComponent(id)}`);
  }, 'deleteUser', false);
};

export interface ToggleUserStatusResult {
  status: 'enabled' | 'disabled';
  user: Pick<UserInfo, 'id' | 'username' | 'email' | 'role' | 'is_active'>;
}

export const toggleUserStatus = async (id: string | number): Promise<ToggleUserStatusResult> => {
  return apiCallWrapper(async () => {
    return await api.patch<unknown, ToggleUserStatusResult>(`/auth/users/${encodeURIComponent(id)}/toggle-status`);
  }, 'toggleUserStatus', false);
};

export const getUserStats = async (): Promise<UserStats> => {
  return apiCallWrapper(async () => {
    return await api.get('/auth/users/stats');
  }, 'getUserStats');
};

export const requestForgotPassword = async (identifier: string): Promise<{ message: string }> => {
  return apiCallWrapper(async () => {
    return await api.post('/auth/forgot-password', { identifier });
  }, 'requestForgotPassword', false);
};
