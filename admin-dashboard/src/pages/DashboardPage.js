import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import {
    Users, Store, Package, ShoppingCart,
    DollarSign, TrendingUp, UserPlus, Clock
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar
} from 'recharts';

const DashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/stats');
                setStats(res.data.data);
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="loading-center"><div className="spinner" /></div>;
    if (!stats) return <div className="empty-state"><h3>Failed to load stats</h3></div>;

    const statCards = [
        { label: 'Total Users', value: stats.totalUsers, icon: Users, colorClass: 'icon-indigo' },
        { label: 'Shop Owners', value: stats.totalShopOwners, icon: Store, colorClass: 'icon-green' },
        { label: 'Total Shops', value: stats.totalShops, icon: Store, colorClass: 'icon-blue' },
        { label: 'Total Products', value: stats.totalProducts, icon: Package, colorClass: 'icon-purple' },
        { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, colorClass: 'icon-orange' },
        { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, colorClass: 'icon-rose' },
        { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, colorClass: 'icon-green' },
        { label: 'New Users (7d)', value: stats.recentUsers, icon: UserPlus, colorClass: 'icon-indigo' },
    ];

    return (
        <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Platform Overview</h2>

            <div className="stats-grid">
                {statCards.map((card, i) => (
                    <div key={i} className="stat-card">
                        <div className={`stat-icon ${card.colorClass}`}>
                            <card.icon size={24} />
                        </div>
                        <div>
                            <div className="stat-value">{card.value}</div>
                            <div className="stat-label">{card.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid-2">
                <div className="card">
                    <div className="card-header">
                        <h3><TrendingUp size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Daily Orders (30 days)</h3>
                    </div>
                    <div className="card-body">
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.dailyOrders}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="_id" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="orders" stroke="#6366f1" fill="#e0e7ff" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3><DollarSign size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Daily Revenue (30 days)</h3>
                    </div>
                    <div className="card-body">
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.dailyOrders}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="_id" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Bar dataKey="revenue" fill="#818cf8" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
