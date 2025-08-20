const { Server } = require('socket.io');

let io;

const initializeSocket = (server) => {
  // CORS configuration for socket.io - allow multiple origins
  const allowedOrigins = [
    process.env.CLIENT_URL || "http://localhost:3000",
    'http://localhost:3000',
    'https://localhost:3000',
    'https://sangeet-restaurant-testing-frontend.vercel.app',
    /https:\/\/.*\.onrender\.com$/,
    /https:\/\/.*\.vercel\.app$/,
    /https:\/\/.*\.netlify\.app$/
  ];

  io = new Server(server, {
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

  // Make io globally available for other modules
  global.io = io;

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
  const socketIo = global.io || io;
  
  if (socketIo) {
    // Send the order data directly to match frontend expectations
    socketIo.to('admin-room').to('kitchen-room').emit('new-order', orderData);
  }
};

// Emit order status update
const emitOrderStatusUpdate = (orderId, status, tableNumber = null, estimatedTime = null) => {
  const socketIo = global.io || io;
  if (socketIo) {
    const updateData = {
      type: 'status-update',
      orderId: Number(orderId),
      status,
      tableNumber: tableNumber ? String(tableNumber) : null,
      estimatedTime,
      timestamp: new Date().toISOString()
    };

    // Send to admin and kitchen
    socketIo.to('admin-room').to('kitchen-room').emit('order-status-update', updateData);
    
    // Send to customer room
    socketIo.to(`customer-${orderId}`).emit('order-status-update', updateData);
    
    // Send to table room
    if (tableNumber) {
      socketIo.to(`table-${tableNumber}`).emit('order-status-update', updateData);
    }
  }
};

// Emit new items added to existing order
const emitNewItemsAdded = (orderId, newItems, tableNumber = null) => {
  const socketIo = global.io || io;
  if (socketIo) {
    const updateData = {
      type: 'new-items-added',
      orderId: Number(orderId),
      newItems,
      tableNumber: tableNumber ? String(tableNumber) : null,
      timestamp: new Date().toISOString()
    };

    // Send to kitchen for immediate attention
    socketIo.to('kitchen-room').emit('new-items-added', updateData);
    
    // Send to admin
    socketIo.to('admin-room').emit('new-items-added', updateData);
  }
};

// Emit order completion
const emitOrderCompleted = (orderId) => {
  const socketIo = global.io || io;
  if (socketIo) {
    socketIo.to('admin-room').to('kitchen-room').emit('order-completed', {
      type: 'order-completed',
      orderId,
      timestamp: new Date().toISOString(),
      sound: 'completion.mp3'
    });
  }
};

// Emit order cancellation
const emitOrderCancelled = (orderId, reason) => {
  const socketIo = global.io || io;
  if (socketIo) {
    socketIo.to('admin-room').to('kitchen-room').emit('order-cancelled', {
      type: 'order-cancelled',
      orderId,
      reason,
      timestamp: new Date().toISOString()
    });
  }
};

// Emit order deletion notification
const emitOrderDeleted = (orderId, tableNumber) => {
  const socketIo = global.io || io;
  if (socketIo) {
    // Send to admin and kitchen
    socketIo.to('admin-room').to('kitchen-room').emit('order-deleted', {
      type: 'order-deleted',
      orderId,
      tableNumber,
      timestamp: new Date().toISOString()
    });
    
    // Send to specific table room to clear cart data
    if (tableNumber) {
      socketIo.to(`table-${tableNumber}`).emit('order-deleted', {
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