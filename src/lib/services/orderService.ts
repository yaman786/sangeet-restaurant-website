import pool from '@/lib/db';
import { NotFoundError, ValidationError } from '@/lib/errors';
// Socket functionality disabled in serverless mode
import { generateQRCode } from '../utils/qrGenerator';
import type { OrderRow, OrderItemRow, CreateOrderInput } from '@/lib/types';
import { emitNewOrder, emitNewItemsAdded, emitOrderStatusUpdate } from './pusherServer';

class OrderService {
  async getAllTables() {
    const result = await pool.query('SELECT * FROM tables WHERE is_active = true ORDER BY table_number ASC');
    return result.rows;
  }

  async getTableByQRCode(qrCode: string) {
    const result = await pool.query('SELECT * FROM tables WHERE qr_code = $1 AND is_active = true', [qrCode]);
    if (result.rows.length === 0) throw new NotFoundError('Table not found or inactive');
    return result.rows[0];
  }

  async createOrder(data: CreateOrderInput) {
    const { table_id, customer_name, items, special_instructions, order_type = 'dine-in' } = data;
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const tableCheck = await pool.query('SELECT * FROM tables WHERE id = $1 AND is_active = true', [table_id]);
      if (tableCheck.rows.length === 0) throw new ValidationError('Invalid or inactive table selected');
      
      const tableNumber = tableCheck.rows[0].table_number;
      
      // Fetch prices and names for all items upfront to avoid N+1 queries in loops
      const menuItemIds = items.map(i => i.menu_item_id);
      const menuItemsCheck = await client.query(
        'SELECT id, price, name FROM menu_items WHERE id = ANY($1) AND is_active = true',
        [menuItemIds]
      );
      
      const menuItemMap = new Map<number, { price: number; name: string }>();
      for (const row of menuItemsCheck.rows) {
        menuItemMap.set(row.id, {
          price: parseFloat(row.price),
          name: row.name
        });
      }

      // Check if all requested items exist
      for (const item of items) {
        if (!menuItemMap.has(item.menu_item_id)) {
          throw new ValidationError(`Menu item ${item.menu_item_id} not found or inactive`);
        }
      }
      
      const existingOrderResult = await client.query(
        "SELECT * FROM orders WHERE table_id = $1 AND status IN ('pending', 'confirmed', 'preparing', 'ready', 'served') AND is_archived = false ORDER BY created_at DESC LIMIT 1",
        [table_id]
      );
      
      let orderId: number;
      let isNewOrder = false;
      
      if (existingOrderResult.rows.length > 0) {
        orderId = existingOrderResult.rows[0].id;
        
        let totalAmount = parseFloat(existingOrderResult.rows[0].total_amount);
        const newOrderItems = [];
        
        for (const item of items) {
          const itemData = menuItemMap.get(item.menu_item_id)!;
          const itemTotal = itemData.price * item.quantity;
          totalAmount += itemTotal;
          
          await client.query(
            'INSERT INTO order_items (order_id, menu_item_id, quantity, special_requests, unit_price, total_price) VALUES ($1, $2, $3, $4, $5, $6)',
            [orderId, item.menu_item_id, item.quantity, item.special_requests || null, itemData.price, itemTotal]
          );
          
          newOrderItems.push({
            menu_item_id: item.menu_item_id,
            name: itemData.name,
            quantity: item.quantity,
            special_requests: item.special_requests || null,
            price: itemData.price
          });
        }
        
        await client.query('UPDATE orders SET total_amount = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [totalAmount, orderId]);
        
        emitNewItemsAdded({ type: 'new-items-added', orderId, newItems: newOrderItems, tableNumber, timestamp: new Date().toISOString() });
      } else {
        isNewOrder = true;
        let totalAmount = 0;
        
        for (const item of items) {
          const itemData = menuItemMap.get(item.menu_item_id)!;
          totalAmount += itemData.price * item.quantity;
        }
        
        const dateStr = new Date().toISOString().replace(/[-:T]/g, '').substring(0, 8);
        let orderNumber = '';
        let isUnique = false;
        
        while (!isUnique) {
          const randomNum = Math.floor(1000 + Math.random() * 9000);
          orderNumber = `ORD${dateStr}${randomNum}`;
          const checkResult = await client.query('SELECT id FROM orders WHERE order_number = $1', [orderNumber]);
          if (checkResult.rows.length === 0) isUnique = true;
        }
        
        const orderResult = await client.query(
          'INSERT INTO orders (order_number, table_id, customer_name, status, special_instructions, total_amount, order_type) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
          [orderNumber, table_id, customer_name, 'pending', special_instructions || null, totalAmount, order_type]
        );
        
        orderId = orderResult.rows[0].id;
        
        for (const item of items) {
          const itemData = menuItemMap.get(item.menu_item_id)!;
          await client.query(
            'INSERT INTO order_items (order_id, menu_item_id, quantity, special_requests, unit_price, total_price) VALUES ($1, $2, $3, $4, $5, $6)',
            [orderId, item.menu_item_id, item.quantity, item.special_requests || null, itemData.price, itemData.price * item.quantity]
          );
        }
      }
      
      await client.query('COMMIT');
      
      const fullOrder = await this.getOrderWithItems(orderId);
      
      if (isNewOrder) {
        emitNewOrder({ type: 'new-order', orderId, tableNumber, timestamp: new Date().toISOString() });
      }
      
      return { order: fullOrder, merged: !isNewOrder };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async addItemsToOrders(orders: any[]) {
    if (orders.length === 0) return [];
    const orderIds = orders.map(o => o.id);
    
    const itemsResult = await pool.query(
      `SELECT oi.*, m.name, m.image_url, m.category 
       FROM order_items oi 
       JOIN menu_items m ON oi.menu_item_id = m.id 
       WHERE oi.order_id = ANY($1)`,
      [orderIds]
    );
    
    const itemsByOrderId = new Map<number, any[]>();
    for (const item of itemsResult.rows) {
      const list = itemsByOrderId.get(item.order_id) || [];
      list.push(item);
      itemsByOrderId.set(item.order_id, list);
    }
    
    return orders.map(order => ({
      ...order,
      items: itemsByOrderId.get(order.id) || []
    }));
  }

  private async getOrderWithItems(orderId: number) {
    const orderResult = await pool.query(
      `SELECT o.*, t.table_number 
       FROM orders o 
       JOIN tables t ON o.table_id = t.id 
       WHERE o.id = $1`,
      [orderId]
    );
    
    if (orderResult.rows.length === 0) throw new NotFoundError('Order');
    
    const itemsResult = await pool.query(
      `SELECT oi.*, m.name, m.image_url, m.category 
       FROM order_items oi 
       JOIN menu_items m ON oi.menu_item_id = m.id 
       WHERE oi.order_id = $1`,
      [orderId]
    );
    
    return { ...orderResult.rows[0], items: itemsResult.rows };
  }

  async getOrderById(id: string, tableNumber?: string) {
    const order = await this.getOrderWithItems(parseInt(id, 10));
    if (tableNumber && order.table_number !== tableNumber) {
      throw new ValidationError('Table number does not match this order');
    }
    return order;
  }

  async getOrdersByTable(tableId: string) {
    const result = await pool.query(
      `SELECT o.*, t.table_number 
       FROM orders o 
       JOIN tables t ON o.table_id = t.id 
       WHERE o.table_id = $1 
         AND o.is_archived = false 
         AND o.status != 'completed' 
         AND o.status != 'cancelled' 
       ORDER BY o.created_at DESC`,
      [tableId]
    );
    return this.addItemsToOrders(result.rows);
  }

  async getOrdersByTableNumber(tableNumber: string) {
    const tableResult = await pool.query('SELECT id FROM tables WHERE table_number = $1 AND is_active = true', [tableNumber]);
    if (tableResult.rows.length === 0) throw new NotFoundError('Table');
    return this.getOrdersByTable(tableResult.rows[0].id.toString());
  }

  async updateOrderStatus(id: string, status: string) {
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) throw new ValidationError('Invalid status');
    
    const orderResult = await pool.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    if (orderResult.rows.length === 0) throw new NotFoundError('Order');
    
    const order = await this.getOrderWithItems(parseInt(id, 10));
    emitOrderStatusUpdate({ type: 'status-update', orderId: parseInt(id, 10), status, tableNumber: order.table_number, estimatedTime: order.estimated_time, timestamp: new Date().toISOString() });
    
    return order;
  }

  async getAllOrders(query: Record<string, any>) {
    let sql = `
      SELECT o.*, t.table_number 
      FROM orders o 
      JOIN tables t ON o.table_id = t.id 
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIdx = 1;

    if (query.status) { sql += ` AND o.status = $${paramIdx++}`; params.push(query.status); }
    if (query.archived === 'true') { sql += ` AND o.is_archived = true`; }
    else if (query.archived === 'false') { sql += ` AND o.is_archived = false`; }

    sql += ` ORDER BY o.created_at DESC`;
    
    if (query.limit) { sql += ` LIMIT $${paramIdx++}`; params.push(parseInt(query.limit as string, 10)); }

    const result = await pool.query(sql, params);
    
    return this.addItemsToOrders(result.rows);
  }

  async getOrderStats() {
    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status IN ('confirmed', 'preparing') THEN 1 END) as active_orders,
        COUNT(CASE WHEN status = 'completed' AND DATE(created_at) = CURRENT_DATE THEN 1 END) as completed_today,
        SUM(CASE WHEN status = 'completed' AND DATE(created_at) = CURRENT_DATE THEN total_amount ELSE 0 END) as revenue_today
      FROM orders
    `);
    return statsResult.rows[0];
  }

