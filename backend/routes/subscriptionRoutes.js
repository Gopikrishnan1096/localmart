const express = require('express');
const router = express.Router();

const {
  getSubscriptionStatus,
  createCheckoutSession,
  stripeWebhook,
  cancelSubscription,
  getPlans
} = require('../controllers/subscriptionController');
const { protect, authorize } = require('../middleware/auth');

// Public route for Plans
router.get('/plans', getPlans);

// Shopowner routes
router.get('/status', protect, authorize('shopowner'), getSubscriptionStatus);
router.post('/create-checkout-session', protect, authorize('shopowner'), createCheckoutSession);
router.post('/cancel', protect, authorize('shopowner'), cancelSubscription);

// Webhook must be excluded from JSON parsing usually, 
// so it is handled natively here but requires `express.raw` at server.js level.
// We'll map the route here, but standard app.use(express.json()) in server.js will break Stripe sigs. 
// We will move the webhook definition to server.js before the express.json() middleware.

module.exports = router;
