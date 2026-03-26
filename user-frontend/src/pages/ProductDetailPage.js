/**
 * ProductDetailPage - Full product view with add to cart
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, ArrowLeft, Store, Minus, Plus, Package } from 'lucide-react';
import API, { getImageUrl } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { user, fetchCartCount } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await API.get(`/products/${id}`);
      setProduct(res.data.data);
    } catch {
      toast.error('Product not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please login first'); return; }
    setAddingToCart(true);
    try {
      await API.post('/users/cart', { productId: id, quantity });
      fetchCartCount();
      toast.success(`${product.name} added to cart! 🛒`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) { toast.error('Please login first'); return; }
    try {
      const res = await API.post('/users/wishlist/toggle', { productId: id });
      setInWishlist(res.data.inWishlist);
      toast.success(res.data.message);
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><div className="spinner" /></div>;
  if (!product) return <div className="empty-state"><Package size={48} /><h3>Product not found</h3><Link to="/" className="btn btn-primary" style={{ marginTop: '16px' }}>Home</Link></div>;

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const effectivePrice = product.discountPrice || product.price;

  return (
    <div className="container page-wrapper">
      <Link to={`/shop/${product.shopId?._id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#6366f1', textDecoration: 'none', fontWeight: '600', marginBottom: '24px' }}>
        <ArrowLeft size={18} /> Back to Shop
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', background: '#fff', borderRadius: '20px', padding: '32px', border: '1px solid #e5e7eb', flexWrap: 'wrap' }}>
        {/* Product Image */}
        <div style={{ background: '#f9fafb', borderRadius: '16px', height: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {product.image ? (
            <img src={getImageUrl(product.image)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <span style={{ fontSize: '80px' }}>🛍️</span>
          )}
        </div>

        {/* Product Details */}
        <div>
          <span style={{ fontSize: '12px', color: '#6366f1', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>{product.category}</span>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', margin: '8px 0' }}>{product.name}</h1>
          <p style={{ color: '#6b7280', lineHeight: '1.7', marginBottom: '20px' }}>{product.description || 'No description available.'}</p>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '36px', fontWeight: '900', color: '#111827' }}>₹{effectivePrice.toFixed(2)}</span>
            {hasDiscount && (
              <>
                <span style={{ fontSize: '20px', color: '#9ca3af', textDecoration: 'line-through' }}>₹{product.price.toFixed(2)}</span>
                <span style={{ background: '#fee2e2', color: '#ef4444', padding: '4px 10px', borderRadius: '8px', fontWeight: '700', fontSize: '14px' }}>
                  {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>Per {product.unit || 'piece'}</p>

          {/* Stock Status */}
          {product.stock === 0 ? (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 16px', borderRadius: '10px', fontWeight: '600', marginBottom: '20px' }}>❌ Out of Stock</div>
          ) : (
            <div style={{ background: '#d1fae5', color: '#065f46', padding: '10px 16px', borderRadius: '10px', fontWeight: '600', marginBottom: '20px' }}>
              ✅ In Stock {product.stock < 10 && `(Only ${product.stock} left!)`}
            </div>
          )}

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <span style={{ fontWeight: '600', color: '#374151' }}>Quantity:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0', border: '2px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '10px 14px', border: 'none', background: '#f9fafb', cursor: 'pointer', fontSize: '18px' }}>
                  <Minus size={16} />
                </button>
                <span style={{ padding: '10px 20px', fontWeight: '700', fontSize: '16px', background: '#fff' }}>{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} style={{ padding: '10px 14px', border: 'none', background: '#f9fafb', cursor: 'pointer' }}>
                  <Plus size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addingToCart}
              style={{ flex: 1, minWidth: '150px', padding: '14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: product.stock === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: product.stock === 0 ? 0.5 : 1 }}
            >
              <ShoppingCart size={18} />
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
            <button
              onClick={handleToggleWishlist}
              style={{ padding: '14px 20px', border: '2px solid #e5e7eb', borderRadius: '12px', background: '#fff', cursor: 'pointer', color: inWishlist ? '#ef4444' : '#6b7280' }}
            >
              <Heart size={20} fill={inWishlist ? '#ef4444' : 'none'} />
            </button>
          </div>

          {/* Shop Info */}
          {product.shopId && (
            <Link to={`/shop/${product.shopId._id}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '24px', padding: '14px', background: '#f9fafb', borderRadius: '12px', textDecoration: 'none', border: '1px solid #e5e7eb' }}>
              <Store size={20} style={{ color: '#6366f1' }} />
              <div>
                <p style={{ fontSize: '12px', color: '#9ca3af' }}>Sold by</p>
                <p style={{ fontWeight: '700', color: '#111827' }}>{product.shopId.shopName}</p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
