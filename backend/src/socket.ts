import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import logger from './utils/logger';
import config from './config/env';

let io: Server;

export const initSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: config.ALLOWED_ORIGINS,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      // Allow connections for tables (QR code ordering) without token
      // but they will join a different namespace/room
      const isTable = socket.handshake.query.type === 'table';
      if (isTable) {
        socket.data.isTable = true;
        socket.data.tableNumber = socket.handshake.query.tableNumber;
        return next();
      }
      return next(new Error('Authentication required'));
    }

    try {
      if (!config.JWT_SECRET) throw new Error('JWT_SECRET missing');
      const user = jwt.verify(token, config.JWT_SECRET);
      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`🔌 Client connected: ${socket.id}`);

    // Join specific rooms based on user role or table
    if (socket.data.isTable) {
      socket.join(`table_${socket.data.tableNumber}`);
      logger.info(`📱 Table ${socket.data.tableNumber} connected`);
    } else if (socket.data.user) {
      const { role } = socket.data.user as { role: string };
      socket.join(`role_${role}`);
      socket.join('staff'); // All authenticated staff
      logger.info(`👨‍🍳 Staff connected (Role: ${role})`);
    }

    // Handle order events
    socket.on('new-order', (orderData) => {
      logger.info(`📝 New order received from table ${orderData.tableNumber}`);
      // Notify kitchen and reception
      io.to('role_kitchen').to('role_reception').emit('order-created', orderData);
    });

    socket.on('order-status-update', (data) => {
      logger.info(`🔄 Order ${data.orderId} status updated to ${data.status}`);
      // Notify the specific table if they're connected
      if (data.tableNumber) {
        io.to(`table_${data.tableNumber}`).emit('order-status-changed', data);
      }
      // Notify other staff
      socket.to('staff').emit('order-status-changed', data);
    });
    
    socket.on('new-items-added', (data) => {
      logger.info(`➕ New items added to order for table ${data.tableNumber}`);
      // Notify kitchen about new items to prepare
      io.to('role_kitchen').to('role_reception').emit('items-added', data);
    });

    // Handle reservation events
    socket.on('new-reservation', (data) => {
      logger.info(`📅 New reservation created`);
      io.to('role_reception').to('role_admin').emit('reservation-created', data);
    });

    // Need assistance/call waiter
    socket.on('call-waiter', (data) => {
      logger.info(`🛎️ Table ${data.tableNumber} called a waiter`);
      io.to('role_waiter').to('role_reception').emit('waiter-called', data);
    });

    // Request bill
    socket.on('request-bill', (data) => {
      logger.info(`💰 Table ${data.tableNumber} requested the bill`);
      io.to('role_waiter').to('role_reception').emit('bill-requested', data);
    });

    socket.on('disconnect', () => {
      logger.info(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

export const emitNewOrder = (orderData: any): void => {
  if (io) {
    io.to('role_kitchen').to('role_reception').emit('order-created', orderData);
  }
};

export const emitOrderStatusUpdate = (data: any): void => {
  if (io) {
    if (data.tableNumber) {
      io.to(`table_${data.tableNumber}`).emit('order-status-changed', data);
    }
    io.to('staff').emit('order-status-changed', data);
  }
};

export const emitNewItemsAdded = (data: any): void => {
  if (io) {
    io.to('role_kitchen').to('role_reception').emit('items-added', data);
  }
};

export const emitReservationUpdate = (data: any): void => {
  if (io) {
    io.to('role_reception').to('role_admin').emit('reservation-updated', data);
  }
};