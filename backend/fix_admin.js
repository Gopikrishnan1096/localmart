require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const uri = process.env.MONGODB_URI;

async function fixAdmin() {
  try {
    await mongoose.connect(uri);
    const User = require('./models/User');
    
    let admin = await User.findOne({ role: 'admin' });
    
    if (admin) {
      // The User model has a pre('save') hook that automatically hashes the password.
      // We just need to set it to plaintext 'admin123' and save.
      admin.password = 'admin123';
      await admin.save();
      console.log('Fixed admin password: it is now correctly admin123');
    } else {
      admin = await User.create({
        name: 'Super Admin',
        email: 'admin@localmart.com',
        password: 'admin123', // Will be hashed by pre('save') hook
        role: 'admin'
      });
      console.log('Created admin properly');
    }
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

fixAdmin();
