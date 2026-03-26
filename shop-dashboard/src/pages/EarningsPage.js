/**
 * EarningsPage - Sales reports and charts
 */

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, IndianRupee, ShoppingBag, BarChart2 } from 'lucide-react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const EarningsPage = () => {
  const { shop } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (shop) fetchStats();
  }, [shop]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/shops/${shop._id}/stats`);
      setStats(res.data.data);
    } catch {
      toast.error('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><div className="spinner" /></div>;

  if (!stats) return null;

  const earningsCards = [
    { label: "Today's Earnings", value: `₹${stats.todayEarnings?.toFixed(2) || '0.00'}`, icon: IndianRupee, color: '#d1fae5', iconColor: '#059669' },
    { label: 'This Month', value: `₹${stats.monthEarnings?.toFixed(2) || '0.00'}`, icon: TrendingUp, color: '#dbeafe', iconColor: '#3b82f6' },
    { label: 'Total Earnings', value: `₹${stats.totalEarnings?.toFixed(2) || '0.00'}`, icon: BarChart2, color: '#ede9fe', iconColor: '#8b5cf6' },
    { label: 'Total Orders', value: stats.totalOrders || 0, icon: ShoppingBag, color: '#fef3c7', iconColor: '#f59e0b' },
  ];

  // Format daily sales for chart
  const chartData = (stats.dailySales || []).map(d => ({
    date: new Date(d._id).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    earnings: d.sales,
    orders: d.orders,
  }));

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Earnings Report</h1>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Track your shop's performance and revenue</p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid" style={{ marginBottom: '28px' }}>
        {earningsCards.map((card, idx) => (
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

      {/* Charts */}
      {chartData.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Earnings Chart */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Daily Earnings (Last 30 Days)</h3>
            </div>
            <div style={{ padding: '20px' }}>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip formatter={(value) => [`₹${value.toFixed(2)}`, 'Earnings']} />
                  <Area type="monotone" dataKey="earnings" stroke="#059669" strokeWidth={2} fill="url(#earningsGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Orders Chart */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Daily Orders (Last 30 Days)</h3>
            </div>
            <div style={{ padding: '20px' }}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip formatter={(value) => [value, 'Orders']} />
                  <Bar dataKey="orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
          <BarChart2 size={48} style={{ color: '#d1d5db', margin: '0 auto 16px' }} />
          <h3>No sales data yet</h3>
          <p>Sales charts will appear once you receive completed orders</p>
        </div>
      )}
    </div>
  );
};

export default EarningsPage;
