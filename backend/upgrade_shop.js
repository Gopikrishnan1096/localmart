require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const Shop = require('./models/Shop');
const ShopSubscription = require('./models/ShopSubscription');
const SubscriptionPlan = require('./models/SubscriptionPlan');
const Product = require('./models/Product');

const upgradeShop = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the shop
    const shop = await Shop.findOne({ shopName: { $regex: /gk/i } });
    if (!shop) {
      console.log('Shop with "gk" in the name not found.');
      process.exit(1);
    }

    // Find the Pro Monthly plan
    const proPlan = await SubscriptionPlan.findOne({ name: 'Pro Monthly' });
    if (!proPlan) {
        console.log('Pro Monthly plan not found in DB.');
        process.exit(1);
    }

    // Update the subscription
    await ShopSubscription.findOneAndUpdate(
        { shopId: shop._id },
        { 
            planId: proPlan._id,
            status: 'active',
            startDate: new Date()
        },
        { upsert: true }
    );

    console.log(`Successfully upgraded ${shop.shopName} to ${proPlan.name} plan!`);

    // Add exactly 1 more product to make it 22 products total (proving limit > 20 works)
    const newProduct = new Product({
        shopId: shop._id,
        name: `Test Product Premium`,
        description: `This product was added AFTER the pro plan upgrade!`,
        price: 999,
        stock: 50,
        category: 'Electronics',
        unit: 'piece',
        isAvailable: true
    });
    
    await newProduct.save();
    console.log(`Successfully added a new Premium product to ${shop.shopName}`);

    const count = await Product.countDocuments({ shopId: shop._id });
    console.log(`Total products for ${shop.shopName} now: ${count}`);

    process.exit(0);
  } catch (error) {
    console.error('Error upgrading shop:', error);
    process.exit(1);
  }
};

upgradeShop();
