import { prisma } from '@/lib/db';
import { AppError, NotFoundError, ValidationError } from '@/lib/errors';
// Socket functionality disabled in serverless mode
import { generateQRCode } from '../utils/qrGenerator';
import type { CreateOrderInput, OrderQueryDTO } from '@/lib/types';
import { emitNewOrder, emitOrderStatusUpdate, emitOrderDeleted } from './pusherServer';
import {
  isAlcoholicDrink,
  getItemStation,
  getStationTicketStatus,
  type OrderStation,
} from '../utils/menuSection';

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
    const {
      table_id,
      customer_name,
      customer_phone,
      pickup_time,
      items,
      special_instructions,
      order_type = 'dine-in',
      status
    } = data;

    const isTakeaway = order_type === 'takeaway' || !table_id;
    let tableNumber = 'PICKUP';
    let resolvedTableId: number | null = null;

    if (!isTakeaway && table_id) {
      // Validate table for dine-in orders
      const table = await prisma.tables.findFirst({
        where: { id: table_id, is_active: true }
      });
      if (!table) throw new ValidationError('Invalid or inactive table selected');
      tableNumber = table.table_number;
      resolvedTableId = table.id;
    }

    // Build formatted special instructions with pickup details if takeaway
    let finalSpecialInstructions = special_instructions ? special_instructions.trim() : '';
    if (isTakeaway && (pickup_time || customer_phone)) {
      const pickupMetaParts: string[] = [];
      if (pickup_time) pickupMetaParts.push(`Pick-Up: ${pickup_time}`);
      if (customer_phone) pickupMetaParts.push(`Tel: ${customer_phone}`);
      const metaPrefix = `[${pickupMetaParts.join(' | ')}]`;
      if (!finalSpecialInstructions.includes(metaPrefix)) {
        finalSpecialInstructions = finalSpecialInstructions
          ? `${metaPrefix} ${finalSpecialInstructions}`
          : metaPrefix;
      }
    }
    
    // Validate and fetch menu items
    const menuItemIds = items.map(i => i.menu_item_id);
    const menuItemsCheck = await prisma.menu_items.findMany({
      where: { id: { in: menuItemIds }, is_active: true }
    });
    
    const menuItemMap = new Map<number, { price: number; name: string; row: any }>();
    for (const row of menuItemsCheck) {
      menuItemMap.set(row.id, {
        price: row.price ? Number(row.price) : 0,
        name: row.name,
        row
      });
    }

    for (const item of items) {
      const found = menuItemMap.get(item.menu_item_id);
      if (!found) {
        throw new ValidationError(`Menu item ${item.menu_item_id} not found or inactive`);
      }
      if (isTakeaway && isAlcoholicDrink(found.row)) {
        throw new ValidationError(
          `Alcoholic beverages (${found.name}) are available for dine-in only and cannot be ordered for pick-up.`
        );
      }
    }
    

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
    
    // Check if the table already has an active, verified order (accepted by waiter or cooking/serving)
    const verifiedSession = (!isTakeaway && resolvedTableId)
      ? await prisma.orders.findFirst({
          where: {
            table_id: resolvedTableId,
            status: { in: ['accepted', 'preparing', 'ready', 'served'] }
          }
        })
      : null;
    
    // If the table is already verified by a waiter, auto-approve subsequent orders to 'accepted' (directly in kitchen)
    // If an explicit status was provided (e.g. from the admin dashboard), use that instead.
    const initialStatus = status ? status : (verifiedSession ? 'accepted' : 'pending');
    
    // Create new order
    const dateStr = new Date().toISOString().replace(/[-:T]/g, '').substring(0, 8);
    
    let createdOrder = null;
    let attempts = 0;
    const MAX_ATTEMPTS = 10;
    
    while (!createdOrder && attempts < MAX_ATTEMPTS) {
      attempts++;
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `ORD${dateStr}${randomNum}`;
      
      try {
        createdOrder = await prisma.orders.create({
          data: {
            order_number: orderNumber,
            table_id: resolvedTableId,
            customer_name,
            status: initialStatus,
            special_instructions: finalSpecialInstructions || null,
            total_amount: totalAmount,
            order_type: isTakeaway ? 'takeaway' : order_type,
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
    
    if (!createdOrder) {
      throw new AppError('Failed to generate a unique order number after multiple attempts.', 500);
    }
    
    const orderId = createdOrder.id;
    const fullOrder = await this.getOrderWithItems(orderId);
    
    emitNewOrder({ type: 'new-order', orderId, tableNumber, timestamp: new Date().toISOString() });
    
    return { order: fullOrder };
  }

  private formatOrder = (order: any) => {
    const isTakeaway = order.order_type === 'takeaway' || (!order.table_id && !order.tables?.table_number);
    const formattedItems =
      order.order_items?.map((item: any) => {
        const station = getItemStation({
          ...item,
          category: item.menu_items?.category,
          category_id: item.menu_items?.category_id,
        });
        return {
          ...item,
          unit_price: item.unit_price ? Number(item.unit_price) : 0,
          total_price: item.total_price ? Number(item.total_price) : 0,
          name: item.menu_items?.name,
          image_url: item.menu_items?.image_url,
          category: item.menu_items?.category,
          station,
        };
      }) || [];

    const baseFormatted = {
      ...order,
      total_amount: order.total_amount ? Number(order.total_amount) : 0,
      table_number: order.tables?.table_number || (isTakeaway ? 'PICKUP' : undefined),
      items: formattedItems,
    };

    return {
      ...baseFormatted,
      kot_status: getStationTicketStatus(baseFormatted, 'kot'),
      bot_status: getStationTicketStatus(baseFormatted, 'bot'),
    } as any;
  }

  private async getOrderWithItems(orderId: number) {
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        tables: true,
        order_items: {
          include: { menu_items: true }
        }
      }
    });
    
    if (!order) throw new NotFoundError('Order');
    return this.formatOrder(order);
  }

  async getOrderById(id: string, tableNumber?: string) {
    const order = await this.getOrderWithItems(parseInt(id, 10));
    if (
      tableNumber &&
      order.table_number !== tableNumber &&
      !(tableNumber.toUpperCase() === 'PICKUP' && (order.order_type === 'takeaway' || order.table_number === 'PICKUP'))
    ) {
      throw new ValidationError('Table number does not match this order');
    }
    return order;
  }

  async getOrdersByTable(tableIdOrNumber: string | number) {
    const rawInput = String(tableIdOrNumber || '').trim();
    const parsedId = parseInt(rawInput, 10);
    
    let whereClause: any;
    if (!isNaN(parsedId) && String(parsedId) === rawInput) {
      // Input is a pure number string, check both table_id and table_number
      whereClause = {
        OR: [
          { table_id: parsedId },
          { tables: { table_number: rawInput } }
        ],
        is_archived: false,
        status: { notIn: ['completed', 'cancelled'] }
      };
    } else {
      // Input is a string (e.g. "Table 1" or "table-1"), search via tables relationship or table_number
      const cleanedNumber = rawInput.replace(/^table-/i, '').replace(/^tb-/i, '').trim();
      whereClause = {
        OR: [
          { tables: { table_number: rawInput } },
          { tables: { table_number: cleanedNumber } }
        ],
        is_archived: false,
        status: { notIn: ['completed', 'cancelled'] }
      };
    }

    const orders = await prisma.orders.findMany({
      where: whereClause,
      include: {
        tables: true,
        order_items: { include: { menu_items: true } }
      },
      orderBy: { created_at: 'desc' }
    });
    
    return orders.map(this.formatOrder);
  }

  async getOrdersByTableNumber(tableNumber: string) {
    const table = await prisma.tables.findFirst({
      where: { table_number: tableNumber, is_active: true }
    });
    if (!table) throw new NotFoundError('Table');
    return this.getOrdersByTable(table.id.toString());
  }

  async updateOrderStatus(
    id: string,
    status: string,
    station?: OrderStation,
    paymentMethod?: string
  ) {
    const validStatuses = ['pending', 'accepted', 'preparing', 'ready', 'served', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) throw new ValidationError('Invalid status');

    const orderId = parseInt(id, 10);
    const existingOrder = await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        tables: true,
        order_items: { include: { menu_items: true } }
      }
    });

    if (!existingOrder) throw new NotFoundError('Order');

    let finalOrderStatus = status;

    if (station === 'kot' || station === 'bot') {
      const targetItemIds = existingOrder.order_items
        .filter((oi: any) => oi.status !== 'cancelled')
        .filter((oi: any) => {
          const itemStation = getItemStation({
            ...oi,
            category: oi.menu_items?.category,
            category_id: oi.menu_items?.category_id,
          });
          return itemStation === station;
        })
        .map((oi: any) => oi.id);

      if (targetItemIds.length > 0) {
        await prisma.order_items.updateMany({
          where: { id: { in: targetItemIds } },
          data: { status }
        });
      }

      const updatedItems = existingOrder.order_items.map((oi: any) =>
        targetItemIds.includes(oi.id) ? { ...oi, status } : oi
      );
      const activeItems = updatedItems.filter((oi: any) => oi.status !== 'cancelled');

      if (activeItems.length === 0) {
        finalOrderStatus = 'cancelled';
      } else if (activeItems.every((oi: any) => oi.status === 'completed')) {
        finalOrderStatus = 'completed';
      } else if (
        activeItems.every(
          (oi: any) => oi.status === 'ready' || oi.status === 'served' || oi.status === 'completed'
        )
      ) {
        finalOrderStatus = 'ready';
      } else if (
        activeItems.some(
          (oi: any) => oi.status === 'preparing' || oi.status === 'ready' || oi.status === 'served'
        )
      ) {
        finalOrderStatus = 'preparing';
      } else {
        finalOrderStatus =
          existingOrder.status === 'pending' ? 'accepted' : existingOrder.status || 'preparing';
      }

      await prisma.orders.update({
        where: { id: orderId },
        data: { status: finalOrderStatus, updated_at: new Date() }
      });
    } else {
      let updatedInstructions = existingOrder.special_instructions || null;
      if (status === 'completed' && paymentMethod) {
        const paymentTag = `[Paid: ${paymentMethod}]`;
        if (!updatedInstructions?.includes('[Paid:')) {
          updatedInstructions = updatedInstructions
            ? `${paymentTag} ${updatedInstructions}`
            : paymentTag;
        }
      }

      await prisma.$transaction([
        prisma.orders.update({
          where: { id: orderId },
          data: {
            status,
            ...(updatedInstructions !== existingOrder.special_instructions
              ? { special_instructions: updatedInstructions }
              : {}),
            updated_at: new Date()
          }
        }),
        prisma.order_items.updateMany({
          where: { order_id: orderId, status: { not: 'cancelled' } },
          data: { status }
        })
      ]);
    }

    const order = await this.getOrderWithItems(orderId);
    emitOrderStatusUpdate({ 
      type: 'status-update', 
      orderId, 
      status: order.status,
      kot_status: order.kot_status,
      bot_status: order.bot_status,
      station: station || 'all',
      tableNumber: order.table_number, 
      estimatedTime: order.estimated_time, 
      timestamp: new Date().toISOString() 
    });
    
    return order;
  }

  async cancelOrderItem(orderId: string, itemId: string) {
    const oId = parseInt(orderId, 10);
    const iId = parseInt(itemId, 10);

    const item = await prisma.order_items.findFirst({
      where: { id: iId, order_id: oId }
    });

    if (!item) throw new NotFoundError('Order Item');
    if (item.status === 'cancelled') throw new ValidationError('Item is already cancelled');

    await prisma.order_items.update({
      where: { id: iId },
      data: { status: 'cancelled' }
    });

    const order = await prisma.orders.findUnique({
      where: { id: oId },
      include: { order_items: true, tables: true }
    });

    if (order) {
      const newTotal = Math.max(0, Number(order.total_amount || 0) - Number(item.total_price || 0));
      await prisma.orders.update({
        where: { id: oId },
        data: { total_amount: newTotal, updated_at: new Date() }
      });

      const hasActiveItems = order.order_items.some(oi => oi.id !== iId && oi.status !== 'cancelled');
      if (!hasActiveItems && order.status !== 'completed' && order.status !== 'cancelled') {
        await this.updateOrderStatus(orderId, 'cancelled');
      }
    }

    const fullOrder = await this.getOrderWithItems(oId);
    
    emitOrderStatusUpdate({ 
      type: 'item-cancelled', 
      orderId: oId, 
      itemId: iId,
      tableNumber: fullOrder.table_number,
      timestamp: new Date().toISOString() 
    });

    return fullOrder;
  }

  async getAllOrders(query: OrderQueryDTO) {
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
      include: {
        tables: true,
        order_items: { include: { menu_items: true } }
      },
      orderBy: { created_at: 'desc' },
      ...(query.limit ? { take: parseInt(query.limit as string, 10) } : {})
    });
    
    return orders.map(this.formatOrder);
  }

  async getOrderStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [total_orders, pending_orders, active_orders, completed_today_count, completed_today_orders] = await prisma.$transaction([
      prisma.orders.count(),
      prisma.orders.count({ where: { status: 'pending' } }),
      prisma.orders.count({ where: { status: { in: ['preparing'] } } }),
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
    
    const envUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.FRONTEND_URL;
    const canonicalDomain = (envUrl && !envUrl.includes('vercel.app'))
      ? envUrl.replace(/\/+$/, '')
      : 'https://www.sangeet.hk';
    const qrData = await generateQRCode(tableNumber, canonicalDomain);
    
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
    
    // Notify clients that the order has been deleted
    emitOrderDeleted({
      type: 'order-deleted',
      orderId: orderId,
      tableNumber: order.tables?.table_number || null,
      timestamp: new Date().toISOString()
    });
    
    return { order, tableNumber: order.tables?.table_number || null };
  }

  async bulkUpdateOrderStatus(orderIds: number[], status: string, paymentMethod?: string) {
    const validStatuses = ['pending', 'accepted', 'preparing', 'ready', 'served', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) throw new ValidationError('Invalid status');
    if (!Array.isArray(orderIds) || orderIds.length === 0) throw new ValidationError('No order IDs provided');

    if (status === 'completed' && paymentMethod) {
      const existingToComplete = await prisma.orders.findMany({
        where: { id: { in: orderIds } },
        select: { id: true, special_instructions: true }
      });
      const paymentTag = `[Paid: ${paymentMethod}]`;
      await Promise.all(
        existingToComplete.map((o) => {
          const currentNotes = o.special_instructions || '';
          const nextNotes = currentNotes.includes('[Paid:')
            ? currentNotes
            : currentNotes
              ? `${paymentTag} ${currentNotes}`
              : paymentTag;
          return prisma.orders.update({
            where: { id: o.id },
            data: { status, special_instructions: nextNotes, updated_at: new Date() }
          });
        })
      );
    } else {
      await prisma.orders.updateMany({
        where: { id: { in: orderIds } },
        data: { status, updated_at: new Date() }
      });
    }

    await prisma.order_items.updateMany({
      where: { order_id: { in: orderIds }, status: { not: 'cancelled' } },
      data: { status }
    });
    
    const orders = await prisma.orders.findMany({
      where: { id: { in: orderIds } },
      include: {
        tables: true,
        order_items: { include: { menu_items: true } }
      }
    });

    const updatedOrders = orders.map(this.formatOrder);
    
    for (const order of updatedOrders) {
      emitOrderStatusUpdate({ 
        type: 'status-update', 
        orderId: order.id, 
        status, 
        tableNumber: order.table_number, 
        estimatedTime: order.estimated_time, 
        timestamp: new Date().toISOString() 
      });
    }
    
    return updatedOrders;
  }

  async searchOrders(query: OrderQueryDTO) {
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
      include: {
        tables: true,
        order_items: { include: { menu_items: true } }
      },
      orderBy: { created_at: 'desc' },
      take: 50
    });
    
    return orders.map(this.formatOrder);
  }

  async trackPublicOrder(query: { phone?: string; orderNumber?: string }) {
    const phone = query.phone?.trim();
    const orderNumber = query.orderNumber?.trim();

    if (!phone && !orderNumber) {
      throw new ValidationError('Please enter your mobile phone number or order number');
    }

    const orConditions: any[] = [];

    if (orderNumber) {
      const cleanOrderNumber = orderNumber.replace(/^#/i, '').trim();
      if (cleanOrderNumber.length >= 3) {
        orConditions.push({ order_number: { equals: cleanOrderNumber, mode: 'insensitive' } });
        orConditions.push({ order_number: { contains: cleanOrderNumber, mode: 'insensitive' } });
        const numericId = parseInt(cleanOrderNumber, 10);
        if (!isNaN(numericId) && String(numericId) === cleanOrderNumber) {
          orConditions.push({ id: numericId });
        }
      }
    }

    if (phone) {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      if (cleanPhone.length >= 4) {
        orConditions.push({ special_instructions: { contains: cleanPhone } });
        if (cleanPhone.length >= 8) {
          const last8 = cleanPhone.slice(-8);
          orConditions.push({ special_instructions: { contains: last8 } });
        }
      }
    }

    if (orConditions.length === 0) {
      throw new ValidationError('Invalid order number or phone search term');
    }

    // Look for orders within the last 48 hours that are not archived
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const orders = await prisma.orders.findMany({
      where: {
        OR: orConditions,
        is_archived: false,
        created_at: { gte: twoDaysAgo }
      },
      include: {
        tables: true,
        order_items: { include: { menu_items: true } }
      },
      orderBy: { created_at: 'desc' },
      take: 10
    });

    return orders.map(this.formatOrder);
  }
}

export default new OrderService();
