/**
 * Shop Model
 * Represents a local shop registered on LocalMart
 */

const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  // Shop owner (reference to User with shopowner role)
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shopName: {
    type: String,
    required: [true, 'Shop name is required'],
    trim: true,
    maxlength: [100, 'Shop name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  // Geolocation for proximity search
  latitude: {
    type: Number,
    required: [true, 'Latitude is required']
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required']
  },
  // Business hours
  openTime: {
    type: String,
    required: [true, 'Opening time is required'],
    default: '09:00'
  },
  closeTime: {
    type: String,
    required: [true, 'Closing time is required'],
    default: '21:00'
  },
  // Shop logo image path
  logo: {
    type: String,
    default: null
  },
  // Categories this shop sells (e.g., Grocery, Pharmacy, Electronics)
  categories: [{
    type: String,
    trim: true
  }],
  phone: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Average rating
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  // Added for Premium Subscription featuring
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual to check if shop is currently open
shopSchema.virtual('isOpen').get(function() {
  const now = new Date();
  const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                      now.getMinutes().toString().padStart(2, '0');
  return currentTime >= this.openTime && currentTime <= this.closeTime;
});

// Set virtuals in JSON output
shopSchema.set('toJSON', { virtuals: true });
shopSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Shop', shopSchema);
