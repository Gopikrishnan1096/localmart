/**
 * LocalMart Backend Server
 * Main entry point for the Express application
 */

const dns = require('dns');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const configureDnsServers = () => {
  const configuredDnsServers = process.env.DNS_SERVERS
    ? process.env.DNS_SERVERS.split(',').map(server => server.trim()).filter(Boolean)
    : [];

  if (configuredDnsServers.length > 0) {
    dns.setServers(configuredDnsServers);
    console.log(`Using DNS servers from DNS_SERVERS: ${configuredDnsServers.join(', ')}`);
    return;
  }

  const systemDnsServers = dns.getServers();
  if (systemDnsServers.length > 0) {
    console.log(`Using system DNS servers: ${systemDnsServers.join(', ')}`);
  }
};

// Import route files
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shops');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const { stripeWebhook } = require('./controllers/subscriptionController');

const app = express();

const validateMongoUri = (uri) => {
  if (!uri) return 'MONGODB_URI is required in backend/.env';

  const placeholderValues = new Set([
    'PASTE_YOUR_CONNECTION_STRING',
    'your_mongodb_connection_string_here'
  ]);

  if (placeholderValues.has(uri.trim())) {
    return 'MONGODB_URI is using a placeholder value. Set a real MongoDB Atlas connection string.';
  }

  if (!/^mongodb(\+srv)?:\/\//.test(uri)) {
    return 'MONGODB_URI must start with mongodb:// or mongodb+srv://';
  }

  return null;
};

// =====================
// MIDDLEWARE
// =====================

// Enable CORS for both frontends
app.use(cors({
  origin: [
    process.env.USER_FRONTEND_URL || 'http://localhost:3000',
    process.env.SHOP_DASHBOARD_URL || 'http://localhost:3001',
    process.env.ADMIN_DASHBOARD_URL || 'http://localhost:3002',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002'
  ],
  credentials: true
}));

// Stripe webhook needs raw body parser
app.post('/api/subscriptions/webhook', express.raw({type: 'application/json'}), stripeWebhook);

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
// Example: GET /uploads/shops/logo.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =====================
// DATABASE CONNECTION
// =====================
const mongoConfigError = validateMongoUri(process.env.MONGODB_URI);
if (mongoConfigError) {
  console.error(`MongoDB configuration error: ${mongoConfigError}`);
  process.exit(1);
}

const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000
    });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  }
};

// =====================
// API ROUTES
// =====================
app.use('/api/auth', authRoutes);       // Register, Login
app.use('/api/shops', shopRoutes);      // Shop CRUD + nearby shops
app.use('/api/products', productRoutes); // Product CRUD
app.use('/api/orders', orderRoutes);    // Order management
app.use('/api/users', userRoutes);      // User profile, cart, wishlist
app.use('/api/admin', adminRoutes);    // Admin management
app.use('/api/subscriptions', subscriptionRoutes); // Subscriptions

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'LocalMart API is running', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// =====================
// START SERVER
// =====================
const startServer = async () => {
  configureDnsServers();
  await connectDatabase();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`LocalMart Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();

module.exports = app;
