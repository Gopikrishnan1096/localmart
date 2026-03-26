require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGODB_URI;

const shopData = [
  {"name":"Fresh Mart Kakkanad","area":"Kakkanad","rating":4.2,"category":"Grocery","delivery":true},
  {"name":"Daily Needs Store","area":"Edappally","rating":4.4,"category":"Supermarket","delivery":true},
  {"name":"Green Basket Organic","area":"Vyttila","rating":4.1,"category":"Organic","delivery":false},
  {"name":"Family Grocery","area":"Aluva","rating":4.0,"category":"Grocery","delivery":false},
  {"name":"SmartBuy Superstore","area":"Palarivattom","rating":4.5,"category":"Supermarket","delivery":true},
  {"name":"Budget Mart","area":"Tripunithura","rating":4.1,"category":"Grocery","delivery":true},
  {"name":"City Fresh Store","area":"Kaloor","rating":4.3,"category":"Grocery","delivery":true},
  {"name":"Metro Mart","area":"Kadavanthra","rating":4.2,"category":"Supermarket","delivery":true},
  {"name":"Daily Basket","area":"Thevara","rating":4.0,"category":"Grocery","delivery":false},
  {"name":"Home Needs Store","area":"Thrippunithura","rating":4.1,"category":"Grocery","delivery":true},

  {"name":"Urban Fresh","area":"Edappally","rating":4.3,"category":"Supermarket","delivery":true},
  {"name":"Easy Shop","area":"Kalamassery","rating":4.0,"category":"Grocery","delivery":true},
  {"name":"Quick Mart","area":"Aluva","rating":4.2,"category":"Grocery","delivery":false},
  {"name":"Prime Grocery","area":"Vyttila","rating":4.4,"category":"Supermarket","delivery":true},
  {"name":"Royal Fresh","area":"Panampilly Nagar","rating":4.5,"category":"Grocery","delivery":true},
  {"name":"Daily Fresh Hub","area":"Kaloor","rating":4.1,"category":"Grocery","delivery":true},
  {"name":"Mini Mart","area":"Kakkanad","rating":3.9,"category":"Grocery","delivery":false},
  {"name":"Family Needs","area":"Kadavanthra","rating":4.2,"category":"Supermarket","delivery":true},
  {"name":"Super Basket","area":"Palarivattom","rating":4.3,"category":"Grocery","delivery":true},
  {"name":"Green Fresh","area":"Thevara","rating":4.0,"category":"Organic","delivery":false},

  {"name":"Budget Fresh","area":"Tripunithura","rating":4.1,"category":"Grocery","delivery":true},
  {"name":"Smart Grocery","area":"Edappally","rating":4.3,"category":"Supermarket","delivery":true},
  {"name":"City Mart","area":"Kaloor","rating":4.2,"category":"Grocery","delivery":true},
  {"name":"Easy Basket","area":"Kakkanad","rating":4.0,"category":"Grocery","delivery":false},
  {"name":"Fresh Choice","area":"Aluva","rating":4.4,"category":"Supermarket","delivery":true},
  {"name":"Metro Grocery","area":"Kadavanthra","rating":4.2,"category":"Grocery","delivery":true},
  {"name":"Daily Mart","area":"Vyttila","rating":4.1,"category":"Grocery","delivery":true},
  {"name":"Urban Basket","area":"Panampilly Nagar","rating":4.5,"category":"Organic","delivery":true},
  {"name":"Prime Mart","area":"Palarivattom","rating":4.3,"category":"Supermarket","delivery":true},
  {"name":"Home Basket","area":"Thevara","rating":4.0,"category":"Grocery","delivery":false},

  {"name":"Green Mart","area":"Edappally","rating":4.2,"category":"Grocery","delivery":true},
  {"name":"Daily Superstore","area":"Kaloor","rating":4.4,"category":"Supermarket","delivery":true},
  {"name":"Fresh Point","area":"Kakkanad","rating":4.1,"category":"Grocery","delivery":true},
  {"name":"Quick Basket","area":"Aluva","rating":4.0,"category":"Grocery","delivery":false},
  {"name":"Smart Fresh","area":"Vyttila","rating":4.3,"category":"Supermarket","delivery":true},
  {"name":"Royal Mart","area":"Panampilly Nagar","rating":4.5,"category":"Grocery","delivery":true},
  {"name":"Budget Basket","area":"Tripunithura","rating":4.1,"category":"Grocery","delivery":true},
  {"name":"City Supermart","area":"Kadavanthra","rating":4.3,"category":"Supermarket","delivery":true},
  {"name":"Easy Fresh","area":"Thevara","rating":4.0,"category":"Grocery","delivery":false},
  {"name":"Metro Basket","area":"Palarivattom","rating":4.2,"category":"Grocery","delivery":true},

  {"name":"Fresh Daily","area":"Edappally","rating":4.3,"category":"Grocery","delivery":true},
  {"name":"Urban Grocery","area":"Kaloor","rating":4.2,"category":"Supermarket","delivery":true},
  {"name":"Green Choice","area":"Kakkanad","rating":4.1,"category":"Organic","delivery":false},
  {"name":"Daily Fresh Mart","area":"Aluva","rating":4.4,"category":"Grocery","delivery":true},
  {"name":"Prime Basket","area":"Vyttila","rating":4.3,"category":"Supermarket","delivery":true},
  {"name":"Royal Grocery","area":"Panampilly Nagar","rating":4.5,"category":"Grocery","delivery":true},
  {"name":"Budget Grocery","area":"Tripunithura","rating":4.0,"category":"Grocery","delivery":true},
  {"name":"City Fresh Mart","area":"Kadavanthra","rating":4.2,"category":"Supermarket","delivery":true},
  {"name":"Easy Grocery","area":"Thevara","rating":4.1,"category":"Grocery","delivery":false},
  {"name":"Metro Fresh","area":"Palarivattom","rating":4.3,"category":"Grocery","delivery":true},

  {"name":"Fresh Hub","area":"Edappally","rating":4.2,"category":"Grocery","delivery":true},
  {"name":"Urban Mart","area":"Kaloor","rating":4.4,"category":"Supermarket","delivery":true},
  {"name":"Green Store","area":"Kakkanad","rating":4.1,"category":"Organic","delivery":false},
  {"name":"Daily Grocery","area":"Aluva","rating":4.3,"category":"Grocery","delivery":true},
  {"name":"Prime Store","area":"Vyttila","rating":4.5,"category":"Supermarket","delivery":true},
  {"name":"Royal Store","area":"Panampilly Nagar","rating":4.4,"category":"Grocery","delivery":true},
  {"name":"Budget Store","area":"Tripunithura","rating":4.0,"category":"Grocery","delivery":true},
  {"name":"City Grocery","area":"Kadavanthra","rating":4.2,"category":"Supermarket","delivery":true},
  {"name":"Easy Mart","area":"Thevara","rating":4.1,"category":"Grocery","delivery":false},
  {"name":"Metro Store","area":"Palarivattom","rating":4.3,"category":"Grocery","delivery":true},

  {"name":"Fresh Supermart","area":"Edappally","rating":4.3,"category":"Supermarket","delivery":true},
  {"name":"Urban Fresh Mart","area":"Kaloor","rating":4.2,"category":"Grocery","delivery":true},
  {"name":"Green Basket Store","area":"Kakkanad","rating":4.1,"category":"Organic","delivery":false},
  {"name":"Daily Needs Mart","area":"Aluva","rating":4.4,"category":"Grocery","delivery":true},
  {"name":"Prime Grocery Store","area":"Vyttila","rating":4.5,"category":"Supermarket","delivery":true},
  {"name":"Royal Basket","area":"Panampilly Nagar","rating":4.4,"category":"Grocery","delivery":true},
  {"name":"Budget Mart Store","area":"Tripunithura","rating":4.0,"category":"Grocery","delivery":true},
  {"name":"City Basket Store","area":"Kadavanthra","rating":4.2,"category":"Supermarket","delivery":true},
  {"name":"Easy Basket Store","area":"Thevara","rating":4.1,"category":"Grocery","delivery":false},
  {"name":"Metro Grocery Store","area":"Palarivattom","rating":4.3,"category":"Grocery","delivery":true}
];

