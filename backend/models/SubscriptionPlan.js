const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['Free', 'Basic', 'Pro Monthly', 'Pro Yearly', 'Premium Monthly', 'Premium Yearly'],
    unique: true
  },
  price: {
    type: Number,
    required: true
  },
  billingCycle: {
    type: String,
    required: true,
    enum: ['monthly', 'yearly', 'none']
  },
  productLimit: {
    type: Number, // -1 means unlimited
    required: true
  },
  features: {
    type: [String],
    default: []
  },
  stripePriceId: {
    type: String,
    // Provide a placeholder stripe price id. Admin should update later.
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
