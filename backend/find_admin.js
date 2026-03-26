require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const uri = process.env.MONGODB_URI;

async function checkAdmin() {
  try {
    await mongoose.connect(uri);
    
    // Load models
    const User = require('./models/User');
    
    let admin = await User.findOne({ role: 'admin' });
    
    if (admin) {
      console.log(`__ADMIN_FOUND__: ${admin.email}`);
      // optionally update password to admin123
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash('admin123', salt);
      await admin.save();
      console.log('__PASSWORD_RESET_TO__: admin123');
    } else {
      console.log('__ADMIN_NOT_FOUND__');
      // create admin
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      admin = await User.create({
        name: 'Super Admin',
        email: 'admin@localmart.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log(`__ADMIN_CREATED__: ${admin.email}`);
      console.log('__PASSWORD_SET_TO__: admin123');
    }
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

checkAdmin();
