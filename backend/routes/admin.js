/**
 * Admin Routes
 * All routes protected by admin-only middleware
 */

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
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
} = require('../controllers/adminController');

// All admin routes require authentication + admin role
router.use(protect);
router.use(authorize('admin'));

// Platform stats
router.get('/stats', getPlatformStats);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Shop management
router.get('/shops', getAllShops);
router.put('/shops/:id/toggle', toggleShopActive);
router.delete('/shops/:id', deleteShop);

// Product management
router.get('/products', getAllProducts);
router.delete('/products/:id', deleteProduct);

// Order management
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Subscription management
router.get('/subscriptions', getAllSubscriptions);

module.exports = router;
