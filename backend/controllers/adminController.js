/**
 * Admin Controller
 * Platform-wide management endpoints (admin role only)
 */

const User = require('../models/User');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const Order = require('../models/Order');
const ShopSubscription = require('../models/ShopSubscription');
const Payment = require('../models/Payment');

// @desc    Get platform-wide statistics
// @route   GET /api/admin/stats
// @access  Private (admin)
const getPlatformStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const [
            totalUsers, totalShopOwners, totalShops, totalProducts,
            totalOrders, pendingOrders, todayOrders, monthOrders
        ] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            User.countDocuments({ role: 'shopowner' }),
            Shop.countDocuments(),
            Product.countDocuments(),
            Order.countDocuments(),
            Order.countDocuments({ status: 'Pending' }),
            Order.countDocuments({ createdAt: { $gte: startOfDay } }),
            Order.countDocuments({ createdAt: { $gte: startOfMonth } })
        ]);

        const revenueResult = await Order.aggregate([
            { $match: { status: 'Completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const monthRevenue = await Order.aggregate([
            { $match: { status: 'Completed', createdAt: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        // Daily orders for last 30 days (chart data)
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dailyOrders = await Order.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    orders: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Recent registrations (last 7 days)
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

        // Subscription stats
        const activeSubscriptions = await ShopSubscription.countDocuments({ status: 'active' });
        const subscriptionRevenueData = await Payment.aggregate([
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const subscriptionRevenue = subscriptionRevenueData[0]?.total || 0;

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalShopOwners,
                totalShops,
                totalProducts,
                totalOrders,
                pendingOrders,
                todayOrders,
                monthOrders,
                totalRevenue: revenueResult[0]?.total || 0,
                monthRevenue: monthRevenue[0]?.total || 0,
                recentUsers,
                dailyOrders,
                activeSubscriptions,
                subscriptionRevenue
            }
        });
    } catch (error) {
        console.error('GetPlatformStats Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching stats.' });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users?role=user&page=1&limit=20
// @access  Private (admin)
const getAllUsers = async (req, res) => {
    try {
        const { role, search, page = 1, limit = 20 } = req.query;
        let query = {};

        if (role) query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            data: users,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('GetAllUsers Error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// @desc    Update a user's role
// @route   PUT /api/admin/users/:id/role
// @access  Private (admin)
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!['user', 'shopowner', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role.' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        res.status(200).json({ success: true, message: `Role updated to ${role}.`, data: user });
    } catch (error) {
        console.error('UpdateUserRole Error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private (admin)
const deleteUser = async (req, res) => {
    try {
        if (req.params.id === req.user.id) {
            return res.status(400).json({ success: false, message: 'Cannot delete yourself.' });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        res.status(200).json({ success: true, message: 'User deleted.' });
    } catch (error) {
        console.error('DeleteUser Error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// @desc    Get all shops
// @route   GET /api/admin/shops?page=1&limit=20
// @access  Private (admin)
const getAllShops = async (req, res) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { shopName: { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await Shop.countDocuments(query);
        const shops = await Shop.find(query)
            .populate('ownerId', 'name email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            data: shops,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('GetAllShops Error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// @desc    Toggle shop active status
// @route   PUT /api/admin/shops/:id/toggle
// @access  Private (admin)
const toggleShopActive = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop) return res.status(404).json({ success: false, message: 'Shop not found.' });

        shop.isActive = !shop.isActive;
        await shop.save();

        res.status(200).json({
            success: true,
            message: `Shop ${shop.isActive ? 'activated' : 'deactivated'}.`,
            data: shop
        });
    } catch (error) {
        console.error('ToggleShopActive Error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// @desc    Delete a shop and its products
// @route   DELETE /api/admin/shops/:id
// @access  Private (admin)
const deleteShop = async (req, res) => {
    try {
        const shop = await Shop.findByIdAndDelete(req.params.id);
        if (!shop) return res.status(404).json({ success: false, message: 'Shop not found.' });

        // Also remove all products belonging to this shop
        await Product.deleteMany({ shopId: req.params.id });

        res.status(200).json({ success: true, message: 'Shop and its products deleted.' });
    } catch (error) {
        console.error('DeleteShop Error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// @desc    Get all products
// @route   GET /api/admin/products?page=1&limit=20
// @access  Private (admin)
const getAllProducts = async (req, res) => {
    try {
        const { search, category, page = 1, limit = 20 } = req.query;
        let query = {};

        if (category) query.category = category;
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .populate('shopId', 'shopName')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            data: products,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('GetAllProducts Error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// @desc    Delete a product
// @route   DELETE /api/admin/products/:id
// @access  Private (admin)
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

        res.status(200).json({ success: true, message: 'Product deleted.' });
    } catch (error) {
        console.error('DeleteProduct Error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// @desc    Get all orders
// @route   GET /api/admin/orders?status=Pending&page=1&limit=20
// @access  Private (admin)
const getAllOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        let query = {};

        if (status) query.status = status;

        const total = await Order.countDocuments(query);
        const orders = await Order.find(query)
            .populate('userId', 'name email')
            .populate('shopId', 'shopName')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            data: orders,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('GetAllOrders Error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private (admin)
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Pending', 'Confirmed', 'Packed', 'Out for Delivery', 'Completed', 'Cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status.' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

        order.status = status;
        await order.save();

        res.status(200).json({ success: true, message: `Order status updated to ${status}.`, data: order });
    } catch (error) {
        console.error('UpdateOrderStatus Error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// @desc    Get all shop subscriptions
// @route   GET /api/admin/subscriptions?page=1&limit=20
// @access  Private (admin)
const getAllSubscriptions = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const total = await ShopSubscription.countDocuments();
        const subscriptions = await ShopSubscription.find()
            .populate('shopId', 'shopName ownerId')
            .populate('planId', 'name price')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            data: subscriptions,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('GetAllSubscriptions Error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

module.exports = {
    getPlatformStats,
    getAllUsers,
    updateUserRole,
    deleteUser,
    getAllShops,
    toggleShopActive,
    deleteShop,
    getAllProducts,
    deleteProduct,
    getAllOrders,
    updateOrderStatus,
    getAllSubscriptions
};
