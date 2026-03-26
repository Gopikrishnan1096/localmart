/**
 * OrdersPage (Shop Dashboard) - Manage incoming orders and update status
 */

import React, { useState, useEffect } from 'react';
import { ShoppingBag, ChevronDown, Eye, X } from 'lucide-react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUSES = ['All', 'Pending', 'Confirmed', 'Packed', 'Out for Delivery', 'Completed', 'Cancelled'];
const NEXT_STATUS = {
  'Pending': ['Confirmed', 'Cancelled'],
  'Confirmed': ['Packed', 'Cancelled'],
  'Packed': ['Out for Delivery', 'Cancelled'],
  'Out for Delivery': ['Completed'],
  'Completed': [],
  'Cancelled': [],
};

const STATUS_COLORS = {
  'Pending': 'status-pending',
  'Confirmed': 'status-confirmed',
  'Packed': 'status-packed',
  'Out for Delivery': 'status-out-for-delivery',
  'Completed': 'status-completed',
  'Cancelled': 'status-cancelled',
};

const OrdersPage = () => {
  const { shop } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrder, setUpdatingOrder] = useState(null);

  useEffect(() => {
    if (shop) fetchOrders();
  }, [shop, selectedStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = selectedStatus !== 'All' ? `?status=${encodeURIComponent(selectedStatus)}` : '';
      const res = await API.get(`/orders/shop/${shop._id}${params}`);
      setOrders(res.data.data || []);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    setUpdatingOrder(orderId);
    try {
      await API.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?._id === orderId) setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      toast.success(`Order updated to "${newStatus}"`);
    } catch {
      toast.error('Failed to update order status');
    } finally {
      setUpdatingOrder(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Orders</h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>{orders.length} order(s) found</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '20px' }}>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setSelectedStatus(s)} style={{ flexShrink: 0, padding: '7px 16px', border: `2px solid ${selectedStatus === s ? '#059669' : '#e5e7eb'}`, borderRadius: '20px', background: selectedStatus === s ? '#059669' : '#fff', color: selectedStatus === s ? '#fff' : '#6b7280', cursor: 'pointer', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" /></div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
          <ShoppingBag size={48} style={{ color: '#d1d5db', margin: '0 auto 16px' }} />
          <h3>No {selectedStatus !== 'All' ? selectedStatus : ''} orders</h3>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id}>
                    <td><code style={{ fontSize: '12px', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>#{order._id.slice(-6).toUpperCase()}</code></td>
                    <td>
                      <p style={{ fontWeight: '600' }}>{order.userId?.name || 'Customer'}</p>
                      <p style={{ fontSize: '12px', color: '#9ca3af' }}>{order.userId?.phone || order.userId?.email}</p>
                    </td>
                    <td>{order.products?.length} item(s)</td>
                    <td style={{ fontWeight: '700' }}>₹{order.totalAmount?.toFixed(2)}</td>
                    <td><span style={{ fontSize: '13px', color: '#6b7280' }}>{order.paymentMethod}</span></td>
                    <td>
                      <span className={`badge ${STATUS_COLORS[order.status] || ''}`}>{order.status}</span>
                    </td>
                    <td style={{ fontSize: '13px', color: '#9ca3af' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button onClick={() => setSelectedOrder(order)} className="btn btn-secondary btn-sm">
                          <Eye size={13} /> View
                        </button>
                        {/* Status update buttons */}
                        {NEXT_STATUS[order.status]?.map(nextStatus => (
                          <button
                            key={nextStatus}
                            onClick={() => updateStatus(order._id, nextStatus)}
                            disabled={updatingOrder === order._id}
                            className="btn btn-sm"
                            style={{
                              background: nextStatus === 'Cancelled' ? '#fee2e2' : '#d1fae5',
                              color: nextStatus === 'Cancelled' ? '#991b1b' : '#065f46'
                            }}
                          >
                            {updatingOrder === order._id ? '...' : `→ ${nextStatus}`}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '600px', width: '100%', maxHeight: '80vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Order #{selectedOrder._id.slice(-6).toUpperCase()}</h3>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px' }}>
              {/* Customer Info */}
              <div style={{ marginBottom: '20px', padding: '14px', background: '#f9fafb', borderRadius: '10px' }}>
                <h4 style={{ fontWeight: '700', marginBottom: '8px' }}>Customer</h4>
                <p style={{ fontWeight: '600' }}>{selectedOrder.userId?.name}</p>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>{selectedOrder.userId?.phone || selectedOrder.userId?.email}</p>
                <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px' }}>📍 {selectedOrder.deliveryAddress}</p>
                {selectedOrder.notes && <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px' }}>📝 {selectedOrder.notes}</p>}
              </div>

              {/* Products */}
              <h4 style={{ fontWeight: '700', marginBottom: '10px' }}>Items Ordered</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                {selectedOrder.products?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f9fafb', borderRadius: '8px', fontSize: '14px' }}>
                    <span>{item.productName} × {item.quantity}</span>
                    <span style={{ fontWeight: '700' }}>₹{item.subtotal?.toFixed(2)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '16px', padding: '10px', borderTop: '2px solid #e5e7eb', marginTop: '4px' }}>
                  <span>Total</span>
                  <span>₹{selectedOrder.totalAmount?.toFixed(2)}</span>
                </div>
              </div>

              {/* Status update */}
              <h4 style={{ fontWeight: '700', marginBottom: '10px' }}>Update Status</h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className={`badge ${STATUS_COLORS[selectedOrder.status] || ''}`} style={{ padding: '6px 14px', fontSize: '13px' }}>
                  Current: {selectedOrder.status}
                </span>
                {NEXT_STATUS[selectedOrder.status]?.map(nextStatus => (
                  <button
                    key={nextStatus}
                    onClick={() => updateStatus(selectedOrder._id, nextStatus)}
                    className="btn btn-sm"
                    style={{ background: nextStatus === 'Cancelled' ? '#fee2e2' : '#059669', color: nextStatus === 'Cancelled' ? '#991b1b' : '#fff' }}
                  >
                    Mark as {nextStatus}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
