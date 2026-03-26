/**
 * Product Controller
 * CRUD operations for products
 */

const Product = require('../models/Product');
const Shop = require('../models/Shop');

// Helper: Verify shop ownership
const verifyShopOwner = async (shopId, userId, userRole) => {
  const shop = await Shop.findById(shopId);
  if (!shop) return { error: 'Shop not found.', status: 404 };
  if (shop.ownerId.toString() !== userId && userRole !== 'admin') {
    return { error: 'Not authorized to manage products for this shop.', status: 403 };
  }
  return { shop };
};

// @desc    Get all products for a shop
// @route   GET /api/products/shop/:shopId
// @access  Public
const getShopProducts = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { category, search, sort = '-createdAt', inStock } = req.query;

    let query = { shopId, isAvailable: true };

    if (category) query.category = category;
    if (inStock === 'true') query.stock = { $gt: 0 };

    let products = Product.find(query);

    // Text search
    if (search) {
      query.$text = { $search: search };
      products = Product.find(query, { score: { $meta: 'textScore' } })
                        .sort({ score: { $meta: 'textScore' } });
    } else {
      products = products.sort(sort);
    }

    const result = await products.lean();

    res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    console.error('GetShopProducts Error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Search products across all shops (with location filter)
// @route   GET /api/products/search?q=milk&category=Grocery
// @access  Public
const searchProducts = async (req, res) => {
  try {
    const { q, category } = req.query;

    let query = { isAvailable: true, stock: { $gt: 0 } };
    if (category) query.category = category;

    let products;
    if (q) {
      // Text search
      products = await Product.find(
        { ...query, $text: { $search: q } },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .populate('shopId', 'shopName address latitude longitude openTime closeTime')
        .limit(50)
        .lean();
    } else {
      products = await Product.find(query)
        .populate('shopId', 'shopName address latitude longitude openTime closeTime')
        .sort('-createdAt')
        .limit(50)
        .lean();
    }

    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error('SearchProducts Error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('shopId', 'shopName address openTime closeTime logo');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error('GetProduct Error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (shopowner)
const createProduct = async (req, res) => {
  try {
    const { shopId } = req.body;

    const ownerCheck = await verifyShopOwner(shopId, req.user.id, req.user.role);
    if (ownerCheck.error) {
      return res.status(ownerCheck.status).json({ success: false, message: ownerCheck.error });
    }

    // CHECK SUBSCRIPTION LIMIT
    const ShopSubscription = require('../models/ShopSubscription');
    const Product = require('../models/Product');
    const sub = await ShopSubscription.findOne({ shopId }).populate('planId');
    
    if (sub && sub.planId && sub.planId.productLimit !== -1) {
      const currentCount = await Product.countDocuments({ shopId });
      if (currentCount >= sub.planId.productLimit) {
        return res.status(403).json({ 
          success: false, 
          message: `Plan limit reached. Your current plan (${sub.planId.name}) allows a maximum of ${sub.planId.productLimit} products. Please upgrade to add more.`,
          limitReached: true
        });
      }
    }

    const productData = { ...req.body };

    // Handle uploaded image
    if (req.file) {
      productData.image = req.file.path.replace(/\\/g, '/');
    }

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product added successfully!',
      data: product
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    console.error('CreateProduct Error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (shopowner)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const ownerCheck = await verifyShopOwner(product.shopId, req.user.id, req.user.role);
    if (ownerCheck.error) {
      return res.status(ownerCheck.status).json({ success: false, message: ownerCheck.error });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = req.file.path.replace(/\\/g, '/');
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully!',
      data: updatedProduct
    });
  } catch (error) {
    console.error('UpdateProduct Error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (shopowner)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const ownerCheck = await verifyShopOwner(product.shopId, req.user.id, req.user.role);
    if (ownerCheck.error) {
      return res.status(ownerCheck.status).json({ success: false, message: ownerCheck.error });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully!'
    });
  } catch (error) {
    console.error('DeleteProduct Error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Update product stock only
// @route   PATCH /api/products/:id/stock
// @access  Private (shopowner)
const updateStock = async (req, res) => {
  try {
    const { stock } = req.body;
    if (stock === undefined || stock < 0) {
      return res.status(400).json({ success: false, message: 'Valid stock value required.' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const ownerCheck = await verifyShopOwner(product.shopId, req.user.id, req.user.role);
    if (ownerCheck.error) {
      return res.status(ownerCheck.status).json({ success: false, message: ownerCheck.error });
    }

    product.stock = stock;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Stock updated!',
      data: { stock: product.stock }
    });
  } catch (error) {
    console.error('UpdateStock Error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  getShopProducts,
  searchProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock
};
