/**
 * Product Model
 * Represents a product listed in a shop
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    default: ''
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  // Discounted price (optional)
  discountPrice: {
    type: Number,
    default: null
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: [
      'Grocery', 'Fruits & Vegetables', 'Dairy & Eggs', 'Bakery',
      'Beverages', 'Snacks', 'Pharmacy', 'Electronics', 'Clothing',
      'Home & Kitchen', 'Personal Care', 'Stationery', 'Toys', 'Other'
    ]
  },
  // Product image path
  image: {
    type: String,
    default: null
  },
  unit: {
    type: String,
    default: 'piece', // piece, kg, g, liter, ml, pack, etc.
    trim: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual: effective price (discounted or original)
productSchema.virtual('effectivePrice').get(function() {
  return this.discountPrice || this.price;
});

// Index for text search on name and description
productSchema.index({ name: 'text', description: 'text' });

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
