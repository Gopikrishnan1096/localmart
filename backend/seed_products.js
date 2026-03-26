require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const Shop = require('./models/Shop');
const Product = require('./models/Product');

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the shop (case-insensitive search for 'gk store' or 'gk')
    const shop = await Shop.findOne({ shopName: { $regex: /gk/i } });
    
    if (!shop) {
      console.log('Shop with "gk" in the name not found.');
      process.exit(1);
    }

    console.log(`Found shop: ${shop.shopName} (ID: ${shop._id})`);

    const dummyProducts = [];
    for (let i = 1; i <= 20; i++) {
        dummyProducts.push({
            shopId: shop._id,
            name: `Test Product ${i}`,
            description: `This is an automated test product ${i} to reach the subscription limit.`,
            price: Math.floor(Math.random() * 500) + 50,
            stock: 100,
            category: 'Grocery',
            unit: 'piece',
            isAvailable: true
        });
    }

    await Product.insertMany(dummyProducts);
    console.log(`Successfully added 20 products to ${shop.shopName}`);

    // Verify
    const count = await Product.countDocuments({ shopId: shop._id });
    console.log(`Total products for ${shop.shopName} now: ${count}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();
