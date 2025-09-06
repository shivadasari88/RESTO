const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  specialInstructions: {
    type: String,
    maxlength: 200
  },
  price: { // Snapshot of price at time of order
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  tableId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Table',
    required: true
  },
  // We can also store a session ID for customers who haven't logged in
  customerSessionId: {
    type: String
  },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: ['placed', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'placed'
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  preparationNote: {
    type: String // For kitchen staff
  },
  placedAt: {
    type: Date,
    default: Date.now
  },
  // Timestamps for tracking performance
  preparedAt: {
    type: Date
  },
  readyAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Calculate total amount before saving
orderSchema.pre('save', function(next) {
  if (this.isModified('items') && this.items.length > 0) {
    this.totalAmount = this.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }
  next();
});

// Add index for better query performance
orderSchema.index({ tableId: 1, status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Order', orderSchema);