async function seedShops() {
  try {
    const dns = require('dns');
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    await mongoose.connect(uri);
    console.log('Connected to DB');

    const User = require('./models/User');
    const Shop = require('./models/Shop');

    let count = 0;
    for (const shop of shopData) {
      // 1. Create a dummy user for each shop owner to avoid overlapping unique issues.
      const timestamp = Date.now();
      const email = `owner.shop${timestamp}${Math.floor(Math.random()*1000)}@example.com`;
      
      const owner = await User.create({
        name: `Owner of ${shop.name}`,
        email: email,
        password: 'password123', // Will be hashed via pre-save
        role: 'shopowner'
      });

      // 2. Insert the shop
      await Shop.create({
        ownerId: owner._id,
        shopName: shop.name,
        description: shop.delivery ? 'We offer fast delivery!' : 'In-store pickup only.',
        address: shop.area,
        latitude: 10.0 + (Math.random() * 0.1),  // Random Kochi approx coords
        longitude: 76.3 + (Math.random() * 0.1),
        openTime: '08:00',
        closeTime: '22:00',
        categories: [shop.category],
        phone: '1234567890',
        isActive: true,
        rating: shop.rating,
        totalOrders: Math.floor(Math.random() * 100),
        isFeatured: shop.category === 'Supermarket' // feature some
      });
      count++;
    }

    console.log(`Successfully seeded ${count} shops and shopowners!`);
  } catch(e) {
    console.error('Seeding error:', e);
  } finally {
    process.exit(0);
  }
}

seedShops();
