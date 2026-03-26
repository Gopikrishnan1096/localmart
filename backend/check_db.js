require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const uri = process.env.MONGODB_URI;

async function checkDb() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to DB');
    
    // Load models relative to backend/
    const SubscriptionPlan = require('./models/SubscriptionPlan');
    const ShopSubscription = require('./models/ShopSubscription');
    const User = require('./models/User');
    const shops = await Shop.find();
    
    let output = `Shops count: ${shops.length}\n`;
    const shopOwners = new Set(shops.map(s => s.ownerId.toString()));
    
    const users = await User.find({ role: 'shopowner' });
    output += `Shopowner users count: ${users.length}\n`;
    
    for (const u of users) {
      if (!shopOwners.has(u._id.toString())) {
         output += `User ${u.name} (${u.email}) [ID: ${u._id}] has NO Shop!\n`;
      } else {
         output += `User ${u.name} (${u.email}) has a Shop.\n`;
      }
    }
    
    const fs = require('fs');
    fs.writeFileSync('db_check_results.txt', output);
    console.log('Results written');
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

checkDb();
