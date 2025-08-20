const pool = require('../config/database');
const { generateQRCode, generateAllQRCodes } = require('../utils/qrGenerator');
const { emitNewOrder, emitOrderStatusUpdate, emitNewItemsAdded, emitOrderCompleted, emitOrderCancelled, emitOrderDeleted } = require('../socket');
const { Server } = require('socket.io');
let io;

// Initialize socket.io instance
const initializeSocket = (socketInstance) => {
  io = socketInstance;
};

// Generate unique order number
const generateOrderNumber = async () => {
  try {
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      const timestamp = Date.now().toString().slice(-8);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const orderNumber = `ORD${timestamp}${random}`;
      
      console.log(`🔄 Attempt ${attempts + 1}: Checking order number ${orderNumber}`);
      
      // Check if this order number already exists
      const existingOrder = await pool.query(
        'SELECT id FROM orders WHERE order_number = $1',
        [orderNumber]
      );
      
      if (existingOrder.rows.length === 0) {
        console.log(`✅ Unique order number generated: ${orderNumber}`);
        return orderNumber;
      }
      
      console.log(`⚠️ Order number ${orderNumber} already exists, trying again...`);
      attempts++;
      // Small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 1));
    }
    
    // If we can't generate a unique number after max attempts, throw error
    throw new Error('Unable to generate unique order number after multiple attempts');
  } catch (error) {
    console.error('❌ Error in generateOrderNumber:', error);
    throw error;
  }
};

// Get all tables
const getAllTables = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tables WHERE is_active = true ORDER BY table_number'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
};

