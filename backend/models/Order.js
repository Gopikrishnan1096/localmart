/**
 * Order Model
 * Represents a customer order from a shop
 */

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  // Snapshot of products at time of order (in case products change later)
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    productName: { type: String, required: true },
    productImage: { type: String, default: null },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  // Delivery address snapshot
  deliveryAddress: {
    type: String,
    required: true
  },
  // Order status lifecycle
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Packed', 'Out for Delivery', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  // Status history for tracking
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }],
  paymentMethod: {
    type: String,
    enum: ['Cash on Delivery', 'Online'],
    default: 'Cash on Delivery'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Refunded'],
    default: 'Pending'
  },
  notes: {
    type: String,
    maxlength: 300,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add status history entry on status change
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date()
    });
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
