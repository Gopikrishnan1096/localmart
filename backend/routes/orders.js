const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  getShopOrders,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController');
const { protect, shopOwnerOnly } = require('../middleware/auth');

// All order routes require authentication
router.use(protect);

router.post('/', createOrder);                                           // POST /api/orders
router.get('/my-orders', getMyOrders);                                   // GET /api/orders/my-orders
router.get('/shop/:shopId', shopOwnerOnly, getShopOrders);               // GET /api/orders/shop/:shopId
router.get('/:id', getOrder);                                            // GET /api/orders/:id
router.patch('/:id/status', shopOwnerOnly, updateOrderStatus);           // PATCH /api/orders/:id/status
router.patch('/:id/cancel', cancelOrder);                                // PATCH /api/orders/:id/cancel

module.exports = router;
