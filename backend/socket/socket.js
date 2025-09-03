const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Order = require('../models/Order');

// Store connected users by role and socket ID
const connectedUsers = {
  admin: new Set(),
  kitchen: new Set(),
  runner: new Set(),
  customer: new Set()
};

const configureSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });

  // Socket.IO middleware for authentication
  io.use(async (socket, next) => {
    try {
      // Check for token in handshake or query
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (!token) {
        // Allow anonymous connections (for customers)
        socket.user = { role: 'customer' };
        return next();
      }

      // Verify token for authenticated users
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user || !user.isActive) {
        return next(new Error('Authentication error'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id} (Role: ${socket.user.role})`);

    // Add user to connected users list based on role
    if (socket.user.role && connectedUsers[socket.user.role]) {
      connectedUsers[socket.user.role].add(socket.id);
      
      // Join role-specific room
      socket.join(socket.user.role);
    }

    // Join table room for customers (if they have a table ID)
    const tableId = socket.handshake.query.tableId;
    if (tableId && socket.user.role === 'customer') {
      socket.join(`table-${tableId}`);
      console.log(`Customer joined table room: table-${tableId}`);
    }

    // Handle order status updates from staff
    socket.on('updateOrderStatus', async (data) => {
      try {
        const { orderId, status } = data;
        
        // Verify user has permission to update orders
        if (!['admin', 'kitchen', 'runner'].includes(socket.user.role)) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        // Update order in database
        const order = await Order.findById(orderId)
          .populate('tableId', 'tableNumber')
          .populate('items.menuItemId', 'name price');

        if (!order) {
          socket.emit('error', { message: 'Order not found' });
          return;
        }

        // Update status with role-based validation
        if (socket.user.role === 'kitchen' && !['preparing', 'ready'].includes(status)) {
          socket.emit('error', { message: 'Kitchen can only set status to preparing or ready' });
          return;
        }

        if (socket.user.role === 'runner' && status !== 'delivered') {
          socket.emit('error', { message: 'Runner can only set status to delivered' });
          return;
        }

        order.status = status;
        
        // Set timestamps
        if (status === 'preparing') order.preparedAt = new Date();
        if (status === 'ready') order.readyAt = new Date();
        if (status === 'delivered') order.deliveredAt = new Date();

        await order.save();

        // Broadcast to all relevant parties
        io.to('admin').to('kitchen').to('runner').emit('orderStatusUpdated', order);
        
        // Notify specific table room
        io.to(`table-${order.tableId._id}`).emit('orderStatusUpdated', order);

        console.log(`Order ${orderId} status updated to ${status} by ${socket.user.role}`);

      } catch (error) {
        console.error('Socket order update error:', error);
        socket.emit('error', { message: 'Failed to update order' });
      }
    });

    // Handle kitchen accepting an order
    socket.on('acceptOrder', async (orderId) => {
      if (socket.user.role !== 'kitchen') {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      try {
        const order = await Order.findById(orderId);
        if (order && order.status === 'placed') {
          order.status = 'preparing';
          order.preparedAt = new Date();
          await order.save();

          // Notify everyone
          io.emit('orderAccepted', { orderId, acceptedBy: socket.user.name });
        }
      } catch (error) {
        console.error('Accept order error:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      
      // Remove from connected users
      if (socket.user.role && connectedUsers[socket.user.role]) {
        connectedUsers[socket.user.role].delete(socket.id);
      }
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
};

// Helper function to emit events from controllers
const emitOrderEvent = (io, event, data) => {
  io.emit(event, data);
};

module.exports = { configureSocket, connectedUsers, emitOrderEvent };