/**
 * CheckoutPage - Place order with delivery details
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Package, CheckCircle, ArrowLeft } from 'lucide-react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const { user, fetchCartCount } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState(user?.location?.address || '');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await API.get('/users/cart');
      const cartData = res.data.data;
      if (!cartData.items || cartData.items.length === 0) {
        toast.error('Your cart is empty');
        navigate('/cart');
        return;
      }
      setCart(cartData);
    } catch {
      toast.error('Failed to load cart');
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      toast.error('Please enter delivery address');
      return;
    }

    // Group items by shop (only support single shop orders for simplicity)
    const shopGroups = {};
    cart.items.forEach(item => {
      if (!item.product) return;
      const shopId = item.product.shopId?._id || item.product.shopId;
      if (!shopGroups[shopId]) shopGroups[shopId] = [];
      shopGroups[shopId].push({ productId: item.product._id, quantity: item.quantity });
    });

    const shopIds = Object.keys(shopGroups);
    if (shopIds.length === 0) {
      toast.error('Cart appears to be empty or invalid.');
      return;
    }

    setPlacing(true);
    try {
      // Place order for first shop (can be extended to multi-shop)
      const shopId = shopIds[0];
      const res = await API.post('/orders', {
        shopId,
        products: shopGroups[shopId],
        paymentMethod,
        deliveryAddress,
        notes
      });

      fetchCartCount();
      toast.success('Order placed successfully! 🎉');
      navigate(`/orders/${res.data.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><div className="spinner" /></div>;

  return (
    <div className="container page-wrapper">
      <button onClick={() => navigate('/cart')} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', marginBottom: '24px', fontSize: '14px' }}>
        <ArrowLeft size={18} /> Back to Cart
      </button>

      <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '24px' }}>Checkout</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', alignItems: 'start' }}>
        {/* Checkout Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Delivery Address */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>
              <MapPin size={20} style={{ color: '#6366f1' }} /> Delivery Address
            </h3>
            <textarea
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Enter your complete delivery address..."
              className="input"
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Payment Method */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>
              <CreditCard size={20} style={{ color: '#6366f1' }} /> Payment Method
            </h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {['Cash on Delivery', 'Online'].map(method => (
                <label key={method} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px', border: `2px solid ${paymentMethod === method ? '#6366f1' : '#e5e7eb'}`, borderRadius: '12px', cursor: 'pointer', flex: 1, background: paymentMethod === method ? '#f0f0ff' : '#fff' }}>
                  <input type="radio" name="payment" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} style={{ accentColor: '#6366f1' }} />
                  <span style={{ fontWeight: '600', color: paymentMethod === method ? '#6366f1' : '#374151' }}>{method}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Special Notes */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Special Instructions (Optional)</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests for the shop..."
              className="input"
              rows={2}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Order Summary */}
        <div style={{ position: 'sticky', top: '90px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={20} style={{ color: '#6366f1' }} /> Order Summary
            </h3>

            {/* Items */}
            <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cart.items.map(item => (
                item.product && (
                  <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                    <span style={{ color: '#374151' }}>{item.product.name} × {item.quantity}</span>
                    <span style={{ fontWeight: '600' }}>₹{item.subtotal?.toFixed(2)}</span>
                  </div>
                )
              ))}
            </div>

            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6b7280' }}>
                <span>Subtotal</span><span>₹{cart.total.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#10b981' }}>
                <span>Delivery</span><span style={{ fontWeight: '600' }}>FREE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '20px', borderTop: '1px solid #e5e7eb', paddingTop: '10px' }}>
                <span>Total</span><span>₹{cart.total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              style={{ width: '100%', marginTop: '20px', padding: '15px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: placing ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {placing ? (
                <>Placing Order...</>
              ) : (
                <><CheckCircle size={18} /> Place Order</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
