const pool = require('../config/database');
const { generateQRCode, generateAllQRCodes } = require('../utils/qrGenerator');
const { NotFoundError, ValidationError, ForbiddenError } = require('../utils/errors');
const logger = require('../utils/logger');
const config = require('../config/env');
const {
  emitNewOrder,
  emitOrderStatusUpdate,
  emitNewItemsAdded,
  emitOrderCompleted,
  emitOrderCancelled,
  emitOrderDeleted
} = require('../socket');

class OrderService {
  async generateOrderNumber() {
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      const timestamp = Date.now().toString().slice(-8);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const orderNumber = `ORD${timestamp}${random}`;
      
      const existingOrder = await pool.query(
        'SELECT id FROM orders WHERE order_number = $1',
        [orderNumber]
      );
      
      if (existingOrder.rows.length === 0) {
        return orderNumber;
      }
      
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1));
    }
    
    throw new Error('Unable to generate unique order number after multiple attempts');
  }

  async getAllTables() {
    const result = await pool.query('SELECT * FROM tables WHERE is_active = true ORDER BY table_number');
    return result.rows;
  }

  async getTableByQRCode(qrCode) {
    const result = await pool.query(
      'SELECT * FROM tables WHERE qr_code_url LIKE $1 AND is_active = true',
      [`%${qrCode}%`]
    );
    if (result.rows.length === 0) throw new NotFoundError('Table');
    return result.rows[0];
  }

  async findActiveOrder(tableId, customerName) {
    const result = await pool.query(`
      SELECT o.*, t.table_number 
      FROM orders o 
      JOIN tables t ON o.table_id = t.id 
      WHERE o.table_id = $1 
        AND o.customer_name = $2 
        AND o.status NOT IN ('completed', 'cancelled')
      ORDER BY o.created_at DESC 
      LIMIT 1
    `, [tableId, customerName]);
    return result.rows[0] || null;
  }

  async addItemsToExistingOrder(orderId, items) {
    try {
      for (const item of items) {
        const menuItemResult = await pool.query(
          'SELECT price FROM menu_items WHERE id = $1',
          [item.menu_item_id]
        );
        
        if (menuItemResult.rows.length === 0) {
          throw new ValidationError(`Menu item ${item.menu_item_id} not found`);
        }
        
        const unitPrice = parseFloat(menuItemResult.rows[0].price);
        const totalPrice = unitPrice * item.quantity;

        await pool.query(
          `INSERT INTO order_items 
           (order_id, menu_item_id, quantity, unit_price, total_price, special_requests)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [orderId, item.menu_item_id, item.quantity, unitPrice, totalPrice, item.special_requests || '']
        );
      }

      await pool.query(`
        UPDATE orders 
        SET total_amount = (
          SELECT SUM(total_price) 
          FROM order_items 
          WHERE order_id = $1
        ),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [orderId]);
      return true;
    } catch (error) {
      logger.error('Error adding items to existing order:', error);
      return false;
    }
  }

  async getOrderWithItems(orderId) {
    const orderResult = await pool.query(
      `SELECT o.*, t.table_number 
       FROM orders o 
       JOIN tables t ON o.table_id = t.id 
       WHERE o.id = $1`,
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      throw new NotFoundError('Order');
    }

    let itemsResult;
    try {
      itemsResult = await pool.query(
        `SELECT oi.*, mi.name, mi.description, mi.image_url, mi.price
         FROM order_items oi 
         JOIN menu_items mi ON oi.menu_item_id = mi.id 
         WHERE oi.order_id = $1`,
        [orderId]
      );
    } catch (itemError) {
      logger.warn('Fallback to basic item query:', itemError.message);
      itemsResult = await pool.query(
        `SELECT oi.*, mi.name, mi.price
         FROM order_items oi 
         JOIN menu_items mi ON oi.menu_item_id = mi.id 
         WHERE oi.order_id = $1`,
        [orderId]
      );
    }

    return {
      ...orderResult.rows[0],
      items: itemsResult.rows
    };
  }

  async createOrder(data) {
    const { table_id, customer_name, items, special_instructions } = data;

    if (!table_id || !customer_name || !items) {
      throw new ValidationError('Missing required fields: table_id, customer_name, and items are required');
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw new ValidationError('Items must be a non-empty array');
    }

    const tableResult = await pool.query('SELECT * FROM tables WHERE id = $1 AND is_active = true', [table_id]);
    if (tableResult.rows.length === 0) {
      throw new NotFoundError('Table');
    }

    const existingOrder = await this.findActiveOrder(table_id, customer_name);
    
    if (existingOrder) {
      const success = await this.addItemsToExistingOrder(existingOrder.id, items);
      if (success) {
        const updatedOrder = await this.getOrderWithItems(existingOrder.id);
        emitOrderStatusUpdate(existingOrder.id, existingOrder.status, updatedOrder.table_number);
        emitNewItemsAdded(existingOrder.id, items, updatedOrder.table_number);
        
        return {
          order: updatedOrder,
          merged: true,
          orderId: existingOrder.id,
          mergeInfo: {
            originalOrderId: existingOrder.id,
            originalOrderNumber: existingOrder.order_number,
            itemsAdded: items.length,
            newTotal: updatedOrder.total_amount
          }
        };
      } else {
        throw new Error('Failed to add items to existing order');
      }
    }

    let totalAmount = 0;
    for (const item of items) {
      if (!item.menu_item_id || !item.quantity || item.quantity <= 0) {
        throw new ValidationError('Each item must have menu_item_id and quantity > 0');
      }
      const menuItemResult = await pool.query('SELECT price FROM menu_items WHERE id = $1', [item.menu_item_id]);
      if (menuItemResult.rows.length === 0) {
        throw new NotFoundError(`Menu item ${item.menu_item_id}`);
      }
      const unitPrice = parseFloat(menuItemResult.rows[0].price);
      totalAmount += unitPrice * item.quantity;
    }

    const orderNumber = await this.generateOrderNumber();
    const orderResult = await pool.query(
      `INSERT INTO orders (table_id, customer_name, order_number, total_amount, special_instructions)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [table_id, customer_name, orderNumber, totalAmount, special_instructions]
    );
    const order = orderResult.rows[0];

    for (const item of items) {
      const menuItemResult = await pool.query('SELECT price FROM menu_items WHERE id = $1', [item.menu_item_id]);
      const unitPrice = parseFloat(menuItemResult.rows[0].price);
      const totalPrice = unitPrice * item.quantity;

      await pool.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_requests)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, item.menu_item_id, item.quantity, unitPrice, totalPrice, item.special_requests]
      );
    }

    const completeOrder = await this.getOrderWithItems(order.id);
    emitNewOrder(completeOrder);

    return {
      order: completeOrder,
      merged: false,
      orderId: completeOrder.id
    };
  }

  async getOrderById(id, tableNumber) {
    const order = await this.getOrderWithItems(id);
    if (tableNumber && order.table_number !== tableNumber) {
      throw new ForbiddenError('Access denied. Order does not belong to this table.');
    }
    return order;
  }

  async getOrdersByTable(tableId) {
    const result = await pool.query(
      `SELECT o.*, t.table_number 
       FROM orders o 
       JOIN tables t ON o.table_id = t.id 
       WHERE o.table_id = $1 
       ORDER BY o.created_at DESC`,
      [tableId]
    );
    return result.rows;
  }

  async getOrdersByTableNumber(tableNumber) {
    const result = await pool.query(
      `SELECT o.*, t.table_number 
       FROM orders o 
       JOIN tables t ON o.table_id = t.id 
       WHERE t.table_number = $1 
       ORDER BY o.created_at DESC`,
      [tableNumber]
    );

    const ordersWithItems = await Promise.all(
      result.rows.map(async (order) => {
        const itemsResult = await pool.query(
          `SELECT oi.*, mi.name, mi.description, mi.image_url
           FROM order_items oi 
           JOIN menu_items mi ON oi.menu_item_id = mi.id 
           WHERE oi.order_id = $1`,
          [order.id]
        );
        return { ...order, items: itemsResult.rows };
      })
    );
    return ordersWithItems;
  }

  isValidStatusTransition(currentStatus, newStatus) {
    const statusFlow = {
      'pending': ['preparing', 'cancelled'],
      'preparing': ['ready', 'cancelled'],
      'ready': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': []
    };
    return statusFlow[currentStatus]?.includes(newStatus) || false;
  }

  async updateOrderStatus(id, status) {
    const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError('Invalid status. Must be one of: pending, preparing, ready, completed, cancelled');
    }

    const currentOrderResult = await pool.query('SELECT status FROM orders WHERE id = $1', [id]);
    if (currentOrderResult.rows.length === 0) {
      throw new NotFoundError('Order');
    }

    const currentStatus = currentOrderResult.rows[0].status;
    if (!this.isValidStatusTransition(currentStatus, status)) {
      throw new ValidationError(`Cannot change status from "${currentStatus}" to "${status}". Invalid transition.`);
    }

    if (status === 'completed' && currentStatus !== 'ready') {
      throw new ValidationError('Cannot complete order. Order must be in "ready" status first.');
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) throw new NotFoundError('Order');

    const updatedOrder = await this.getOrderWithItems(id);
    emitOrderStatusUpdate(id, status, updatedOrder.table_number);

    if (status === 'completed') {
      emitOrderCompleted(id);
    } else if (status === 'cancelled') {
      emitOrderCancelled(id, 'Order cancelled by staff');
    }

    return updatedOrder;
  }

  async getAllOrders(filters = {}) {
    const { status, table_id, history, startDate, endDate } = filters;
    
    let query = `
      SELECT o.*, t.table_number 
      FROM orders o 
      JOIN tables t ON o.table_id = t.id 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (history === 'true') {
      query += ` AND o.is_archived = true`;
    } else {
      query += ` AND o.is_archived = false`;
    }

    if (status) {
      paramCount++;
      query += ` AND o.status = $${paramCount}`;
      params.push(status);
    }

    if (table_id) {
      paramCount++;
      query += ` AND o.table_id = $${paramCount}`;
      params.push(table_id);
    }

    if (startDate && endDate) {
      paramCount++;
      query += ` AND o.created_at >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
      query += ` AND o.created_at <= $${paramCount}`;
      params.push(endDate);
    }

    query += ' ORDER BY o.created_at DESC';

    const result = await pool.query(query, params);
    
    const ordersWithItems = await Promise.all(
      result.rows.map(async (order) => {
        const itemsResult = await pool.query(
          `SELECT oi.*, mi.name as menu_item_name, mi.description, mi.image_url
           FROM order_items oi 
           JOIN menu_items mi ON oi.menu_item_id = mi.id 
           WHERE oi.order_id = $1`,
          [order.id]
        );
        return { ...order, items: itemsResult.rows };
      })
    );
    
    return ordersWithItems;
  }

  async getOrderStats() {
    const statsResult = await pool.query(
      `SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_orders,
        COUNT(CASE WHEN status = 'preparing' THEN 1 END) as preparing_orders,
        COUNT(CASE WHEN status = 'ready' THEN 1 END) as ready_orders,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as average_order_value
       FROM orders`
    );
    return statsResult.rows[0];
  }

  async generateTableQRCode(tableNumber) {
    const baseUrl = config.CLIENT_URL || 'http://localhost:3000';
    return await generateQRCode(tableNumber, baseUrl);
  }

  async generateAllTableQRCodes() {
    const baseUrl = config.CLIENT_URL || 'http://localhost:3000';
    return await generateAllQRCodes(baseUrl);
  }

  async deleteOrder(id) {
    const orderResult = await pool.query(
      'SELECT o.*, t.table_number FROM orders o JOIN tables t ON o.table_id = t.id WHERE o.id = $1',
      [id]
    );

    if (orderResult.rows.length === 0) {
      throw new NotFoundError('Order');
    }

    const order = orderResult.rows[0];
    const tableNumber = order.table_number;

    await pool.query('DELETE FROM order_items WHERE order_id = $1', [id]);
    const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);

    emitOrderDeleted(id, tableNumber);

    return {
      order: result.rows[0],
      tableNumber
    };
  }

  async bulkUpdateOrderStatus(orderIds, status) {
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      throw new ValidationError('Order IDs array is required');
    }

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError('Invalid status. Must be one of: pending, confirmed, preparing, ready, completed, cancelled');
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = ANY($2) RETURNING *',
      [status, orderIds]
    );

    return result.rows;
  }

  async searchOrders(filters = {}) {
    const { query: searchQuery, status, table_id, date_from, date_to } = filters;
    
    let sqlQuery = `
      SELECT o.*, t.table_number 
      FROM orders o 
      JOIN tables t ON o.table_id = t.id 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (searchQuery) {
      paramCount++;
      sqlQuery += ` AND (o.customer_name ILIKE $${paramCount} OR o.order_number ILIKE $${paramCount})`;
      params.push(`%${searchQuery}%`);
    }

    if (status) {
      paramCount++;
      sqlQuery += ` AND o.status = $${paramCount}`;
      params.push(status);
    }

    if (table_id) {
      paramCount++;
      sqlQuery += ` AND o.table_id = $${paramCount}`;
      params.push(table_id);
    }

    if (date_from) {
      paramCount++;
      sqlQuery += ` AND DATE(o.created_at) >= $${paramCount}`;
      params.push(date_from);
    }

    if (date_to) {
      paramCount++;
      sqlQuery += ` AND DATE(o.created_at) <= $${paramCount}`;
      params.push(date_to);
    }

    sqlQuery += ' ORDER BY o.created_at DESC';

    const result = await pool.query(sqlQuery, params);
    return result.rows;
  }
}

module.exports = new OrderService();
