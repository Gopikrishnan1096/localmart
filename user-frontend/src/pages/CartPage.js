/**
 * CartPage - Shopping cart with quantity management
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package } from 'lucide-react';
import API, { getImageUrl } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CartPage = () => {
  const { fetchCartCount } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], total: 0, itemCount: 0 });
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await API.get('/users/cart');
      setCart(res.data.data);
    } catch {
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, delta) => {
    setUpdatingItem(productId);
    try {
      await API.post('/users/cart', { productId, quantity: delta });
      fetchCart();
      fetchCartCount();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update cart');
    } finally {
      setUpdatingItem(null);
    }
  };

  const removeItem = async (productId) => {
    try {
      await API.delete(`/users/cart/${productId}`);
      fetchCart();
      fetchCartCount();
      toast.success('Item removed from cart');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Clear your entire cart?')) return;
    try {
      await API.delete('/users/cart');
      setCart({ items: [], total: 0, itemCount: 0 });
      fetchCartCount();
      toast.success('Cart cleared');
    } catch {
      toast.error('Failed to clear cart');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><div className="spinner" /></div>;

  if (cart.items.length === 0) {
    return (
      <div className="container page-wrapper">
        <div className="empty-state" style={{ padding: '80px 20px' }}>
          <ShoppingCart size={60} style={{ color: '#d1d5db' }} />
          <h3 style={{ marginTop: '16px', fontSize: '22px' }}>Your cart is empty</h3>
          <p>Start shopping to add items to your cart</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '20px' }}>Browse Shops</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShoppingCart size={26} style={{ color: '#6366f1' }} />
          My Cart ({cart.itemCount} items)
        </h1>
        <button onClick={clearCart} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Trash2 size={16} /> Clear All
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
        {/* Cart Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {cart.items.map(item => (
            <div key={item._id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
              {/* Product Image */}
              <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: '#f9fafb', overflow: 'hidden', flexShrink: 0 }}>
                {item.product?.image ? (
                  <img src={getImageUrl(item.product.image)} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>🛍️</div>
                )}
              </div>

              {/* Product Info */}
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                  {item.product?.name || 'Product Unavailable'}
                </h4>
                <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                  {item.product?.shopId?.shopName}
                </p>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#111827' }}>
                  ₹{((item.product?.discountPrice || item.product?.price || 0)).toFixed(2)}
                </span>
              </div>

              {/* Quantity Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0', border: '2px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
                <button
                  onClick={() => updateQuantity(item.product._id, -1)}
                  disabled={updatingItem === item.product._id}
                  style={{ padding: '8px 12px', border: 'none', background: '#f9fafb', cursor: 'pointer' }}
                >
                  <Minus size={14} />
                </button>
                <span style={{ padding: '8px 16px', fontWeight: '700', background: '#fff' }}>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.product._id, 1)}
                  disabled={updatingItem === item.product._id || item.quantity >= item.product?.stock}
                  style={{ padding: '8px 12px', border: 'none', background: '#f9fafb', cursor: 'pointer' }}
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Subtotal + Remove */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontWeight: '800', fontSize: '18px', color: '#111827', marginBottom: '8px' }}>
                  ₹{item.subtotal?.toFixed(2)}
                </p>
                <button onClick={() => removeItem(item.product._id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', position: 'sticky', top: '90px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Order Summary</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6b7280' }}>
              <span>Subtotal ({cart.itemCount} items)</span>
              <span>₹{cart.total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6b7280' }}>
              <span>Delivery</span>
              <span style={{ color: '#10b981', fontWeight: '600' }}>FREE</span>
            </div>
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '800' }}>
              <span>Total</span>
              <span>₹{cart.total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            Proceed to Checkout <ArrowRight size={18} />
          </button>

          <Link to="/" style={{ display: 'block', textAlign: 'center', marginTop: '12px', color: '#6366f1', fontWeight: '600', fontSize: '14px', textDecoration: 'none' }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