  async generateTableQRCode(tableNumber: string) {
    const tableResult = await pool.query('SELECT * FROM tables WHERE table_number = $1', [tableNumber]);
    if (tableResult.rows.length === 0) throw new NotFoundError(`Table ${tableNumber}`);
    
    const qrData = await generateQRCode(tableNumber, process.env.FRONTEND_URL || 'http://localhost:3000');
    
    const result = await pool.query(
      `INSERT INTO table_qr_codes (table_id, table_number, qr_url, qr_code_data) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [tableResult.rows[0].id, tableNumber, qrData.qrUrl, qrData.qrCodeDataURL]
    );
    
    await pool.query('UPDATE tables SET qr_code_url = $1 WHERE id = $2', [qrData.qrUrl, tableResult.rows[0].id]);
    
    return { table: tableResult.rows[0], qrCode: result.rows[0] };
  }

  async generateAllTableQRCodes() {
    const tablesResult = await pool.query('SELECT * FROM tables WHERE is_active = true');
    const generated = [];
    
    for (const table of tablesResult.rows) {
      try {
        const result = await this.generateTableQRCode(table.table_number);
        generated.push(result);
      } catch (error) {
        console.error(`Error generating QR for table ${table.table_number}:`, error);
      }
    }
    
    return generated;
  }

  async deleteOrder(id: string) {
    const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderResult.rows.length === 0) throw new NotFoundError('Order');
    
    const order = orderResult.rows[0];
    const tableResult = await pool.query('SELECT table_number FROM tables WHERE id = $1', [order.table_id]);
    const tableNumber = tableResult.rows.length > 0 ? tableResult.rows[0].table_number : null;
    
    await pool.query('DELETE FROM order_items WHERE order_id = $1', [id]);
    await pool.query('DELETE FROM orders WHERE id = $1', [id]);
    
    return { order, tableNumber };
  }

  async bulkUpdateOrderStatus(orderIds: number[], status: string) {
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) throw new ValidationError('Invalid status');
    if (!Array.isArray(orderIds) || orderIds.length === 0) throw new ValidationError('No order IDs provided');
    
    const client = await pool.connect();
    const updatedOrders = [];
    
    try {
      await client.query('BEGIN');
      
      for (const id of orderIds) {
        const orderResult = await client.query(
          'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
          [status, id]
        );
        
        if (orderResult.rows.length > 0) {
          const order = await this.getOrderWithItems(id);
          updatedOrders.push(order);
          emitOrderStatusUpdate({ type: 'status-update', orderId: id, status, tableNumber: order.table_number, estimatedTime: order.estimated_time, timestamp: new Date().toISOString() });
        }
      }
      
      await client.query('COMMIT');
      return updatedOrders;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async searchOrders(query: Record<string, any>) {
    const { term, status, startDate, endDate, tableId } = query;
    let sql = `
      SELECT o.*, t.table_number 
      FROM orders o 
      JOIN tables t ON o.table_id = t.id 
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIdx = 1;

    if (term) {
      sql += ` AND (o.order_number ILIKE $${paramIdx} OR o.customer_name ILIKE $${paramIdx})`;
      params.push(`%${term}%`);
      paramIdx++;
    }
    
    if (status) { sql += ` AND o.status = $${paramIdx++}`; params.push(status); }
    if (tableId) { sql += ` AND o.table_id = $${paramIdx++}`; params.push(tableId); }
    if (startDate) { sql += ` AND o.created_at >= $${paramIdx++}`; params.push(startDate); }
    if (endDate) { sql += ` AND o.created_at <= $${paramIdx++}`; params.push(endDate); }

    sql += ` ORDER BY o.created_at DESC LIMIT 50`;
    
    const result = await pool.query(sql, params);
    return this.addItemsToOrders(result.rows);
  }
}

export default new OrderService();