// Get table by QR code URL
const getTableByQRCode = async (req, res) => {
  try {
    const { qrCode } = req.params;
    const result = await pool.query(
      'SELECT * FROM tables WHERE qr_code_url LIKE $1 AND is_active = true',
      [`%${qrCode}%`]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching table:', error);
    res.status(500).json({ error: 'Failed to fetch table' });
  }
};

// Function to find active order for table/customer
const findActiveOrder = async (tableId, customerName) => {
  try {
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
  } catch (error) {
    console.error('Error finding active order:', error);
    return null;
  }
};

// Function to add items to existing order
const addItemsToExistingOrder = async (orderId, items) => {
  try {
    console.log(`🔄 Adding ${items.length} items to existing order ${orderId}`);
    
    // Add each item to the existing order
    for (const item of items) {
      console.log(`📦 Processing item: ${item.menu_item_id}, quantity: ${item.quantity}`);
      
      const menuItemResult = await pool.query(
        'SELECT price FROM menu_items WHERE id = $1',
        [item.menu_item_id]
      );
      
      if (menuItemResult.rows.length === 0) {
        console.error(`❌ Menu item ${item.menu_item_id} not found`);
        throw new Error(`Menu item ${item.menu_item_id} not found`);
      }
      
      const unitPrice = parseFloat(menuItemResult.rows[0].price);
      const totalPrice = unitPrice * item.quantity;

      console.log(`💰 Item pricing: unitPrice=${unitPrice}, totalPrice=${totalPrice}`);

      await pool.query(
        `INSERT INTO order_items 
         (order_id, menu_item_id, quantity, unit_price, total_price, special_requests)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [orderId, item.menu_item_id, item.quantity, unitPrice, totalPrice, item.special_requests || '']
      );
      
      console.log(`✅ Successfully added item ${item.menu_item_id} to order ${orderId}`);
    }

    // Update order total
    console.log(`🔄 Updating total amount for order ${orderId}`);
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

    console.log(`✅ Successfully updated order ${orderId} total amount`);
    return true;
  } catch (error) {
    console.error('❌ Error adding items to existing order:', error);
    return false;
  }
};

// Create new order
const createOrder = async (req, res) => {
  try {
    console.log('🚀 Starting order creation process...');
    
    // Test database connection first
    try {
      const testResult = await pool.query('SELECT 1 as test');
      console.log('✅ Database connection test successful:', testResult.rows[0]);
    } catch (dbError) {
      console.error('❌ Database connection test failed:', dbError);
      return res.status(500).json({ error: 'Database connection failed' });
    }
    
    const { table_id, customer_name, items, special_instructions } = req.body;

    // Validate required fields
    if (!table_id || !customer_name || !items) {
      return res.status(400).json({ 
        error: 'Missing required fields: table_id, customer_name, and items are required' 
      });
    }

    // Validate items is an array and not empty
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        error: 'Items must be a non-empty array' 
      });
    }

    // Validate table exists
    const tableResult = await pool.query(
      'SELECT * FROM tables WHERE id = $1 AND is_active = true',
      [table_id]
    );

    if (tableResult.rows.length === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }

    // Check for existing active order
    const existingOrder = await findActiveOrder(table_id, customer_name);
    
    if (existingOrder) {
      console.log('🔄 Found existing order, adding items to it');
      
      // Add items to existing order
      const success = await addItemsToExistingOrder(existingOrder.id, items);
      
      if (success) {
        // Get updated order with all items
        const updatedOrder = await getOrderWithItems(existingOrder.id);
        
        // Emit real-time update for order modification
        emitOrderStatusUpdate(existingOrder.id, existingOrder.status, updatedOrder.table_number);
        
        // Emit new items notification for kitchen
        emitNewItemsAdded(existingOrder.id, items, updatedOrder.table_number);
        
        console.log('✅ Successfully added items to existing order');
        
        res.json({
          message: 'Items added to existing order successfully!',
          order: updatedOrder,
          merged: true,
          orderId: existingOrder.id,
          mergeInfo: {
            originalOrderId: existingOrder.id,
            originalOrderNumber: existingOrder.order_number,
            itemsAdded: items.length,
            newTotal: updatedOrder.total_amount
          }
        });
        return;
      } else {
        console.error('❌ Failed to add items to existing order');
        res.status(500).json({ error: 'Failed to add items to existing order' });
        return;
      }
    } else {
      console.log('🆕 Creating new order');
    }

    // Calculate total amount
    let totalAmount = 0;
    for (const item of items) {
      // Validate each item has required fields
      if (!item.menu_item_id || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({ 
          error: 'Each item must have menu_item_id and quantity > 0' 
        });
      }

      const menuItemResult = await pool.query(
        'SELECT price FROM menu_items WHERE id = $1',
        [item.menu_item_id]
      );
      
      if (menuItemResult.rows.length === 0) {
        return res.status(404).json({ error: `Menu item ${item.menu_item_id} not found` });
      }
      
      const unitPrice = parseFloat(menuItemResult.rows[0].price);
      totalAmount += unitPrice * item.quantity;
    }

    // Create order
    console.log('🔄 Generating order number...');
    const orderNumber = await generateOrderNumber();
    console.log('✅ Order number generated:', orderNumber);
    
    console.log('🔄 Creating order in database...');
    const orderResult = await pool.query(
      `INSERT INTO orders 
       (table_id, customer_name, order_number, total_amount, special_instructions)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [table_id, customer_name, orderNumber, totalAmount, special_instructions]
    );

    const order = orderResult.rows[0];
    console.log('✅ Order created:', order);

    // Create order items
    console.log('🔄 Creating order items...');
    for (const item of items) {
      console.log('📦 Processing item:', item);
      
      const menuItemResult = await pool.query(
        'SELECT price FROM menu_items WHERE id = $1',
        [item.menu_item_id]
      );
      
      const unitPrice = parseFloat(menuItemResult.rows[0].price);
      const totalPrice = unitPrice * item.quantity;

      console.log('💰 Item pricing:', { unitPrice, totalPrice });

      await pool.query(
        `INSERT INTO order_items 
         (order_id, menu_item_id, quantity, unit_price, total_price, special_requests)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, item.menu_item_id, item.quantity, unitPrice, totalPrice, item.special_requests]
      );
      
      console.log('✅ Order item created for menu_item_id:', item.menu_item_id);
    }
    console.log('✅ All order items created');

    // Get complete order with items
    const completeOrder = await getOrderWithItems(order.id);

    console.log('📦 Complete order data:', completeOrder);
    
    // Emit real-time notification for new order (send full DB-shaped order)
    console.log('📡 Emitting new order event (full order):', completeOrder);
    emitNewOrder(completeOrder);

    const response = {
      message: 'Order placed successfully!',
      order: completeOrder,
      merged: false,
      orderId: completeOrder.id
    };
    
    console.log('📤 Sending response to client:', response);
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// Get order with items
const getOrderWithItems = async (orderId) => {
  try {
    const orderResult = await pool.query(
      `SELECT o.*, t.table_number 
       FROM orders o 
       JOIN tables t ON o.table_id = t.id 
       WHERE o.id = $1`,
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      throw new Error('Order not found');
    }

    // Try to get items with all columns, fallback to basic columns if needed
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
      console.log('⚠️ Fallback to basic item query due to:', itemError.message);
      // Fallback to basic query without potentially missing columns
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
  } catch (error) {
    console.error('Error in getOrderWithItems:', error);
    throw error;
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await getOrderWithItems(id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

// Get orders by table ID
const getOrdersByTable = async (req, res) => {
  try {
    const { tableId } = req.params;
    const result = await pool.query(
      `SELECT o.*, t.table_number 
       FROM orders o 
       JOIN tables t ON o.table_id = t.id 
       WHERE o.table_id = $1 
       ORDER BY o.created_at DESC`,
      [tableId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching orders by table:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Get orders by table number
const getOrdersByTableNumber = async (req, res) => {
  try {
    const { tableNumber } = req.params;
    const result = await pool.query(
      `SELECT o.*, t.table_number 
       FROM orders o 
       JOIN tables t ON o.table_id = t.id 
       WHERE t.table_number = $1 
       ORDER BY o.created_at DESC`,
      [tableNumber]
    );

    // Get items for each order
    const ordersWithItems = await Promise.all(
      result.rows.map(async (order) => {
        const itemsResult = await pool.query(
          `SELECT oi.*, mi.name, mi.description, mi.image_url
           FROM order_items oi 
           JOIN menu_items mi ON oi.menu_item_id = mi.id 
           WHERE oi.order_id = $1`,
          [order.id]
        );
        
        return {
          ...order,
          items: itemsResult.rows
        };
      })
    );

    res.json(ordersWithItems);
  } catch (error) {
    console.error('Error fetching orders by table number:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Validate status transitions to prevent backward movement
const isValidStatusTransition = (currentStatus, newStatus) => {
  const statusFlow = {
    'pending': ['preparing', 'cancelled'],
    'preparing': ['ready', 'cancelled'],
    'ready': ['completed', 'cancelled'],
    'completed': [], // No further transitions allowed
    'cancelled': [] // No further transitions allowed
  };
  
  return statusFlow[currentStatus]?.includes(newStatus) || false;
};



// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be one of: pending, preparing, ready, completed, cancelled' 
      });
    }

    // Get current order status first
    const currentOrderResult = await pool.query(
      'SELECT status FROM orders WHERE id = $1',
      [id]
    );

    if (currentOrderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const currentStatus = currentOrderResult.rows[0].status;

    // Validate status transition
    if (!isValidStatusTransition(currentStatus, status)) {
      return res.status(400).json({ 
        error: `Cannot change status from "${currentStatus}" to "${status}". Invalid transition.` 
      });
    }

    // Prevent completion if order is not in 'ready' status
    if (status === 'completed') {
      if (currentStatus !== 'ready') {
        return res.status(400).json({
          error: 'Cannot complete order. Order must be in "ready" status first.',
          currentStatus: currentStatus
        });
      }
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = await getOrderWithItems(id);

    // Emit real-time status update notification with table number
    emitOrderStatusUpdate(id, status, updatedOrder.table_number);

    // Emit specific notifications based on status
    if (status === 'completed') {
      emitOrderCompleted(id);
    } else if (status === 'cancelled') {
      emitOrderCancelled(id, 'Order cancelled by staff');
    }

    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

// Get all orders (Admin)
const getAllOrders = async (req, res) => {
  try {
    const { status, table_id } = req.query;
    
    let query = `
      SELECT o.*, t.table_number 
      FROM orders o 
      JOIN tables t ON o.table_id = t.id 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

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

    query += ' ORDER BY o.created_at DESC';

    const result = await pool.query(query, params);
    
    // Get items for each order
    const ordersWithItems = await Promise.all(
      result.rows.map(async (order) => {
        const itemsResult = await pool.query(
          `SELECT oi.*, mi.name as menu_item_name, mi.description, mi.image_url
           FROM order_items oi 
           JOIN menu_items mi ON oi.menu_item_id = mi.id 
           WHERE oi.order_id = $1`,
          [order.id]
        );
        
        return {
          ...order,
          items: itemsResult.rows
        };
      })
    );
    
    res.json(ordersWithItems);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Get order statistics
const getOrderStats = async (req, res) => {
  try {
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

    res.json(statsResult.rows[0]);
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    res.status(500).json({ error: 'Failed to fetch order statistics' });
  }
};

// Generate QR code for a specific table
const generateTableQRCode = async (req, res) => {
  try {
    const { tableNumber } = req.params;
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    const qrCode = await generateQRCode(tableNumber, baseUrl);
    res.json(qrCode);
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
};

// Generate QR codes for all tables
const generateAllTableQRCodes = async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const qrCodes = await generateAllQRCodes(baseUrl);
    res.json(qrCodes);
  } catch (error) {
    console.error('Error generating QR codes:', error);
    res.status(500).json({ error: 'Failed to generate QR codes' });
  }
};

// Clear cart data for a specific table
const clearTableCart = async (tableId) => {
  try {
    // Get table number from table ID
    const tableResult = await pool.query(
      'SELECT table_number FROM tables WHERE id = $1',
      [tableId]
    );
    
    if (tableResult.rows.length > 0) {
      const tableNumber = tableResult.rows[0].table_number;
  
      
      // Note: This is a server-side log. The actual localStorage clearing 
      // will be handled by the frontend when it receives the order deletion notification
      return tableNumber;
    }
    return null;
  } catch (error) {
    console.error('Error getting table number:', error);
    return null;
  }
};

// Delete order (Admin)
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Get order details before deletion to get table information
    const orderResult = await pool.query(
      'SELECT o.*, t.table_number FROM orders o JOIN tables t ON o.table_id = t.id WHERE o.id = $1',
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];
    const tableNumber = order.table_number;

    // First delete order items
    await pool.query('DELETE FROM order_items WHERE order_id = $1', [id]);
    
    // Then delete the order
    const result = await pool.query(
      'DELETE FROM orders WHERE id = $1 RETURNING *',
      [id]
    );

    // Emit socket event to notify frontend to clear cart data
    emitOrderDeleted(id, tableNumber);

    res.json({
      message: 'Order deleted successfully',
      order: result.rows[0],
      tableNumber: tableNumber
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
};

// Bulk update order status (Admin)
const bulkUpdateOrderStatus = async (req, res) => {
  try {
    const { orderIds, status } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ error: 'Order IDs array is required' });
    }

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be one of: pending, confirmed, preparing, ready, completed, cancelled' 
      });
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = ANY($2) RETURNING *',
      [status, orderIds]
    );

    res.json({
      message: `${result.rows.length} orders updated successfully`,
      updatedOrders: result.rows
    });
  } catch (error) {
    console.error('Error bulk updating order status:', error);
    res.status(500).json({ error: 'Failed to bulk update order status' });
  }
};

// Search orders (Admin)
const searchOrders = async (req, res) => {
  try {
    const { query, status, table_id, date_from, date_to } = req.query;
    
    let sqlQuery = `
      SELECT o.*, t.table_number 
      FROM orders o 
      JOIN tables t ON o.table_id = t.id 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (query) {
      paramCount++;
      sqlQuery += ` AND (o.customer_name ILIKE $${paramCount} OR o.order_number ILIKE $${paramCount})`;
      params.push(`%${query}%`);
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
    res.json(result.rows);
  } catch (error) {
    console.error('Error searching orders:', error);
    res.status(500).json({ error: 'Failed to search orders' });
  }
};



module.exports = {
  getAllTables,
  getTableByQRCode,
  createOrder,
  getOrderById,
  getOrdersByTable,
  getOrdersByTableNumber,
  updateOrderStatus,
  getAllOrders,
  getOrderStats,
  generateTableQRCode,
  generateAllTableQRCodes,
  deleteOrder,
  bulkUpdateOrderStatus,
  searchOrders
}; 