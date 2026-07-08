import api, { apiCallWrapper } from './client';
import { OrderRow, CreateOrderInput, TableRow } from '../../types';

export const createOrder = async (orderData: CreateOrderInput) => {
  return apiCallWrapper(async () => {
    return await api.post('/orders', orderData);
  }, 'createOrder', false);
};

export const fetchAllOrders = async (filters: any = {}): Promise<OrderRow[]> => {
  return apiCallWrapper(async () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    const url = queryString ? `/orders?${queryString}` : '/orders';
    return await api.get(url);
  }, 'fetchAllOrders');
};

export const fetchOrderById = async (orderId: string | number): Promise<OrderRow> => {
  return apiCallWrapper(async () => {
    return await api.get(`/orders/${encodeURIComponent(orderId)}`);
  }, 'fetchOrderById');
};

export const getOrderById = async (orderId: string | number, tableNumber: string | null = null): Promise<OrderRow> => {
  return apiCallWrapper(async () => {
    const params = new URLSearchParams();
    if (tableNumber) {
      params.append('tableNumber', tableNumber);
    }
    const queryString = params.toString();
    const url = queryString ? `/orders/${orderId}?${queryString}` : `/orders/${orderId}`;
    return await api.get(url);
  }, 'getOrderById');
};

export const getOrdersByTable = async (tableNumber: string | number): Promise<OrderRow[]> => {
  return apiCallWrapper(async () => {
    return await api.get(`/orders/table-number/${tableNumber}`);
  }, 'getOrdersByTable');
};

export const fetchOrdersByTable = async (tableId: string | number): Promise<OrderRow[]> => {
  return apiCallWrapper(async () => {
    return await api.get(`/orders/table/${encodeURIComponent(tableId)}`);
  }, 'fetchOrdersByTable');
};

export const updateOrderStatus = async (orderId: string | number, status: string) => {
  return apiCallWrapper(async () => {
    return await api.patch(`/orders/${encodeURIComponent(orderId)}/status`, { status });
  }, 'updateOrderStatus', false);
};

export const deleteOrder = async (orderId: string | number) => {
  return apiCallWrapper(async () => {
    return await api.delete(`/orders/${encodeURIComponent(orderId)}`);
  }, 'deleteOrder', false);
};

export const bulkUpdateOrderStatus = async (orderIds: (string | number)[], status: string) => {
  return apiCallWrapper(async () => {
    return await api.patch('/orders/bulk-status', { orderIds, status });
  }, 'bulkUpdateOrderStatus', false);
};

export const searchOrders = async (searchParams: any = {}): Promise<OrderRow[]> => {
  return apiCallWrapper(async () => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    const url = queryString ? `/orders/search?${queryString}` : '/orders/search';
    return await api.get(url);
  }, 'searchOrders');
};

export const fetchOrderStats = async (): Promise<any> => {
  return apiCallWrapper(async () => {
    return await api.get('/orders/stats');
  }, 'fetchOrderStats');
};

export const fetchTables = async (): Promise<TableRow[]> => {
  return apiCallWrapper(async () => {
    return await api.get('/tables');
  }, 'fetchTables');
};

export const getTableByQRCode = async (qrCode: string): Promise<TableRow> => {
  return apiCallWrapper(async () => {
    return await api.get(`/tables/qr/${encodeURIComponent(qrCode)}`);
  }, 'getTableByQRCode');
};

export const getTableByNumber = async (tableNumber: string | number): Promise<TableRow> => {
  return apiCallWrapper(async () => {
    const allTables = await api.get<any, TableRow[]>('/tables');
    const table = allTables.find(t => t.table_number === String(tableNumber));
    if (!table) {
      throw new Error('Table not found');
    }
    return table;
  }, 'getTableByNumber');
};
