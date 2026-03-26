/**
 * ShopDetailPage - Shows shop info + all products
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, Phone, ShoppingCart, Heart, Search, Filter, ArrowLeft, Store, Star } from 'lucide-react';
import API, { getImageUrl } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Grocery', 'Fruits & Vegetables', 'Dairy & Eggs', 'Bakery', 'Beverages', 'Snacks', 'Pharmacy', 'Electronics', 'Clothing', 'Home & Kitchen', 'Personal Care', 'Other'];

const ShopDetailPage = () => {
  const { id } = useParams();
  const { user, fetchCartCount } = useAuth();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productLoading, setProductLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    fetchShop();
    fetchProducts();
    if (user) fetchWishlist();
  }, [id]);

  useEffect(() => {
    fetchProducts(selectedCategory, searchQuery);
  }, [selectedCategory]);

  const fetchShop = async () => {
    try {
      const res = await API.get(`/shops/${id}`);
      setShop(res.data.data);
    } catch {
      toast.error('Failed to load shop details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (category = selectedCategory, search = '') => {
    setProductLoading(true);
    try {
      const params = new URLSearchParams();
      if (category && category !== 'All') params.append('category', category);
      if (search) params.append('search', search);

      const res = await API.get(`/products/shop/${id}?${params}`);
      setProducts(res.data.data || []);
    } catch {
      toast.error('Failed to load products.');
    } finally {
      setProductLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const res = await API.get('/users/wishlist');
      setWishlist(res.data.data?.map(p => p._id) || []);
    } catch {}
  };

  const handleAddToCart = async (productId) => {
    if (!user) {
      toast.error('Please login to add to cart');
      return;
    }
    try {
      await API.post('/users/cart', { productId, quantity: 1 });
      fetchCartCount();
      toast.success('Added to cart! 🛒');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleToggleWishlist = async (productId) => {
    if (!user) {
      toast.error('Please login to save products');
      return;
    }
    try {
      const res = await API.post('/users/wishlist/toggle', { productId });
      if (res.data.inWishlist) {
        setWishlist([...wishlist, productId]);
      } else {
        setWishlist(wishlist.filter(id => id !== productId));
      }
      toast.success(res.data.message);
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(selectedCategory, searchQuery);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="empty-state" style={{ padding: '80px' }}>
        <Store size={48} />
        <h3>Shop not found</h3>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '16px' }}>Back to Home</Link>
      </div>
    );
  }

  const isOpen = (() => {
    const now = new Date();
    const current = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
    return current >= shop.openTime && current <= shop.closeTime;
  })();

  return (
    <div>
      {/* Shop Header */}
      <div style={styles.shopHeader}>
        <div className="container">
          <Link to="/" style={styles.backLink}>
            <ArrowLeft size={18} /> Back to Shops
          </Link>

          <div style={styles.shopProfile}>
            {/* Logo */}
            <div style={styles.logoWrapper}>
              {shop.logo ? (
                <img src={getImageUrl(shop.logo)} alt={shop.shopName} style={styles.logoImg} />
              ) : (
                <Store size={48} style={{ color: '#6366f1' }} />
              )}
            </div>

            {/* Shop Details */}
            <div style={styles.shopDetails}>
              <div style={styles.shopNameRow}>
                <h1 style={styles.shopName}>{shop.shopName}</h1>
                <span style={{
                  ...styles.openBadge,
                  background: isOpen ? '#d1fae5' : '#fee2e2',
                  color: isOpen ? '#065f46' : '#991b1b'
                }}>
                  {isOpen ? '🟢 Open Now' : '🔴 Closed'}
                </span>
              </div>

              {shop.description && (
                <p style={styles.shopDescription}>{shop.description}</p>
              )}

              <div style={styles.shopMeta}>
                <div style={styles.metaItem}>
                  <MapPin size={16} style={{ color: '#6366f1' }} />
                  <span>{shop.address}</span>
                </div>
                <div style={styles.metaItem}>
                  <Clock size={16} style={{ color: '#6366f1' }} />
                  <span>{shop.openTime} – {shop.closeTime}</span>
                </div>
                {shop.phone && (
                  <div style={styles.metaItem}>
                    <Phone size={16} style={{ color: '#6366f1' }} />
                    <span>{shop.phone}</span>
                  </div>
                )}
                {shop.productCount !== undefined && (
                  <div style={styles.metaItem}>
                    <ShoppingCart size={16} style={{ color: '#6366f1' }} />
                    <span>{shop.productCount} products available</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container" style={{ paddingTop: '24px', paddingBottom: '40px' }}>
        {/* Search + Filter */}
        <div style={styles.filterBar}>
          <form onSubmit={handleSearch} style={styles.searchForm}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Search products in this shop..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input"
                style={{ paddingLeft: '38px' }}
              />
            </div>
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>

        {/* Category Filter */}
        <div style={styles.categoryScroll}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                ...styles.categoryChip,
                ...(selectedCategory === cat ? styles.categoryChipActive : {})
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Header */}
        <div style={styles.productsHeader}>
          <h2 style={{ fontSize: '20px', fontWeight: '700' }}>
            Products
            {products.length > 0 && <span style={styles.countBadge}>{products.length}</span>}
          </h2>
        </div>

        {/* Products Grid */}
        {productLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div className="spinner" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid-4" style={{ marginTop: '16px' }}>
            {products.map(product => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={() => handleAddToCart(product._id)}
                onToggleWishlist={() => handleToggleWishlist(product._id)}
                isInWishlist={wishlist.includes(product._id)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <ShoppingCart size={48} />
            <h3>No products found</h3>
            <p>Try a different category or search term</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Product Card Sub-component
const ProductCard = ({ product, onAddToCart, onToggleWishlist, isInWishlist }) => {
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div style={styles.productCard}>
      {/* Wishlist button */}
      <button
        onClick={onToggleWishlist}
        style={{ ...styles.wishlistBtn, color: isInWishlist ? '#ef4444' : '#9ca3af' }}
      >
        <Heart size={18} fill={isInWishlist ? '#ef4444' : 'none'} />
      </button>

      {/* Discount badge */}
      {hasDiscount && (
        <span style={styles.discountBadge}>{discountPercent}% OFF</span>
      )}

      {/* Product Image */}
      <Link to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
        <div style={styles.productImageWrapper}>
          {product.image ? (
            <img
              src={getImageUrl(product.image)}
              alt={product.name}
              style={styles.productImage}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div style={styles.productImagePlaceholder}>🛍️</div>
          )}
        </div>

        <div style={styles.productInfo}>
          <p style={styles.productCategory}>{product.category}</p>
          <h4 style={styles.productName}>{product.name}</h4>
          <p style={styles.productUnit}>per {product.unit || 'piece'}</p>

          <div style={styles.priceRow}>
            <span style={styles.price}>
              ₹{(product.discountPrice || product.price).toFixed(2)}
            </span>
            {hasDiscount && (
              <span style={styles.originalPrice}>₹{product.price.toFixed(2)}</span>
            )}
          </div>

          <div style={{ marginTop: '4px' }}>
            {product.stock === 0 ? (
              <span style={styles.outOfStock}>Out of Stock</span>
            ) : product.stock < 10 ? (
              <span style={styles.lowStock}>Only {product.stock} left!</span>
            ) : (
              <span style={styles.inStock}>In Stock</span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to Cart */}
      <button
        onClick={onAddToCart}
        disabled={product.stock === 0}
        style={{
          ...styles.addToCartBtn,
          opacity: product.stock === 0 ? 0.5 : 1,
          cursor: product.stock === 0 ? 'not-allowed' : 'pointer'
        }}
      >
        <ShoppingCart size={15} />
        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>
  );
};

const styles = {
  shopHeader: {
    background: 'linear-gradient(135deg, #f8faff, #ede9fe)',
    borderBottom: '1px solid #e5e7eb',
    padding: '24px 0'
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#6366f1',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '20px'
  },
  shopProfile: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '20px',
    flexWrap: 'wrap'
  },
  logoWrapper: {
    width: '90px',
    height: '90px',
    borderRadius: '16px',
    background: '#fff',
    border: '2px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0
  },
  logoImg: { width: '100%', height: '100%', objectFit: 'cover' },
  shopDetails: { flex: 1, minWidth: '200px' },
  shopNameRow: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' },
  shopName: { fontSize: '26px', fontWeight: '800', color: '#111827' },
  openBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' },
  shopDescription: { color: '#6b7280', fontSize: '14px', marginBottom: '12px' },
  shopMeta: { display: 'flex', flexWrap: 'wrap', gap: '16px' },
  metaItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#374151' },
  filterBar: { display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' },
  searchForm: { display: 'flex', gap: '8px', flex: 1, minWidth: '280px' },
  categoryScroll: { display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' },
  categoryChip: { flexShrink: 0, padding: '6px 14px', border: '2px solid #e5e7eb', borderRadius: '20px', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#6b7280', whiteSpace: 'nowrap' },
  categoryChipActive: { background: '#6366f1', borderColor: '#6366f1', color: '#fff' },
  productsHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
  countBadge: { marginLeft: '8px', background: '#ede9fe', color: '#6366f1', padding: '2px 10px', borderRadius: '20px', fontSize: '14px', fontWeight: '600' },
  // Product card
  productCard: {
    background: '#fff',
    borderRadius: '14px',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column'
  },
  wishlistBtn: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '34px',
    height: '34px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
    zIndex: 2
  },
  discountBadge: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    background: '#ef4444',
    color: '#fff',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    zIndex: 2
  },
  productImageWrapper: {
    height: '140px',
    background: '#f9fafb',
    overflow: 'hidden'
  },
  productImage: { width: '100%', height: '100%', objectFit: 'cover' },
  productImagePlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' },
  productInfo: { padding: '12px 12px 8px', flex: 1 },
  productCategory: { fontSize: '11px', color: '#6366f1', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' },
  productName: { fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '2px', lineHeight: '1.3' },
  productUnit: { fontSize: '12px', color: '#9ca3af', marginBottom: '8px' },
  priceRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  price: { fontSize: '18px', fontWeight: '800', color: '#111827' },
  originalPrice: { fontSize: '13px', color: '#9ca3af', textDecoration: 'line-through' },
  inStock: { fontSize: '12px', color: '#10b981', fontWeight: '500' },
  lowStock: { fontSize: '12px', color: '#f59e0b', fontWeight: '600' },
  outOfStock: { fontSize: '12px', color: '#ef4444', fontWeight: '600' },
  addToCartBtn: {
    margin: '8px 12px 12px',
    padding: '9px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
  }
};

export default ShopDetailPage;
