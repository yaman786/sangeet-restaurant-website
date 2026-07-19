import { prisma } from '@/lib/db';
import { NotFoundError, ValidationError } from '@/lib/errors';
// Socket functionality disabled in serverless mode
import { generateQRCode } from '../utils/qrGenerator';
import type { OrderRow, OrderItemRow, CreateOrderInput } from '@/lib/types';
import { emitNewOrder, emitNewItemsAdded, emitOrderStatusUpdate } from './pusherServer';

class OrderService {
  async getAllTables() {
    return prisma.tables.findMany({
      where: { is_active: true },
      orderBy: { table_number: 'asc' }
    });
  }

  async getTableByQRCode(qrCode: string) {
    const table = await prisma.tables.findFirst({
      where: { qr_code_url: qrCode, is_active: true }
    });
    if (!table) throw new NotFoundError('Table not found or inactive');
    return table;
  }

  async createOrder(data: CreateOrderInput) {
    const { table_id, customer_name, items, special_instructions, order_type = 'dine-in' } = data;
    
    // Validate table
    const table = await prisma.tables.findFirst({
      where: { id: table_id, is_active: true }
    });
    if (!table) throw new ValidationError('Invalid or inactive table selected');
    const tableNumber = table.table_number;
    
    // Validate and fetch menu items
    const menuItemIds = items.map(i => i.menu_item_id);
    const menuItemsCheck = await prisma.menu_items.findMany({
      where: { id: { in: menuItemIds }, is_active: true }
    });
    
    const menuItemMap = new Map<number, { price: number; name: string }>();
    for (const row of menuItemsCheck) {
      menuItemMap.set(row.id, {
        price: row.price ? Number(row.price) : 0,
        name: row.name
      });
    }

    for (const item of items) {
      if (!menuItemMap.has(item.menu_item_id)) {
        throw new ValidationError(`Menu item ${item.menu_item_id} not found or inactive`);
      }
    }
    
    let orderId: number;
    let totalAmount = 0;
    
    const orderItemCreates = [];
    for (const item of items) {
      const itemData = menuItemMap.get(item.menu_item_id)!;
      const itemTotal = itemData.price * item.quantity;
      totalAmount += itemTotal;
      orderItemCreates.push({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        special_requests: item.special_requests || null,
        unit_price: itemData.price,
        total_price: itemTotal
      });
    }
    const activeOrder = await prisma.orders.findFirst({
      where: {
        table_id,
        customer_name,
        status: { in: ['pending', 'confirmed', 'preparing', 'ready', 'served'] }
      },
      orderBy: { created_at: 'desc' }
    });

    let merged = false;
    let fullOrder = null;

    if (activeOrder) {
      // Merge into existing active order
      orderId = activeOrder.id;
      merged = true;
      
      const newStatus = ['ready', 'served'].includes(activeOrder.status || '') ? 'preparing' : activeOrder.status;

      await prisma.$transaction([
        prisma.order_items.createMany({
          data: orderItemCreates.map(item => ({
            ...item,
            order_id: activeOrder.id
          }))
        }),
        prisma.orders.update({
          where: { id: activeOrder.id },
          data: {
            total_amount: { increment: totalAmount },
            status: newStatus,
            updated_at: new Date()
          }
        })
      ]);

      fullOrder = await this.getOrderWithItems(orderId);
      
      emitNewItemsAdded({ 
        type: 'items-added', 
        orderId, 
        tableNumber, 
        itemsAdded: orderItemCreates.length, 
        timestamp: new Date().toISOString() 
      });
      
    } else {
      // Create new order
      const dateStr = new Date().toISOString().replace(/[-:T]/g, '').substring(0, 8);
      
      let createdOrder = null;
      while (!createdOrder) {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const orderNumber = `ORD${dateStr}${randomNum}`;
        
        try {
          createdOrder = await prisma.orders.create({
            data: {
              order_number: orderNumber,
              table_id,
              customer_name,
              status: 'pending',
              special_instructions: special_instructions || null,
              total_amount: totalAmount,
              order_type,
              order_items: {
                create: orderItemCreates
              }
            }
          });
        } catch (e: any) {
          if (e.code === 'P2002') continue; // Unique constraint failed, retry
          throw e;
        }
      }
      
      orderId = createdOrder.id;
      fullOrder = await this.getOrderWithItems(orderId);
      
      emitNewOrder({ type: 'new-order', orderId, tableNumber, timestamp: new Date().toISOString() });
    }
    
    return { order: fullOrder, merged };
  }

