const express = require('express');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  getOrdersByTable,
  cancelOrder
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorizeRoles');

const router = express.Router();

// Public routes
router.route('/')
  .post(createOrder); // Anyone can create an order via QR

router.route('/table/:tableId')
  .get(getOrdersByTable); // Public access for table orders

// Protected routes
router.use(protect); // All routes below require authentication

router.route('/')
  .get(authorizeRoles('admin', 'kitchen', 'runner'), getOrders);

router.route('/:id')
  .get(authorizeRoles('admin', 'kitchen', 'runner'), getOrder);

router.route('/:id/status')
  .put(authorizeRoles('admin', 'kitchen', 'runner'), updateOrderStatus);

router.route('/:id/cancel')
  .put(authorizeRoles('admin', 'customer'), cancelOrder);

module.exports = router;