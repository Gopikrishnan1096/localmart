/**
 * Order Controller
 * Create, track, and manage orders
 */

const Order = require('../models/Order');
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const User = require('../models/User');

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private (user)
const createOrder = async (req, res) => {
  try {
    const { shopId, products, paymentMethod, deliveryAddress, notes } = req.body;

    if (!shopId || !products || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Shop ID and at least one product are required.'
      });
    }

    // Validate shop exists and is active
    const shop = await Shop.findById(shopId);
    if (!shop || !shop.isActive) {
      return res.status(404).json({ success: false, message: 'Shop not found or inactive.' });
    }

    // Validate each product and calculate total
    let totalAmount = 0;
    const orderProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`
        });
      }

      if (product.shopId.toString() !== shopId) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} does not belong to this shop.`
        });
      }

      if (!product.isAvailable || product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }

      const effectivePrice = product.discountPrice || product.price;
      const subtotal = effectivePrice * item.quantity;
      totalAmount += subtotal;

      orderProducts.push({
        product: product._id,
        productName: product.name,
        productImage: product.image,
        price: effectivePrice,
        quantity: item.quantity,
        subtotal
      });

      // Reduce stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Create the order
    const order = await Order.create({
      userId: req.user.id,
      shopId,
      products: orderProducts,
      totalAmount,
      deliveryAddress: deliveryAddress || req.user.location?.address || 'Address not provided',
      paymentMethod: paymentMethod || 'Cash on Delivery',
      notes,
      statusHistory: [{ status: 'Pending', timestamp: new Date() }]
    });

    // Update shop stats
    await Shop.findByIdAndUpdate(shopId, {
      $inc: { totalOrders: 1 }
    });

    // Clear user cart after successful order
    await User.findByIdAndUpdate(req.user.id, { cart: [] });

    // Populate for response
    const populatedOrder = await Order.findById(order._id)
      .populate('shopId', 'shopName address phone')
      .populate('userId', 'name phone');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! 🎉',
      data: populatedOrder
    });
  } catch (error) {
    console.error('CreateOrder Error:', error);
    res.status(500).json({ success: false, message: 'Server error creating order.' });
  }
};

// @desc    Get all orders for current user
// @route   GET /api/orders/my-orders
// @access  Private (user)
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate('shopId', 'shopName address logo')
      .sort('-createdAt')
      .lean();

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error('GetMyOrders Error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get single order details
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('shopId', 'shopName address phone logo')
      .populate('userId', 'name email phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Allow access to order owner or shop owner
    const isOrderOwner = order.userId._id.toString() === req.user.id;
    const shop = await Shop.findById(order.shopId);
    const isShopOwner = shop && shop.ownerId.toString() === req.user.id;

    if (!isOrderOwner && !isShopOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order.' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error('GetOrder Error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get all orders for a shop (shop owner view)
// @route   GET /api/orders/shop/:shopId
// @access  Private (shopowner)
const getShopOrders = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    // Verify shop ownership
    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found.' });

    if (shop.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    let query = { shopId };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('userId', 'name phone email')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      pages: Math.ceil(total / limit),
      data: orders
    });
  } catch (error) {
    console.error('GetShopOrders Error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Update order status (shop owner changes order progress)
// @route   PATCH /api/orders/:id/status
// @access  Private (shopowner)
const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Packed', 'Out for Delivery', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    // Verify shop ownership
    const shop = await Shop.findById(order.shopId);
    if (!shop || (shop.ownerId.toString() !== req.user.id && req.user.role !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this order.' });
    }

    // Update status
    order.status = status;
    order.statusHistory.push({ status, timestamp: new Date(), note });

    // Mark payment as paid when completed
    if (status === 'Completed') {
      order.paymentStatus = 'Paid';
      // Update shop earnings
      await Shop.findByIdAndUpdate(order.shopId, {
        $inc: { totalEarnings: order.totalAmount }
      });
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to "${status}"`,
      data: order
    });
  } catch (error) {
    console.error('UpdateOrderStatus Error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Cancel order (by user, only if Pending)
// @route   PATCH /api/orders/:id/cancel
// @access  Private (user)
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    if (!['Pending', 'Confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage.'
      });
    }

    // Restore product stock
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    order.status = 'Cancelled';
    order.statusHistory.push({ status: 'Cancelled', timestamp: new Date() });
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully.',
      data: order
    });
  } catch (error) {
    console.error('CancelOrder Error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrder,
  getShopOrders,
  updateOrderStatus,
  cancelOrder
};
