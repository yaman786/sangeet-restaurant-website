import api, { apiCallWrapper } from './client';

export const createOrder = async (orderData) => {
  return apiCallWrapper(async () => {
    return await api.post('/orders', orderData);
  }, 'createOrder', false);
};

export const fetchAllOrders = async (filters = {}) => {
  return apiCallWrapper(async () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    const url = queryString ? `/orders?${queryString}` : '/orders';
    return await api.get(url);
  }, 'fetchAllOrders');
};

export const fetchOrderById = async (orderId) => {
  return apiCallWrapper(async () => {
    return await api.get(`/orders/${encodeURIComponent(orderId)}`);
  }, 'fetchOrderById');
};

export const getOrderById = async (orderId, tableNumber = null) => {
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

export const getOrdersByTable = async (tableNumber) => {
  return apiCallWrapper(async () => {
    return await api.get(`/orders/table-number/${tableNumber}`);
  }, 'getOrdersByTable');
};

export const fetchOrdersByTable = async (tableId) => {
  return apiCallWrapper(async () => {
    return await api.get(`/orders/table/${encodeURIComponent(tableId)}`);
  }, 'fetchOrdersByTable');
};

export const updateOrderStatus = async (orderId, status) => {
  return apiCallWrapper(async () => {
    return await api.patch(`/orders/${encodeURIComponent(orderId)}/status`, { status });
  }, 'updateOrderStatus', false);
};

export const deleteOrder = async (orderId) => {
  return apiCallWrapper(async () => {
    return await api.delete(`/orders/${encodeURIComponent(orderId)}`);
  }, 'deleteOrder', false);
};

export const bulkUpdateOrderStatus = async (orderIds, status) => {
  return apiCallWrapper(async () => {
    return await api.patch('/orders/bulk-status', { orderIds, status });
  }, 'bulkUpdateOrderStatus', false);
};

export const searchOrders = async (searchParams = {}) => {
  return apiCallWrapper(async () => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    const url = queryString ? `/orders/search?${queryString}` : '/orders/search';
    return await api.get(url);
  }, 'searchOrders');
};

export const fetchOrderStats = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/orders/stats');
  }, 'fetchOrderStats');
};

export const fetchTables = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/tables');
  }, 'fetchTables');
};

export const getTableByQRCode = async (qrCode) => {
  return apiCallWrapper(async () => {
    return await api.get(`/tables/qr/${encodeURIComponent(qrCode)}`);
  }, 'getTableByQRCode');
};

export const getTableByNumber = async (tableNumber) => {
  return apiCallWrapper(async () => {
    const allTables = await api.get('/tables');
    const table = allTables.find(t => t.table_number === tableNumber);
    if (!table) {
      throw new Error('Table not found');
    }
    return table;
  }, 'getTableByNumber');
};
