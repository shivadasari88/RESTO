const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all orders (with filtering)
// @route   GET /api/orders
// @access  Private (Admin, Kitchen, Runner)
const getOrders = asyncHandler(async (req, res, next) => {
  // Check user role and filter accordingly
  let filter = {};
  
  if (req.user.role === 'kitchen') {
    // Kitchen staff only sees orders that are placed or preparing
    filter.status = { $in: ['placed', 'preparing'] };
  } else if (req.user.role === 'runner') {
    // Runner staff only sees orders that are ready
    filter.status = 'ready';
  }
  // Admin can see all orders

  const orders = await Order.find(filter)
    .populate('tableId', 'tableNumber')
    .populate('items.menuItemId', 'name price')
    .sort({ createdAt: -1 }); // Newest first

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private (User who created it or staff)
const getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('tableId', 'tableNumber')
    .populate('items.menuItemId', 'name price description');

  if (!order) {
    return next(new ApiError(404, `Order not found with id of ${req.params.id}`));
  }

  // Check if user has access to this order
  // Staff can see any order, customers can only see their own (via session)
  if (req.user.role === 'customer' && order.customerSessionId !== req.sessionID) {
    return next(new ApiError(403, 'Not authorized to access this order'));
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Public (Anyone can create an order via QR code)
const createOrder = asyncHandler(async (req, res, next) => {
  const { tableId, items, specialInstructions } = req.body;

  // Validate required fields
  if (!tableId || !items || items.length === 0) {
    return next(new ApiError(400, 'Table ID and items are required'));
  }

  // Verify table exists
  const table = await Table.findById(tableId);
  if (!table) {
    return next(new ApiError(404, `Table not found with id of ${tableId}`));
  }

  // Process order items and calculate total
  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const menuItem = await MenuItem.findById(item.menuItemId);
    
    if (!menuItem) {
      return next(new ApiError(404, `Menu item not found with id of ${item.menuItemId}`));
    }

    if (!menuItem.availability) {
      return next(new ApiError(400, `Menu item ${menuItem.name} is not available`));
    }

    orderItems.push({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      specialInstructions: item.specialInstructions,
      price: menuItem.price
    });

    totalAmount += menuItem.price * item.quantity;
  }

  // Create order
  const order = await Order.create({
    tableId,
    items: orderItems,
    totalAmount,
    customerSessionId: req.sessionID, // For anonymous customers
    preparationNote: specialInstructions
  });

  // Populate the created order for response
  const populatedOrder = await Order.findById(order._id)
    .populate('tableId', 'tableNumber')
    .populate('items.menuItemId', 'name price');

  // Set table as occupied
  table.isOccupied = true;
  await table.save();

  // Emit real-time event (we'll implement this in Socket.io module)
  // req.app.get('io').emit('newOrder', populatedOrder);

  res.status(201).json({
    success: true,
    data: populatedOrder
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Kitchen, Runner, Admin)
const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ['placed', 'preparing', 'ready', 'delivered', 'cancelled'];

  if (!status || !validStatuses.includes(status)) {
    return next(new ApiError(400, 'Valid status is required'));
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ApiError(404, `Order not found with id of ${req.params.id}`));
  }

  // Check if user has permission to make this status change
  if (req.user.role === 'kitchen' && !['preparing', 'ready'].includes(status)) {
    return next(new ApiError(403, 'Kitchen staff can only update status to preparing or ready'));
  }

  if (req.user.role === 'runner' && status !== 'delivered') {
    return next(new ApiError(403, 'Runner staff can only update status to delivered'));
  }

  // Update status and set timestamps
  order.status = status;
  
  if (status === 'preparing') {
    order.preparedAt = new Date();
  } else if (status === 'ready') {
    order.readyAt = new Date();
  } else if (status === 'delivered') {
    order.deliveredAt = new Date();
    // Free up the table when order is delivered
    const table = await Table.findById(order.tableId);
    if (table) {
      table.isOccupied = false;
      await table.save();
    }
  }

  await order.save();

  // Populate for response
  const populatedOrder = await Order.findById(order._id)
    .populate('tableId', 'tableNumber')
    .populate('items.menuItemId', 'name price');

  // Emit real-time event
  // req.app.get('io').emit('orderStatusUpdated', populatedOrder);

  res.status(200).json({
    success: true,
    data: populatedOrder
  });
});

// @desc    Get orders for a specific table
// @route   GET /api/orders/table/:tableId
// @access  Public (For table-specific order viewing)
const getOrdersByTable = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ 
    tableId: req.params.tableId,
    status: { $ne: 'delivered' } // Only show active orders
  })
  .populate('tableId', 'tableNumber')
  .populate('items.menuItemId', 'name price')
  .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private (Admin, or customer within time limit)
const cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ApiError(404, `Order not found with id of ${req.params.id}`));
  }

  // Check if order can be cancelled (only placed orders can be cancelled)
  if (order.status !== 'placed') {
    return next(new ApiError(400, 'Only placed orders can be cancelled'));
  }

  // Check if it's within cancellation time (e.g., 5 minutes)
  const timeSinceOrder = new Date() - order.createdAt;
  const fiveMinutes = 5 * 60 * 1000;

  if (timeSinceOrder > fiveMinutes && req.user.role !== 'admin') {
    return next(new ApiError(400, 'Cancellation time has expired. Please contact staff.'));
  }

  order.status = 'cancelled';
  await order.save();

  // Free up the table
  const table = await Table.findById(order.tableId);
  if (table) {
    table.isOccupied = false;
    await table.save();
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  getOrdersByTable,
  cancelOrder
};