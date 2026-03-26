import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const SubscriptionsPage = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            const res = await api.get(
                `/admin/subscriptions?page=${page}&limit=20`
            );
            if (res.data.success) {
                setSubscriptions(res.data.data);
                setTotalPages(res.data.pagination.pages);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch subscriptions');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/stats');
            if (res.data.success) {
                setStats(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch stats for revenue');
        }
    };

    useEffect(() => {
        fetchSubscriptions();
        fetchStats();
    }, [page]);

    return (
        <div style={{ padding: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Platform Subscriptions</h1>

            {/* Subscriptions Stats / Revenue */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <p style={{ fontSize: '14px', color: '#64748b', fontWeight: 'bold', marginBottom: '10px' }}>Active Subscriptions</p>
                    <p style={{ fontSize: '28px', color: '#0f172a', fontWeight: 'bold' }}>{stats.activeSubscriptions || 0}</p>
                </div>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <p style={{ fontSize: '14px', color: '#64748b', fontWeight: 'bold', marginBottom: '10px' }}>Subscription Revenue (Stripe)</p>
                    <p style={{ fontSize: '28px', color: '#10b981', fontWeight: 'bold' }}>₹{stats.subscriptionRevenue || 0}</p>
                </div>
            </div>

            {/* Subscriptions Table */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Shop Name</th>
                                <th>Owner Email</th>
                                <th>Plan Name</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Start Date</th>
                                <th>Stripe Sub ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && subscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Loading...</td>
                                </tr>
                            ) : subscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No subscriptions found</td>
                                </tr>
                            ) : (
                                subscriptions.map(sub => (
                                    <tr key={sub._id}>
                                        <td style={{ fontWeight: 600 }}>{sub.shopId?.shopName}</td>
                                        <td>{sub.shopId?.ownerId?.email}</td>
                                        <td>
                                            <span style={{ 
                                                padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                                                background: sub.planId?.name === 'Free' ? '#f1f5f9' : '#dbeafe',
                                                color: sub.planId?.name === 'Free' ? '#64748b' : '#3b82f6'
                                            }}>
                                                {sub.planId?.name}
                                            </span>
                                        </td>
                                        <td>₹{sub.planId?.price}</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                                                background: sub.status === 'active' ? '#ecfdf5' : '#fef2f2',
                                                color: sub.status === 'active' ? '#10b981' : '#f43f5e'
                                            }}>
                                                {sub.status?.toUpperCase() || 'UNKNOWN'}
                                            </span>
                                        </td>
                                        <td>{new Date(sub.startDate).toLocaleDateString()}</td>
                                        <td style={{ fontSize: '13px', color: '#94a3b8' }}>
                                            {sub.stripeSubscriptionId || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '16px', borderTop: '1px solid #e2e8f0', gap: '8px' }}>
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff' }}
                        >
                            Previous
                        </button>
                        <span style={{ padding: '6px 12px', fontSize: '14px', fontWeight: 600 }}>{page} / {totalPages}</span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(page + 1)}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff' }}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubscriptionsPage;
