const mongoose = require('mongoose');

const shopSubscriptionSchema = new mongoose.Schema({
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true,
    unique: true // One active subscription mapping at a time per shop
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired', 'trialing'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null // null if indefinite or free
  },
  stripeSubscriptionId: {
    type: String, // from Stripe
    default: null
  },
  stripeCustomerId: {
    type: String, // from Stripe
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ShopSubscription', shopSubscriptionSchema);
