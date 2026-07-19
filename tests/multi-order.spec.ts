import { test, expect } from '@playwright/test';

test.describe('Strict QA: Multiple Orders Flow', () => {
  let tableNumber: string;
  let orderId1: number;

  test('Should place 1st order successfully', async ({ request }) => {
    // 1. Get the actual table ID for the API
    const tablesResponse = await request.get('http://localhost:3000/api/tables');
    const tables = await tablesResponse.json();
    expect(tables.length).toBeGreaterThan(0);
    const table = tables[0];
    tableNumber = table.table_number;
    
    // 2. Place 1st order
    const orderData = {
      table_id: table.id,
      customer_name: 'QA Tester',
      order_type: 'dine-in',
      items: [
        { menu_item_id: 1, quantity: 2, special_requests: 'No spicy' }
      ]
    };

    const response = await request.post('http://localhost:3000/api/orders', {
      data: orderData
    });
    
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.order).toBeDefined();
    
    orderId1 = body.order.id;
  });

  test('Should place 2nd order successfully', async ({ request }) => {
    // 1. Get the actual table ID
    const tablesResponse = await request.get('http://localhost:3000/api/tables');
    const tables = await tablesResponse.json();
    const table = tables[0];
    
    // 2. Place 2nd order
    const orderData = {
      table_id: table.id,
      customer_name: 'QA Tester',
      order_type: 'dine-in',
      items: [
        { menu_item_id: 2, quantity: 1, special_requests: 'Extra ice' }
      ]
    };

    const response = await request.post('http://localhost:3000/api/orders', {
      data: orderData
    });
    
    expect(response.status()).toBe(201);
    const body = await response.json();
    
    expect(body.order).toBeDefined();
    expect(body.merged).toBe(false); // Must be a separate ticket
  });
});
