const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  updateLocation,
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  toggleWishlist,
  getWishlist
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// All user routes require authentication
router.use(protect);

// Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.patch('/location', updateLocation);

// Cart
router.get('/cart', getCart);
router.post('/cart', addToCart);
router.delete('/cart/:productId', removeFromCart);
router.delete('/cart', clearCart);

// Wishlist
router.get('/wishlist', getWishlist);
router.post('/wishlist/toggle', toggleWishlist);

module.exports = router;
