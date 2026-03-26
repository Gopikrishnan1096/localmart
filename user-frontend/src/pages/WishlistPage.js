/**
 * WishlistPage - Saved/liked products
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import API, { getImageUrl } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const WishlistPage = () => {
  const { fetchCartCount } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get('/users/wishlist');
        setWishlist(res.data.data || []);
      } catch { toast.error('Failed to load wishlist'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const removeFromWishlist = async (productId) => {
    try {
      await API.post('/users/wishlist/toggle', { productId });
      setWishlist(wishlist.filter(p => p._id !== productId));
      toast.success('Removed from wishlist');
    } catch { toast.error('Failed to update wishlist'); }
  };

  const addToCart = async (productId) => {
    try {
      await API.post('/users/cart', { productId, quantity: 1 });
      fetchCartCount();
      toast.success('Added to cart! 🛒');
    } catch { toast.error('Failed to add to cart'); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><div className="spinner" /></div>;

  return (
    <div className="container page-wrapper">
      <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Heart size={26} style={{ color: '#ef4444' }} fill="#ef4444" /> My Wishlist
        {wishlist.length > 0 && <span style={{ background: '#fee2e2', color: '#ef4444', padding: '2px 10px', borderRadius: '20px', fontSize: '16px' }}>{wishlist.length}</span>}
      </h1>

      {wishlist.length === 0 ? (
        <div className="empty-state">
          <Heart size={60} style={{ color: '#d1d5db' }} />
          <h3>Your wishlist is empty</h3>
          <p>Like products to save them here</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '20px' }}>Browse Shops</Link>
        </div>
      ) : (
        <div className="grid-4">
          {wishlist.map(product => (
            <div key={product._id} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
              <Link to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
                <div style={{ height: '140px', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {product.image ? (
                    <img src={getImageUrl(product.image)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : <span style={{ fontSize: '40px' }}>🛍️</span>}
                </div>
                <div style={{ padding: '12px' }}>
                  <p style={{ fontSize: '11px', color: '#6366f1', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>{product.category}</p>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>{product.name}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px', fontWeight: '800' }}>₹{(product.discountPrice || product.price).toFixed(2)}</span>
                    {product.discountPrice && <span style={{ fontSize: '12px', color: '#9ca3af', textDecoration: 'line-through' }}>₹{product.price}</span>}
                  </div>
                  {product.shopId?.shopName && <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{product.shopId.shopName}</p>}
                </div>
              </Link>
              <div style={{ display: 'flex', gap: '8px', padding: '0 12px 12px' }}>
                <button onClick={() => addToCart(product._id)} disabled={product.stock === 0} style={{ flex: 1, padding: '8px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: product.stock === 0 ? 0.5 : 1 }}>
                  <ShoppingCart size={14} /> {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button onClick={() => removeFromWishlist(product._id)} style={{ padding: '8px 12px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
