const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Order',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['card', 'cash'] // Assuming online (card) or maybe later at-table cash payment
  },
  paymentProvider: {
    type: String, // e.g., 'stripe', 'razorpay'
    required: true
  },
  providerPaymentId: {
    type: String // The transaction ID from the payment gateway
  },
  status: {
    type: String,
    enum: ['created', 'authorized', 'captured', 'failed', 'refunded'],
    default: 'created'
  },
  customerEmail: {
    type: String
  },
  receiptUrl: {
    type: String // Link to the digital receipt from the payment gateway
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);