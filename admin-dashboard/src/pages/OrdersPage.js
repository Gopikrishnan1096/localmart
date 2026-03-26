import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});

    const statuses = ['Pending', 'Confirmed', 'Packed', 'Out for Delivery', 'Completed', 'Cancelled'];

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 15 };
            if (statusFilter) params.status = statusFilter;
            const res = await api.get('/admin/orders', { params });
            setOrders(res.data.data);
            setPagination(res.data.pagination);
        } catch (err) {
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
            toast.success(`Order status updated to ${newStatus}`);
            fetchOrders();
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const getStatusClass = (status) => {
        const map = {
            'Pending': 'status-pending',
            'Confirmed': 'status-confirmed',
            'Packed': 'status-packed',
            'Out for Delivery': 'status-out-for-delivery',
            'Completed': 'status-completed',
            'Cancelled': 'status-cancelled'
        };
        return map[status] || '';
    };

    return (
        <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Order Management</h2>

            <div className="search-bar">
                <select className="input" style={{ width: 200 }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                    <option value="">All Statuses</option>
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <div className="card">
                <div className="table-wrapper">
                    {loading ? (
                        <div className="loading-center"><div className="spinner" /></div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Shop</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Payment</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length === 0 ? (
                                    <tr><td colSpan="9" style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No orders found</td></tr>
                                ) : orders.map((order) => (
                                    <tr key={order._id}>
                                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>#{order._id.slice(-6).toUpperCase()}</td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{order.userId?.name || 'N/A'}</div>
                                            <div style={{ fontSize: 12, color: '#9ca3af' }}>{order.userId?.email}</div>
                                        </td>
                                        <td>{order.shopId?.shopName || 'N/A'}</td>
                                        <td>{order.products?.length || 0} item(s)</td>
                                        <td style={{ fontWeight: 700 }}>₹{order.totalAmount}</td>
                                        <td><span className={`badge ${getStatusClass(order.status)}`}>{order.status}</span></td>
                                        <td>
                                            <span className={`badge ${order.paymentStatus === 'Paid' ? 'badge-shopowner' : 'status-pending'}`}>
                                                {order.paymentStatus}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: 13 }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <select
                                                className="input"
                                                style={{ width: 150, padding: '4px 8px', fontSize: 12 }}
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                            >
                                                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {pagination.pages > 1 && (
                    <div className="pagination" style={{ padding: '12px 16px' }}>
                        <span>Page {pagination.page} of {pagination.pages} ({pagination.total} orders)</span>
                        <div className="pagination-buttons">
                            <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
                            <button className="btn btn-secondary btn-sm" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
