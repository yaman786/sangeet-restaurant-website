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

export const deleteTable = async (id: number, permanent = false, transferToTableId?: number) => {
  return apiCallWrapper(async () => {
    const params = new URLSearchParams();
    if (permanent) params.set('permanent', 'true');
    if (transferToTableId) params.set('transfer_to_table_id', String(transferToTableId));
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await api.delete(`/tables/${id}${queryString}`);
  }, 'deleteTable', false);
};

export const fetchTableActiveReservations = async (id: number) => {
  return apiCallWrapper(async () => {
    return await api.get(`/tables/${id}/active-reservations`);
  }, 'fetchTableActiveReservations', false);
};
