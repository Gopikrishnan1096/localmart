/**
 * DashboardPage - Shop overview with stats and recent orders
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Package, ShoppingBag, IndianRupee, Clock, AlertCircle, Store, Plus } from 'lucide-react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  'Pending': 'status-pending',
  'Confirmed': 'status-confirmed',
  'Packed': 'status-packed',
  'Out for Delivery': 'status-out-for-delivery',
  'Completed': 'status-completed',
  'Cancelled': 'status-cancelled',
};

const DashboardPage = () => {
  const { shop } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (shop) {
      fetchStats();
      fetchRecentOrders();
    } else {
      setLoading(false);
    }
  }, [shop]);

  const fetchStats = async () => {
    try {
      const res = await API.get(`/shops/${shop._id}/stats`);
      setStats(res.data.data);
    } catch {
      toast.error('Failed to load stats');
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const res = await API.get(`/orders/shop/${shop._id}?limit=5`);
      setRecentOrders(res.data.data || []);
    } catch {} finally {
      setLoading(false);
    }
  };

  if (!shop) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px', textAlign: 'center' }}>
        <Store size={64} style={{ color: '#d1d5db' }} />
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827' }}>Welcome to LocalMart!</h2>
        <p style={{ color: '#6b7280', maxWidth: '400px' }}>You haven't set up your shop yet. Create your shop profile to start selling.</p>
        <Link to="/settings" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '15px' }}>
          <Plus size={18} /> Create My Shop
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><div className="spinner" /></div>;
  }

  const statCards = [
    { label: "Today's Earnings", value: `₹${stats?.todayEarnings?.toFixed(2) || '0.00'}`, icon: IndianRupee, color: '#d1fae5', iconColor: '#059669' },
    { label: 'Month Earnings', value: `₹${stats?.monthEarnings?.toFixed(2) || '0.00'}`, icon: TrendingUp, color: '#dbeafe', iconColor: '#3b82f6' },
    { label: "Today's Orders", value: stats?.todayOrders || 0, icon: ShoppingBag, color: '#ede9fe', iconColor: '#8b5cf6' },
    { label: 'Pending Orders', value: stats?.pendingOrders || 0, icon: Clock, color: '#fef3c7', iconColor: '#f59e0b' },
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Dashboard Overview</h1>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '2px' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link to="/products/add" className="btn btn-primary">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Pending Orders Alert */}
      {stats?.pendingOrders > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '10px', marginBottom: '20px' }}>
          <AlertCircle size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#92400e' }}>
            You have {stats.pendingOrders} pending order{stats.pendingOrders > 1 ? 's' : ''} waiting for action!
          </span>
          <Link to="/orders" className="btn btn-sm" style={{ marginLeft: 'auto', background: '#f59e0b', color: '#fff' }}>
            View Orders
          </Link>
        </div>
      )}

      {/* Stat Cards */}
      <div className="stats-grid">
        {statCards.map((card, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-icon" style={{ background: card.color }}>
              <card.icon size={24} style={{ color: card.iconColor }} />
            </div>
            <div>
              <p className="stat-value">{card.value}</p>
              <p className="stat-label">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Orders', value: stats?.totalOrders || 0 },
          { label: 'Active Products', value: stats?.productCount || 0 },
          { label: 'Total Earnings', value: `₹${stats?.totalEarnings?.toFixed(2) || '0.00'}` },
        ].map((item, idx) => (
          <div key={idx} className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '28px', fontWeight: '800', color: '#059669' }}>{item.value}</p>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{item.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="card-header">
          <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Recent Orders</h2>
          <Link to="/orders" className="btn btn-secondary btn-sm">View All</Link>
        </div>

        {recentOrders.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            <ShoppingBag size={40} style={{ color: '#d1d5db', margin: '0 auto 12px' }} />
            <p>No orders yet. Share your shop with customers!</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order._id}>
                    <td><code style={{ fontSize: '12px', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>#{order._id.slice(-6).toUpperCase()}</code></td>
                    <td>
                      <p style={{ fontWeight: '600' }}>{order.userId?.name || 'Customer'}</p>
                      <p style={{ fontSize: '12px', color: '#9ca3af' }}>{order.userId?.phone}</p>
                    </td>
                    <td>{order.products?.length} item(s)</td>
                    <td style={{ fontWeight: '700' }}>₹{order.totalAmount?.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${STATUS_COLORS[order.status] || ''}`}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ color: '#9ca3af', fontSize: '13px' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
