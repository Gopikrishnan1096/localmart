/**
 * Subscription Controller
 * Handles Stripe Checkout, Webhooks, and Status
 */
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_replace_me');

const SubscriptionPlan = require('../models/SubscriptionPlan');
const ShopSubscription = require('../models/ShopSubscription');
const Payment = require('../models/Payment');
const Shop = require('../models/Shop');

// Seed default plans if none exist or update missing ones
const seedPlans = async () => {
  const plansToSeed = [
    { 
      name: 'Free', price: 0, billingCycle: 'none', productLimit: 20, 
      features: ['20 Products max', 'Basic shop dashboard', 'Order management'] 
    },
    { 
      name: 'Basic', price: 199, billingCycle: 'monthly', productLimit: 100, 
      features: ['100 Products max', 'Basic shop dashboard', 'Order management'] 
    },
    { 
      name: 'Pro Monthly', price: 499, billingCycle: 'monthly', productLimit: -1, 
      features: ['Unlimited Products', 'Priority Support', 'Order management'] 
    },
    { 
      name: 'Pro Yearly', price: 4999, billingCycle: 'yearly', productLimit: -1, 
      features: ['Unlimited Products', 'Priority Support', 'Save ₹989/year'] 
    },
    { 
      name: 'Premium Monthly', price: 999, billingCycle: 'monthly', productLimit: -1, 
      features: ['Unlimited Products', 'Featured Shop Status', 'Advanced Analytics'] 
    },
    { 
      name: 'Premium Yearly', price: 9999, billingCycle: 'yearly', productLimit: -1, 
      features: ['Unlimited Products', 'Featured Shop Status', 'Advanced Analytics', 'Save ₹1989/year'] 
    }
  ];

  for (const planData of plansToSeed) {
    await SubscriptionPlan.findOneAndUpdate(
      { name: planData.name },
      planData,
      { upsert: true, new: true }
    );
  }
  console.log('Subscription Plans Seeded & Updated.');
};
seedPlans();

