const { Server } = require('socket.io');
const config = require('./config/env');

let ioInstance = null;

const initializeSocket = (server) => {
  // CORS configuration for socket.io - allow multiple origins
  const allowedOrigins = [
    config.CLIENT_URL,
    'http://localhost:3000',
    'https://localhost:3000',
    'https://sangeet-restaurant-testing-frontend.vercel.app',
    /https:\/\/.*\.onrender\.com$/,
    /https:\/\/.*\.vercel\.app$/,
    /https:\/\/.*\.netlify\.app$/
  ];

  const io = new Server(server, {
    cors: {
      origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        const isAllowed = allowedOrigins.some(allowedOrigin => {
          if (typeof allowedOrigin === 'string') {
            return allowedOrigin === origin;
          } else if (allowedOrigin instanceof RegExp) {
            return allowedOrigin.test(origin);
          }
          return false;
        });
        
        if (isAllowed) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ["GET", "POST"]
    }
  });

  ioInstance = io;

  io.on('connection', (socket) => {
    // Join admin room for order notifications
    socket.on('join-admin', () => {
      socket.join('admin-room');
    });

    // Join kitchen room for order notifications
    socket.on('join-kitchen', () => {
      socket.join('kitchen-room');
    });

    // Join customer room for order tracking
    socket.on('join-customer', (orderId) => {
      socket.join(`customer-${orderId}`);
    });

    // Join table room for all table orders
    socket.on('join-table', (tableNumber) => {
      socket.join(`table-${tableNumber}`);
    });
  });

  return io;
};

// Emit new order notification
const emitNewOrder = (orderData) => {
  if (ioInstance) {
    // Send the order data directly to match frontend expectations
    ioInstance.to('admin-room').to('kitchen-room').emit('new-order', orderData);
  }
};

// Emit order status update
const emitOrderStatusUpdate = (orderId, status, tableNumber = null, estimatedTime = null) => {
  if (ioInstance) {
    const updateData = {
      type: 'status-update',
      orderId: Number(orderId),
      status,
      tableNumber: tableNumber ? String(tableNumber) : null,
      estimatedTime,
      timestamp: new Date().toISOString()
    };

    // Send to admin and kitchen
    ioInstance.to('admin-room').to('kitchen-room').emit('order-status-update', updateData);
    
    // Send to customer room
    ioInstance.to(`customer-${orderId}`).emit('order-status-update', updateData);
    
    // Send to table room
    if (tableNumber) {
      ioInstance.to(`table-${tableNumber}`).emit('order-status-update', updateData);
    }
  }
};

// Emit new items added to existing order
const emitNewItemsAdded = (orderId, newItems, tableNumber = null) => {
  if (ioInstance) {
    const updateData = {
      type: 'new-items-added',
      orderId: Number(orderId),
      newItems,
      tableNumber: tableNumber ? String(tableNumber) : null,
      timestamp: new Date().toISOString()
    };

    // Send to kitchen for immediate attention
    ioInstance.to('kitchen-room').emit('new-items-added', updateData);
    
    // Send to admin
    ioInstance.to('admin-room').emit('new-items-added', updateData);
  }
};

// Emit order completion
const emitOrderCompleted = (orderId) => {
  if (ioInstance) {
    ioInstance.to('admin-room').to('kitchen-room').emit('order-completed', {
      type: 'order-completed',
      orderId,
      timestamp: new Date().toISOString(),
      sound: 'completion.mp3'
    });
  }
};

// Emit order cancellation
const emitOrderCancelled = (orderId, reason) => {
  if (ioInstance) {
    ioInstance.to('admin-room').to('kitchen-room').emit('order-cancelled', {
      type: 'order-cancelled',
      orderId,
      reason,
      timestamp: new Date().toISOString()
    });
  }
};

// Emit order deletion notification
const emitOrderDeleted = (orderId, tableNumber) => {
  if (ioInstance) {
    // Send to admin and kitchen
    ioInstance.to('admin-room').to('kitchen-room').emit('order-deleted', {
      type: 'order-deleted',
      orderId,
      tableNumber,
      timestamp: new Date().toISOString()
    });
    
    // Send to specific table room to clear cart data
    if (tableNumber) {
      ioInstance.to(`table-${tableNumber}`).emit('order-deleted', {
        type: 'order-deleted',
        orderId,
        tableNumber,
        timestamp: new Date().toISOString()
      });
    }
  }
};

module.exports = {
  initializeSocket,
  emitNewOrder,
  emitOrderStatusUpdate,
  emitNewItemsAdded,
  emitOrderCompleted,
  emitOrderCancelled,
  emitOrderDeleted
};