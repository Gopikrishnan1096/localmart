/**
 * OrdersPage - List all user orders
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Clock } from 'lucide-react';
import API, { getImageUrl } from '../utils/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  'Pending': { bg: '#fef3c7', color: '#92400e' },
  'Confirmed': { bg: '#dbeafe', color: '#1e40af' },
  'Packed': { bg: '#ede9fe', color: '#5b21b6' },
  'Out for Delivery': { bg: '#d1fae5', color: '#065f46' },
  'Completed': { bg: '#d1fae5', color: '#065f46' },
  'Cancelled': { bg: '#fee2e2', color: '#991b1b' },
};

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get('/orders/my-orders');
        setOrders(res.data.data || []);
      } catch {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><div className="spinner" /></div>;

  return (
    <div className="container page-wrapper">
      <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Package size={26} style={{ color: '#6366f1' }} /> My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="empty-state">
          <Package size={60} style={{ color: '#d1d5db' }} />
          <h3>No orders yet</h3>
          <p>Start shopping to see your orders here</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '20px' }}>Browse Shops</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map(order => {
            const statusStyle = STATUS_COLORS[order.status] || {};
            return (
              <Link key={order._id} to={`/orders/${order._id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', transition: 'box-shadow 0.2s' }}>
                  {/* Shop Logo */}
                  <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                    {order.shopId?.logo ? (
                      <img src={getImageUrl(order.shopId.logo)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : <Package size={28} style={{ color: '#6366f1' }} />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>{order.shopId?.shopName || 'Shop'}</h3>
                      <span style={{ background: statusStyle.bg, color: statusStyle.color, padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                        {order.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                      {order.products.length} item(s) · ₹{order.totalAmount.toFixed(2)}
                    </p>
                    <p style={{ fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <ChevronRight size={20} style={{ color: '#9ca3af' }} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * OrderDetailPage - Full order details + tracking
 */
export const OrderDetailPage = () => {
  const { id } = require('react-router-dom').useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await API.get(`/orders/${id}`);
        setOrder(res.data.data);
      } catch {
        toast.error('Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await API.patch(`/orders/${id}/cancel`);
      toast.success('Order cancelled');
      setOrder(prev => ({ ...prev, status: 'Cancelled' }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cannot cancel this order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><div className="spinner" /></div>;
  if (!order) return <div className="empty-state"><Package size={48} /><h3>Order not found</h3></div>;

  const statusStyle = STATUS_COLORS[order.status] || {};
  const STEPS = ['Pending', 'Confirmed', 'Packed', 'Out for Delivery', 'Completed'];
  const stepIndex = order.status === 'Cancelled' ? -1 : STEPS.indexOf(order.status);

  return (
    <div className="container page-wrapper">
      <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#6366f1', textDecoration: 'none', fontWeight: '600', marginBottom: '24px' }}>
        ← Back to Orders
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Order Header */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Order #{order._id.slice(-8).toUpperCase()}</h2>
                <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <span style={{ background: statusStyle.bg, color: statusStyle.color, padding: '6px 16px', borderRadius: '20px', fontWeight: '700', fontSize: '14px' }}>
                {order.status}
              </span>
            </div>
          </div>

          {/* Order Tracking (only if not cancelled) */}
          {order.status !== 'Cancelled' && (
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontWeight: '700', marginBottom: '20px' }}>Order Tracking</h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '16px', left: '10%', right: '10%', height: '3px', background: '#e5e7eb', zIndex: 0 }} />
                <div style={{ position: 'absolute', top: '16px', left: '10%', width: `${Math.max(0, stepIndex / (STEPS.length - 1)) * 80}%`, height: '3px', background: '#6366f1', zIndex: 1, transition: 'width 0.5s' }} />
                {STEPS.map((step, idx) => (
                  <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 2, flex: 1 }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: idx <= stepIndex ? '#6366f1' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: '700', border: '3px solid #fff', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                      {idx <= stepIndex ? '✓' : idx + 1}
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: idx <= stepIndex ? '#6366f1' : '#9ca3af', textAlign: 'center' }}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontWeight: '700', marginBottom: '16px' }}>Items Ordered</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {order.products.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f9fafb', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {item.productImage && (
                      <img src={getImageUrl(item.productImage)} alt="" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                    )}
                    <div>
                      <p style={{ fontWeight: '600', color: '#111827' }}>{item.productName}</p>
                      <p style={{ fontSize: '13px', color: '#6b7280' }}>Qty: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <span style={{ fontWeight: '700', fontSize: '16px' }}>₹{item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Info Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontWeight: '700', marginBottom: '16px' }}>Payment Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Subtotal</span>
                <span>₹{order.totalAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Delivery</span>
                <span style={{ color: '#10b981', fontWeight: '600' }}>FREE</span>
              </div>
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '18px' }}>
                <span>Total</span>
                <span>₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
            <div style={{ marginTop: '12px', padding: '10px', background: '#f9fafb', borderRadius: '8px', fontSize: '13px', color: '#6b7280' }}>
              💳 {order.paymentMethod} · {order.paymentStatus}
            </div>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontWeight: '700', marginBottom: '12px' }}>Delivery Address</h3>
            <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>{order.deliveryAddress}</p>
          </div>

          {['Pending', 'Confirmed'].includes(order.status) && (
            <button onClick={handleCancel} disabled={cancelling} style={{ width: '100%', padding: '12px', background: '#fee2e2', color: '#991b1b', border: '2px solid #fca5a5', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>
              {cancelling ? 'Cancelling...' : '✕ Cancel Order'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