// @desc    Get Subscription Status & Limit
// @route   GET /api/subscriptions/status
// @access  Private (shopowner)
const getSubscriptionStatus = async (req, res) => {
  try {
    console.log('--- ENTER getSubscriptionStatus ---', req.user.id);
    const shop = await Shop.findOne({ ownerId: req.user.id });
    if (!shop) {
        console.log('Shop not found for user:', req.user.id);
        return res.status(404).json({ success: false, message: 'Shop not found' });
    }
    console.log('Shop found:', shop._id);

    let subscription = await ShopSubscription.findOne({ shopId: shop._id })
      .populate('planId');

    console.log('Existing subscription:', subscription ? 'YES' : 'NO');

    // If no subscription, assign Free plan automatically
    if (!subscription) {
      const freePlan = await SubscriptionPlan.findOne({ name: 'Free' });
      console.log('Free plan found:', freePlan ? freePlan._id : 'NULL');
      subscription = await ShopSubscription.create({
        shopId: shop._id,
        planId: freePlan._id,
        status: 'active'
      });
      subscription = await ShopSubscription.findOne({ shopId: shop._id }).populate('planId');
      console.log('New subscription created:', subscription ? 'YES' : 'NO');
    }

    console.log('Populated Plan ID:', subscription.planId ? subscription.planId._id : 'NULL');
    if (!subscription.planId) {
        console.error('PlanId is null on subscription!', subscription);
    }

    // Check product count
    const Product = require('../models/Product');
    const productCount = await Product.countDocuments({ shopId: shop._id });

    res.status(200).json({
      success: true,
      data: {
        plan: subscription.planId.name,
        productLimit: subscription.planId.productLimit,
        productsUsed: productCount,
        status: subscription.status,
        endDate: subscription.endDate
      }
    });
  } catch (error) {
    console.error('Subscription Status Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create Stripe Checkout Session
// @route   POST /api/subscriptions/create-checkout-session
// @access  Private (shopowner)
const createCheckoutSession = async (req, res) => {
  try {
    const { planId } = req.body; // Submitting the target planId (from DB)
    
    // Validations
    const shop = await Shop.findOne({ ownerId: req.user.id });
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan || plan.price === 0) {
      return res.status(400).json({ success: false, message: 'Invalid plan for checkout' });
    }

    // Use Stripe Prices if provided, otherwise create dynamic inline price for session
    // For simple integration, we'll create a session with inline price data
    const sessionUrl = process.env.SHOP_DASHBOARD_URL || 'http://localhost:3001';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription', // Since it's monthly/yearly
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `LocalMart - ${plan.name} Plan`,
              description: `Unlimited products for your shop: ${shop.shopName}`
            },
            unit_amount: plan.price * 100, // Stripe expects paise for INR
            recurring: {
              interval: plan.billingCycle === 'monthly' ? 'month' : 'year',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        shopId: shop._id.toString(),
        planId: plan._id.toString()
      },
      success_url: `${sessionUrl}/settings/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${sessionUrl}/settings/subscription?canceled=true`,
    });

    res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    console.error('Create Checkout Error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// @desc    Stripe Webhook (handled with raw body)
// @route   POST /api/subscriptions/webhook
// @access  Public
const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    // Note: req.body MUST be raw buffer here. Configured in server.js
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Process subscription
    const shopId = session.metadata.shopId;
    const planId = session.metadata.planId;
    const stripeSubscriptionId = session.subscription;
    const stripeCustomerId = session.customer;

    if (shopId && planId) {
      // Create Payment Record
      await Payment.create({
        shopId,
        amount: session.amount_total / 100,
        currency: session.currency,
        paymentGateway: 'stripe',
        paymentStatus: 'completed',
        transactionId: session.id
      });

      // Check if plan is Premium to apply featured status
      const subscribedPlan = await SubscriptionPlan.findById(planId);
      const isPremium = subscribedPlan && subscribedPlan.name.includes('Premium');

      // Update Shop's active subscription
      await ShopSubscription.findOneAndUpdate(
        { shopId },
        {
          planId,
          status: 'active',
          stripeSubscriptionId,
          stripeCustomerId,
          startDate: Date.now(),
          // endDate null because Stripe handles recurring. Webhooks will handle failures.
        },
        { upsert: true, new: true }
      );

      // Update Shop featured status based on plan
      await Shop.findByIdAndUpdate(shopId, { 
        isFeatured: isPremium 
      });

      console.log(`Subscription activated for shop ${shopId}. Featured: ${isPremium}`);
    }
  }

  // Handle subscription cancellations/failures
  if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.past_due') {
      const subscription = event.data.object;
      
      // Fallback to Free Plan or mark "past_due"
      const status = event.type === 'customer.subscription.deleted' ? 'canceled' : 'past_due';
      
      const updatedSub = await ShopSubscription.findOneAndUpdate(
        { stripeSubscriptionId: subscription.id },
        { status },
        { new: true }
      );

      // Revoke featured status if subscription is canceled/past due
      if (updatedSub && status !== 'active') {
          await Shop.findByIdAndUpdate(updatedSub.shopId, {
              isFeatured: false
          });
      }

      console.log(`Subscription ${status} for ${subscription.id}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
};

// @desc    Cancel Subscription
// @route   POST /api/subscriptions/cancel
// @access  Private (shopowner)
const cancelSubscription = async (req, res) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user.id });
    const sub = await ShopSubscription.findOne({ shopId: shop._id });

    if (!sub || !sub.stripeSubscriptionId) {
      return res.status(400).json({ success: false, message: 'No active Stripe subscription found.' });
    }

    // Cancel at period end
    await stripe.subscriptions.update(
      sub.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    res.status(200).json({ success: true, message: 'Subscription will be canceled at the end of the billing cycle.' });
  } catch (error) {
     console.error('Cancel Subscription Error:', error);
     res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// @desc    Get all available plans (for UI)
// @route   GET /api/subscriptions/plans
// @access  Public
const getPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find().sort('price');
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getSubscriptionStatus,
  createCheckoutSession,
  stripeWebhook,
  cancelSubscription,
  getPlans
};
