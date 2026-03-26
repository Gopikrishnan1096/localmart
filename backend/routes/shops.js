const express = require('express');
const router = express.Router();
const {
  getNearbyShops,
  getShop,
  createShop,
  updateShop,
  getMyShop,
  getShopStats
} = require('../controllers/shopController');
const { protect, shopOwnerOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/nearby', getNearbyShops);                  // GET /api/shops/nearby?lat=xx&lng=xx

// Private routes (must be before /:id to avoid conflicts)
router.get('/my-shop', protect, shopOwnerOnly, getMyShop); // GET /api/shops/my-shop
router.get('/:id/stats', protect, shopOwnerOnly, getShopStats); // GET /api/shops/:id/stats

// Shop CRUD
router.get('/:id', getShop);                           // GET /api/shops/:id (public)
router.post('/', protect, shopOwnerOnly, upload.single('logo'), createShop); // POST /api/shops
router.put('/:id', protect, shopOwnerOnly, upload.single('logo'), updateShop); // PUT /api/shops/:id

module.exports = router;