  private async getOrderWithItems(orderId: number) {
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        tables: true,
        order_items: {
          include: {
            menu_items: true
          }
        }
      }
    });
    
    if (!order) throw new NotFoundError('Order');
    
    return {
      ...order,
      total_amount: order.total_amount ? Number(order.total_amount) : 0,
      table_number: order.tables?.table_number,
      items: order.order_items.map(item => ({
        ...item,
        unit_price: item.unit_price ? Number(item.unit_price) : 0,
        total_price: item.total_price ? Number(item.total_price) : 0,
        name: item.menu_items?.name,
        image_url: item.menu_items?.image_url,
        category: item.menu_items?.category
      }))
    } as any;
  }

  async getOrderById(id: string, tableNumber?: string) {
    const order = await this.getOrderWithItems(parseInt(id, 10));
    if (tableNumber && order.table_number !== tableNumber) {
      throw new ValidationError('Table number does not match this order');
    }
    return order;
  }

  async getOrdersByTable(tableId: string) {
    const orders = await prisma.orders.findMany({
      where: {
        table_id: parseInt(tableId, 10),
        is_archived: false,
        status: { notIn: ['completed', 'cancelled'] }
      },
      orderBy: { created_at: 'desc' }
    });
    
    const result = [];
    for (const o of orders) {
      result.push(await this.getOrderWithItems(o.id));
    }
    return result;
  }

  async getOrdersByTableNumber(tableNumber: string) {
    const table = await prisma.tables.findFirst({
      where: { table_number: tableNumber, is_active: true }
    });
    if (!table) throw new NotFoundError('Table');
    return this.getOrdersByTable(table.id.toString());
  }

  async updateOrderStatus(id: string, status: string) {
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) throw new ValidationError('Invalid status');
    
    try {
      await prisma.orders.update({
        where: { id: parseInt(id, 10) },
        data: { status, updated_at: new Date() }
      });
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundError('Order');
      throw e;
    }
    
    const order = await this.getOrderWithItems(parseInt(id, 10));
    emitOrderStatusUpdate({ 
      type: 'status-update', 
      orderId: parseInt(id, 10), 
      status, 
      tableNumber: order.table_number, 
      estimatedTime: order.estimated_time, 
      timestamp: new Date().toISOString() 
    });
    
    return order;
  }

  async getAllOrders(query: Record<string, any>) {
    const where: any = {};
    
    if (query.status) {
      const statuses = query.status.split(',');
      if (statuses.length > 1) {
        where.status = { in: statuses };
      } else {
        where.status = query.status;
      }
    }
    
    if (query.archived === 'true') { where.is_archived = true; }
    else if (query.archived === 'false') { where.is_archived = false; }
    else { where.is_archived = false; }
    
    if (query.table_id) {
      where.table_id = parseInt(query.table_id as string, 10);
    }
    
    if (query.query) {
      where.OR = [
        { customer_name: { contains: query.query, mode: 'insensitive' } },
        { order_number: { contains: query.query, mode: 'insensitive' } }
      ];
    }
    
    const orders = await prisma.orders.findMany({
      where,
      orderBy: { created_at: 'desc' },
      ...(query.limit ? { take: parseInt(query.limit as string, 10) } : {})
    });
    
    const result = [];
    for (const o of orders) {
      result.push(await this.getOrderWithItems(o.id));
    }
    return result;
  }

  async getOrderStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [total_orders, pending_orders, active_orders, completed_today_count, completed_today_orders] = await prisma.$transaction([
      prisma.orders.count(),
      prisma.orders.count({ where: { status: 'pending' } }),
      prisma.orders.count({ where: { status: { in: ['confirmed', 'preparing'] } } }),
      prisma.orders.count({ where: { status: 'completed', created_at: { gte: today } } }),
      prisma.orders.findMany({ 
        where: { status: 'completed', created_at: { gte: today } },
        select: { total_amount: true }
      })
    ]);

    const revenue_today = completed_today_orders.reduce((acc, order) => acc + (order.total_amount ? Number(order.total_amount) : 0), 0);

    return {
      total_orders,
      pending_orders,
      active_orders,
      completed_today: completed_today_count,
      revenue_today
    };
  }

  async generateTableQRCode(tableNumber: string) {
    const table = await prisma.tables.findFirst({ where: { table_number: tableNumber } });
    if (!table) throw new NotFoundError(`Table ${tableNumber}`);
    
    const qrData = await generateQRCode(tableNumber, process.env.FRONTEND_URL || 'http://localhost:3000');
    
    const updatedTable = await prisma.tables.update({
      where: { id: table.id },
      data: {
        qr_code_url: qrData.qrUrl,
        qr_code_data: qrData.qrCodeDataURL
      }
    });
    
    return { table: updatedTable, qrCode: qrData };
  }

  async generateAllTableQRCodes() {
    const tables = await prisma.tables.findMany({ where: { is_active: true } });
    const generated = [];
    
    for (const table of tables) {
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
    const orderId = parseInt(id, 10);
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: { tables: true }
    });
    
    if (!order) throw new NotFoundError('Order');
    
    await prisma.$transaction([
      prisma.order_items.deleteMany({ where: { order_id: orderId } }),
      prisma.orders.delete({ where: { id: orderId } })
    ]);
    
    return { order, tableNumber: order.tables?.table_number || null };
  }

  async bulkUpdateOrderStatus(orderIds: number[], status: string) {
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) throw new ValidationError('Invalid status');
    if (!Array.isArray(orderIds) || orderIds.length === 0) throw new ValidationError('No order IDs provided');
    
    await prisma.orders.updateMany({
      where: { id: { in: orderIds } },
      data: { status, updated_at: new Date() }
    });
    
    const updatedOrders = [];
    for (const id of orderIds) {
      const order = await this.getOrderWithItems(id);
      updatedOrders.push(order);
      emitOrderStatusUpdate({ 
        type: 'status-update', 
        orderId: id, 
        status, 
        tableNumber: order.table_number, 
        estimatedTime: order.estimated_time, 
        timestamp: new Date().toISOString() 
      });
    }
    
    return updatedOrders;
  }

  async searchOrders(query: Record<string, any>) {
    const { term, status, startDate, endDate, tableId } = query;
    const where: any = {};
    
    if (term) {
      where.OR = [
        { order_number: { contains: term, mode: 'insensitive' } },
        { customer_name: { contains: term, mode: 'insensitive' } }
      ];
    }
    
    if (status) where.status = status;
    if (tableId) where.table_id = parseInt(tableId as string, 10);
    if (startDate) where.created_at = { ...where.created_at, gte: new Date(startDate) };
    if (endDate) where.created_at = { ...where.created_at, lte: new Date(endDate) };

    const orders = await prisma.orders.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: 50
    });
    
    const result = [];
    for (const o of orders) {
      result.push(await this.getOrderWithItems(o.id));
    }
    return result;
  }
}

export default new OrderService();
