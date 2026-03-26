/**
 * User Controller
 * Profile management, cart operations, and wishlist
 */

const User = require('../models/User');

// @desc    Get user profile with populated cart and wishlist
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'cart.product',
        select: 'name price discountPrice image stock shopId isAvailable',
        populate: { path: 'shopId', select: 'shopName' }
      })
      .populate('wishlist', 'name price discountPrice image shopId');

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('GetProfile Error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone, location } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, location },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      data: updatedUser
    });
  } catch (error) {
    console.error('UpdateProfile Error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Update user location
// @route   PATCH /api/users/location
// @access  Private
const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude required.' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { location: { latitude, longitude, address } },
      { new: true }
    ).select('location');

    res.status(200).json({ success: true, message: 'Location updated!', data: user.location });
  } catch (error) {
    console.error('UpdateLocation Error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// =====================
// CART OPERATIONS
// =====================

// @desc    Get user cart
// @route   GET /api/users/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'cart.product',
      select: 'name price discountPrice image stock shopId isAvailable',
      populate: { path: 'shopId', select: 'shopName address' }
    });

    // Calculate cart total
    let cartTotal = 0;
    const cartItems = user.cart
      .filter(item => item.product) // Filter out deleted products
      .map(item => {
        const effectivePrice = item.product.discountPrice || item.product.price;
        const subtotal = effectivePrice * item.quantity;
        cartTotal += subtotal;
        return { ...item.toObject(), subtotal };
      });

    res.status(200).json({
      success: true,
      data: {
        items: cartItems,
        total: cartTotal,
        itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
      }
    });
  } catch (error) {
    console.error('GetCart Error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Add item to cart (or update quantity)
// @route   POST /api/users/cart
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID required.' });
    }

    const user = await User.findById(req.user.id);

    // Check if product already in cart
    const existingItemIndex = user.cart.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      user.cart[existingItemIndex].quantity += quantity;
      if (user.cart[existingItemIndex].quantity <= 0) {
        // Remove if quantity goes to 0 or less
        user.cart.splice(existingItemIndex, 1);
      }
    } else {
      // Add new item
      user.cart.push({ product: productId, quantity });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cart updated!',
      cartCount: user.cart.reduce((sum, item) => sum + item.quantity, 0)
    });
  } catch (error) {
    console.error('AddToCart Error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/users/cart/:productId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.cart = user.cart.filter(
      item => item.product.toString() !== req.params.productId
    );

    await user.save();

    res.status(200).json({ success: true, message: 'Item removed from cart.' });
  } catch (error) {
    console.error('RemoveFromCart Error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/users/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { cart: [] });
    res.status(200).json({ success: true, message: 'Cart cleared.' });
  } catch (error) {
    console.error('ClearCart Error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// =====================
// WISHLIST OPERATIONS
// =====================

// @desc    Toggle product in wishlist (add if not present, remove if present)
// @route   POST /api/users/wishlist/toggle
// @access  Private
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID required.' });
    }

    const user = await User.findById(req.user.id);
    const isInWishlist = user.wishlist.includes(productId);

    if (isInWishlist) {
      user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
      await user.save();
      return res.status(200).json({
        success: true,
        message: 'Removed from wishlist.',
        inWishlist: false
      });
    } else {
      user.wishlist.push(productId);
      await user.save();
      return res.status(200).json({
        success: true,
        message: 'Added to wishlist! ❤️',
        inWishlist: true
      });
    }
  } catch (error) {
    console.error('ToggleWishlist Error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'wishlist',
      select: 'name price discountPrice image shopId stock category',
      populate: { path: 'shopId', select: 'shopName' }
    });

    res.status(200).json({ success: true, data: user.wishlist });
  } catch (error) {
    console.error('GetWishlist Error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateLocation,
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  toggleWishlist,
  getWishlist
};
