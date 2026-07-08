export {};
import orderService from '../services/orderService';
import pool from '../config/database';

jest.mock('../config/database', () => {
  const mClient = {
    query: jest.fn(),
    release: jest.fn(),
  };
  return {
    connect: jest.fn(() => mClient),
    query: jest.fn(),
  };
});

// Mock socket emissions
jest.mock('../socket', () => ({
  emitNewOrder: jest.fn(),
  emitOrderStatusUpdate: jest.fn(),
  emitNewItemsAdded: jest.fn()
}));

describe('orderService', () => {
  let client: any;

  beforeEach(() => {
    client = pool.connect();
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should execute within a transaction and return the new order', async () => {
      const mockOrderData = {
        table_id: 1,
        customer_name: 'Test Customer',
        items: [{ menu_item_id: 1, quantity: 2 }],
        special_instructions: 'None',
        order_type: 'dine-in' as any
      };

      // 1. pool.query (table check)
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ id: 1, table_number: 5, is_active: true }]
      });

      // 2. client.query ('BEGIN')
      client.query.mockResolvedValueOnce({});
      
      // 3. client.query (existing order check)
      client.query.mockResolvedValueOnce({ rows: [] });
      
      // 4. client.query (menu item price)
      client.query.mockResolvedValueOnce({ rows: [{ price: '10.00' }] });
      
      // 5. client.query (generateOrderNumber existing check)
      client.query.mockResolvedValueOnce({ rows: [] });
      
      // 6. client.query (insert order)
      client.query.mockResolvedValueOnce({ rows: [{ id: 1, order_number: 'ORD12345678' }] });
      
      // 7. client.query (insert order_items)
      client.query.mockResolvedValueOnce({});
      
      // 8. client.query ('COMMIT')
      client.query.mockResolvedValueOnce({});

      // 9. pool.query (getOrderWithItems order)
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{
          id: 1,
          order_number: 'ORD12345678',
          table_id: 1,
          customer_name: 'Test Customer'
        }]
      });

      // 10. pool.query (getOrderWithItems items)
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ menu_item_id: 1, quantity: 2 }]
      });

      const order = await orderService.createOrder(mockOrderData);

      expect(client.query).toHaveBeenCalledWith('BEGIN');
      expect(client.query).toHaveBeenCalledWith('COMMIT');
      expect(client.release).toHaveBeenCalled();
      expect(order.order.id).toBe(1);
    });

    it('should ROLLBACK on error and throw', async () => {
      const mockOrderData = {
        table_id: 1,
        customer_name: 'Test Customer',
        items: [{ menu_item_id: 1, quantity: 2 }]
      };

      // 1. pool.query (table check)
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ id: 1, table_number: 5, is_active: true }]
      });

      // 2. client.query ('BEGIN')
      client.query.mockResolvedValueOnce({});
      
      // 3. client.query (existing order check) -> throws error
      client.query.mockRejectedValueOnce(new Error('DB Error'));

      await expect(orderService.createOrder(mockOrderData)).rejects.toThrow('DB Error');

      expect(client.query).toHaveBeenCalledWith('BEGIN');
      expect(client.query).toHaveBeenCalledWith('ROLLBACK');
      expect(client.release).toHaveBeenCalled();
    });
  });
});
