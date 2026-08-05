import api, { apiCallWrapper } from './client';

export const createTable = async (data: { table_number: string; capacity: number; table_type: string }) => {
  return apiCallWrapper(async () => {
    return await api.post('/tables', data);
  }, 'createTable', false);
};

export const updateTable = async (id: number, data: { capacity?: number; table_type?: string; table_name?: string }) => {
  return apiCallWrapper(async () => {
    return await api.put(`/tables/${id}`, data);
  }, 'updateTable', false);
};

export const deleteTable = async (id: number, permanent = false) => {
  return apiCallWrapper(async () => {
    return await api.delete(`/tables/${id}${permanent ? '?permanent=true' : ''}`);
  }, 'deleteTable', false);
};
