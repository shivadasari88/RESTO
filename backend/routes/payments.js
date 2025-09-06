const express = require('express');
const router = express.Router();
const {
  createPayment,
  paymentCallback,
  paymentWebhook,
  checkPaymentStatus,
  getPaymentDetails
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorizeRoles');

// ===== PUBLIC ROUTES =====
// PhonePe webhook
router.post('/webhook', paymentWebhook);

// Payment callback
router.get('/callback', paymentCallback);

// Create payment
router.post('/create', createPayment);

// Check payment status
router.get('/status/:orderId', checkPaymentStatus);

// ===== PROTECTED ADMIN ROUTES =====
// Get payment details by ID
router.get('/admin/:id', protect, authorizeRoles('admin'), getPaymentDetails);

router.post('/test', (req, res) => {
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  res.json({ body: req.body, headers: req.headers });
});

module.exports = router;