import api, { apiCallWrapper } from './client';
import { UserInfo, UserRow, UserStats, PaginatedResult } from '@/lib/types';
import type { AdminModuleMeta, RoleDefinition, RoleTier } from '@/lib/rbac';

export const loginUser = async (credentials: Record<string, any>) => {
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
export const getAllUsers = async (
  params: { page?: number; limit?: number; role?: string; status?: string; search?: string } = {}
): Promise<PaginatedResult<UserInfo>> => {
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

export const deleteUser = async (id: string | number, permanent = false) => {
  return apiCallWrapper(async () => {
    return await api.delete(`/auth/users/${encodeURIComponent(id)}`, {
      params: permanent ? { permanent: 'true' } : undefined
    });
  }, 'deleteUser', false);
};

export const restoreUser = async (id: string | number): Promise<{ message: string; user: UserInfo }> => {
  return apiCallWrapper(async () => {
    return await api.post(`/auth/users/${encodeURIComponent(id)}/restore`);
  }, 'restoreUser', false);
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

export const requestForgotPassword = async (identifier: string): Promise<{ message: string; isSuperAdmin?: boolean }> => {
  return apiCallWrapper(async () => {
    return await api.post('/auth/forgot-password', { identifier });
  }, 'requestForgotPassword', false);
};

export const resetSuperAdminPassword = async (data: {
  method: 'otp' | 'recovery_key';
  code: string;
  newPassword: string;
}): Promise<{ message: string }> => {
  return apiCallWrapper(async () => {
    return await api.post('/auth/forgot-password', {
      action: 'reset_super_admin',
      ...data
    });
  }, 'resetSuperAdminPassword', false);
};

// RBAC Role & Permission Management API calls
export interface RolesCatalogResponse {
  roles: Record<string, RoleDefinition>;
  modules: AdminModuleMeta[];
}

export const getRolesCatalog = async (): Promise<RolesCatalogResponse> => {
  return apiCallWrapper(async () => {
    return await api.get('/auth/roles');
  }, 'getRolesCatalog');
};

export const upsertRole = async (data: {
  key?: string;
  label: string;
  icon?: string;
  description?: string;
  tier?: RoleTier;
  badgeColor?: string;
  permissions: string[];
}): Promise<{ role: RoleDefinition; roles: Record<string, RoleDefinition> }> => {
  return apiCallWrapper(async () => {
    return await api.post('/auth/roles', data);
  }, 'upsertRole', false);
};

export const updateRolePermissions = async (
  roleKey: string,
  permissions: string[]
): Promise<{ role: RoleDefinition; roles: Record<string, RoleDefinition> }> => {
  return apiCallWrapper(async () => {
    return await api.patch('/auth/roles', { roleKey, permissions });
  }, 'updateRolePermissions', false);
};

export const resetRolePermissions = async (): Promise<{
  message: string;
  roles: Record<string, RoleDefinition>;
}> => {
  return apiCallWrapper(async () => {
    return await api.patch('/auth/roles', { action: 'reset_defaults' });
  }, 'resetRolePermissions', false);
};

export const deleteCustomRole = async (
  roleKey: string
): Promise<{ message: string; roles: Record<string, RoleDefinition> }> => {
  return apiCallWrapper(async () => {
    return await api.delete('/auth/roles', { params: { key: roleKey } });
  }, 'deleteCustomRole', false);
};
