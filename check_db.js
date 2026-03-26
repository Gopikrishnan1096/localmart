const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Fix Windows mongo dns issue

const uri = 'mongodb+srv://sk:skpasstoken@cluster0.zox9c.mongodb.net/localmart?retryWrites=true&w=majority&appName=Cluster0';

async function checkDb() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to DB');
    
    // Load models
    const SubscriptionPlan = require('./models/SubscriptionPlan');
    const ShopSubscription = require('./models/ShopSubscription');
    const Shop = require('./models/Shop');
    
    const shops = await Shop.find();
    console.log('Shops Count:', shops.length);
    if(shops.length > 0) {
        console.log('First shop owner:', shops[0].ownerId);
    }
    
    const plans = await SubscriptionPlan.find();
    console.log('Plans available:', plans.map(p => p.name));
    
    const subs = await ShopSubscription.find().populate('planId');
    for (const sub of subs) {
      if (!sub.planId) {
         console.error('Found a subscription with NULL planId!', sub._id, 'Shop:', sub.shopId);
      } else {
         console.log('Sub OK. Plan:', sub.planId.name, 'Shop:', sub.shopId);
      }
    }
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

checkDb();
