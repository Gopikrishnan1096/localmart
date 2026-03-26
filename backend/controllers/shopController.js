/**
 * Shop Controller
 * CRUD operations for shops + location-based nearby search
 */

const Shop = require('../models/Shop');
const Product = require('../models/Product');
const Order = require('../models/Order');

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// @desc    Get nearby shops based on user location
// @route   GET /api/shops/nearby?lat=xx&lng=xx&radius=10&category=Grocery
// @access  Public
const getNearbyShops = async (req, res) => {
  try {
    const { lat, lng, radius = 10, category, search, locationSearch } = req.query;

    // Require lat/lng only if no manual location search is specified
    if (!locationSearch && (!lat || !lng)) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required for nearby shop search.'
      });
    }

    // Build query filters
    let query = { isActive: true };
    if (category) query.categories = { $in: [category] };
    if (locationSearch) query.address = { $regex: locationSearch, $options: 'i' };

    // Fetch all active shops (for small datasets this is fine; for large scale use MongoDB geospatial indexes)
    let shops = await Shop.find(query)
      .populate('ownerId', 'name email')
      .lean();

    // Apply text search filter
    if (search) {
      const searchLower = search.toLowerCase();
      shops = shops.filter(shop =>
        shop.shopName.toLowerCase().includes(searchLower) ||
        (shop.description && shop.description.toLowerCase().includes(searchLower))
      );
    }

    // Filter/calculate distance if user provided lat/lng
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxRadius = parseFloat(radius);

      shops = shops.map(shop => ({
        ...shop,
        distance: calculateDistance(userLat, userLng, shop.latitude, shop.longitude)
      }));

      // Filter by radius ONLY if user did not manually type a location search
      if (!locationSearch) {
        shops = shops.filter(shop => shop.distance <= maxRadius);
      }
      
      // Sort by distance (closest first)
      shops.sort((a, b) => a.distance - b.distance);
    }

    res.status(200).json({
      success: true,
      count: shops.length,
      data: shops
    });
  } catch (error) {
    console.error('GetNearbyShops Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching nearby shops.' });
  }
};

// @desc    Get single shop details
// @route   GET /api/shops/:id
// @access  Public
const getShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('ownerId', 'name email phone');

    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found.' });
    }

    // Also get product count
    const productCount = await Product.countDocuments({ shopId: shop._id, isAvailable: true });

    res.status(200).json({
      success: true,
      data: { ...shop.toJSON(), productCount }
    });
  } catch (error) {
    console.error('GetShop Error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Create shop profile (shop owner only)
// @route   POST /api/shops
// @access  Private (shopowner)
const createShop = async (req, res) => {
  try {
    // Check if this owner already has a shop
    const existingShop = await Shop.findOne({ ownerId: req.user.id });
    if (existingShop) {
      return res.status(400).json({
        success: false,
        message: 'You already have a shop registered. Please update your existing shop.'
      });
    }

    const shopData = {
      ...req.body,
      ownerId: req.user.id
    };

    // Handle uploaded logo
    if (req.file) {
      shopData.logo = req.file.path.replace(/\\/g, '/'); // Normalize path for Windows
    }

    const shop = await Shop.create(shopData);

    res.status(201).json({
      success: true,
      message: 'Shop created successfully!',
      data: shop
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    console.error('CreateShop Error:', error);
    res.status(500).json({ success: false, message: 'Server error creating shop.' });
  }
};

// @desc    Update shop details
// @route   PUT /api/shops/:id
// @access  Private (shop owner)
const updateShop = async (req, res) => {
  try {
    let shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found.' });
    }

    // Ensure the requester owns this shop
    if (shop.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this shop.'
      });
    }

    const updateData = { ...req.body };

    // Handle new logo upload
    if (req.file) {
      updateData.logo = req.file.path.replace(/\\/g, '/');
    }

    shop = await Shop.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Shop updated successfully!',
      data: shop
    });
  } catch (error) {
    console.error('UpdateShop Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating shop.' });
  }
};

// @desc    Get shop owned by current user
// @route   GET /api/shops/my-shop
// @access  Private (shopowner)
const getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user.id });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'No shop found. Please create your shop first.'
      });
    }

    res.status(200).json({ success: true, data: shop });
  } catch (error) {
    console.error('GetMyShop Error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get shop dashboard stats (earnings, orders count, etc.)
// @route   GET /api/shops/:id/stats
// @access  Private (shop owner)
const getShopStats = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found.' });

    if (shop.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    // Get order statistics
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalOrders, todayOrders, monthOrders, pendingOrders, productCount] = await Promise.all([
      Order.countDocuments({ shopId: shop._id }),
      Order.countDocuments({ shopId: shop._id, createdAt: { $gte: startOfDay } }),
      Order.countDocuments({ shopId: shop._id, createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({ shopId: shop._id, status: 'Pending' }),
      Product.countDocuments({ shopId: shop._id, isAvailable: true })
    ]);

    // Calculate earnings
    const earningsResult = await Order.aggregate([
      { $match: { shopId: shop._id, status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const todayEarnings = await Order.aggregate([
      { $match: { shopId: shop._id, status: 'Completed', createdAt: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const monthEarnings = await Order.aggregate([
      { $match: { shopId: shop._id, status: 'Completed', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Daily sales for last 30 days (for chart)
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailySales = await Order.aggregate([
      {
        $match: {
          shopId: shop._id,
          status: 'Completed',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sales: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        todayOrders,
        monthOrders,
        pendingOrders,
        productCount,
        totalEarnings: earningsResult[0]?.total || 0,
        todayEarnings: todayEarnings[0]?.total || 0,
        monthEarnings: monthEarnings[0]?.total || 0,
        dailySales
      }
    });
  } catch (error) {
    console.error('GetShopStats Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching stats.' });
  }
};

module.exports = {
  getNearbyShops,
  getShop,
  createShop,
  updateShop,
  getMyShop,
  getShopStats
};
