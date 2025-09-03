const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a menu item name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['starter', 'main', 'dessert', 'drink', 'side'] // Example categories
  },
  imageUrl: {
    type: String,
    default: '/images/default-food.jpg'
  },
  ingredients: {
    type: [String] // Array of ingredients
  },
  isVegetarian: {
    type: Boolean,
    default: false
  },
  isVegan: {
    type: Boolean,
    default: false
  },
  hasDairy: {
    type: Boolean,
    default: false
  },
  hasNuts: {
    type: Boolean,
    default: false
  },
  availability: {
    type: Boolean,
    default: true
  },
  preparationTime: {
    type: Number, // Time in minutes
    default: 15
  }
}, {
  timestamps: true
});

// Virtual for getting full image URL
menuItemSchema.virtual('imageUrlFull').get(function() {
  if (this.imageUrl && !this.imageUrl.startsWith('http')) {
    return `${process.env.BACKEND_URL || 'http://localhost:5000'}${this.imageUrl}`;
  }
  return this.imageUrl;
});

// Ensure virtuals are included when converting to JSON
menuItemSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);