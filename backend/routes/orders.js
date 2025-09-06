const express = require('express');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  getOrdersByTable,
  cancelOrder,
  getOrderPublic
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorizeRoles');

const router = express.Router();

// Public routes - No authentication required
router.route('/')
  .post(createOrder); // Anyone can create an order via QR

router.route('/table/:tableId')
  .get(getOrdersByTable); // Public access for table orders

router.route('/public/:id') // Add this public route
  .get(getOrderPublic); // Public order lookup

// Protected routes below require authentication
router.use(protect); // All routes below require authentication

router.route('/')
  .get(authorizeRoles('admin', 'kitchen', 'runner'), getOrders);

router.route('/:id')
  .get(getOrder) // Authenticated users can view their own orders
  .put(authorizeRoles('admin', 'kitchen', 'runner'), updateOrderStatus)
  .delete(authorizeRoles('admin'), cancelOrder);

module.exports = router;