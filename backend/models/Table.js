const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: String,
    required: [true, 'Please add a table number'],
    unique: true
  },
  qrCode: {
    type: String, // This will store a unique identifier for the QR code (e.g., a UUID or the tableNumber itself)
    unique: true
  },
  isOccupied: {
    type: Boolean,
    default: false
  },
  capacity: {
    type: Number,
    required: [true, 'Please add table capacity']
  }
}, {
  timestamps: true
});

// Generate a simple QR code string based on tableNumber before saving
tableSchema.pre('save', function(next) {
  if (!this.qrCode) {
    // This creates a simple identifier. In production, you might use a UUID.
    this.qrCode = `table-${this.tableNumber}`;
  }
  next();
});

// Method to check if table is available
tableSchema.methods.isAvailable = function() {
  return !this.isOccupied;
};

// Static method to find available tables
tableSchema.statics.findAvailable = function() {
  return this.find({ isOccupied: false });
};

module.exports = mongoose.model('Table', tableSchema);