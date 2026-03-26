const express = require('express');
const router = express.Router();
const {
  getShopProducts,
  searchProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock
} = require('../controllers/productController');
const { protect, shopOwnerOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/search', searchProducts);                         // GET /api/products/search?q=milk
router.get('/shop/:shopId', getShopProducts);                  // GET /api/products/shop/:shopId
router.get('/:id', getProduct);                                // GET /api/products/:id

// Private routes (shop owner only)
router.post('/', protect, shopOwnerOnly, upload.single('image'), createProduct);    // POST /api/products
router.put('/:id', protect, shopOwnerOnly, upload.single('image'), updateProduct); // PUT /api/products/:id
router.delete('/:id', protect, shopOwnerOnly, deleteProduct);                      // DELETE /api/products/:id
router.patch('/:id/stock', protect, shopOwnerOnly, updateStock);                   // PATCH /api/products/:id/stock

module.exports = router;
