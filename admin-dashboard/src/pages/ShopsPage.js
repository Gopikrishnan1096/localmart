import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Search, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

const ShopsPage = () => {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});

    const fetchShops = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 15 };
            if (search) params.search = search;
            const res = await api.get('/admin/shops', { params });
            setShops(res.data.data);
            setPagination(res.data.pagination);
        } catch (err) {
            toast.error('Failed to fetch shops');
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => { fetchShops(); }, [fetchShops]);

    const handleToggle = async (shopId) => {
        try {
            const res = await api.put(`/admin/shops/${shopId}/toggle`);
            toast.success(res.data.message);
            fetchShops();
        } catch (err) {
            toast.error('Failed to toggle shop');
        }
    };

    const handleDelete = async (shopId, name) => {
        if (!window.confirm(`Delete "${name}" and all its products? This cannot be undone.`)) return;
        try {
            await api.delete(`/admin/shops/${shopId}`);
            toast.success('Shop deleted');
            fetchShops();
        } catch (err) {
            toast.error('Failed to delete shop');
        }
    };

    const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchShops(); };

    return (
        <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Shop Management</h2>

            <form onSubmit={handleSearch} className="search-bar">
                <div className="search-input" style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                        className="input"
                        style={{ paddingLeft: 40 }}
                        placeholder="Search shops..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button type="submit" className="btn btn-primary">Search</button>
            </form>

            <div className="card">
                <div className="table-wrapper">
                    {loading ? (
                        <div className="loading-center"><div className="spinner" /></div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Shop Name</th>
                                    <th>Owner</th>
                                    <th>Address</th>
                                    <th>Categories</th>
                                    <th>Status</th>
                                    <th>Orders</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shops.length === 0 ? (
                                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No shops found</td></tr>
                                ) : shops.map((shop) => (
                                    <tr key={shop._id}>
                                        <td style={{ fontWeight: 600 }}>{shop.shopName}</td>
                                        <td>{shop.ownerId?.name || 'N/A'}<br /><span style={{ fontSize: 12, color: '#9ca3af' }}>{shop.ownerId?.email}</span></td>
                                        <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shop.address}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                                {shop.categories?.slice(0, 2).map((cat, i) => (
                                                    <span key={i} className="badge badge-user" style={{ fontSize: 11 }}>{cat}</span>
                                                ))}
                                                {shop.categories?.length > 2 && <span style={{ fontSize: 11, color: '#9ca3af' }}>+{shop.categories.length - 2}</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${shop.isActive ? 'badge-shopowner' : 'status-cancelled'}`}>
                                                {shop.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>{shop.totalOrders || 0}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button className="btn-icon" onClick={() => handleToggle(shop._id)} title={shop.isActive ? 'Deactivate' : 'Activate'}>
                                                    {shop.isActive ? <ToggleRight size={18} color="#10b981" /> : <ToggleLeft size={18} color="#9ca3af" />}
                                                </button>
                                                <button className="btn-icon" onClick={() => handleDelete(shop._id, shop.shopName)} title="Delete shop">
                                                    <Trash2 size={16} color="#ef4444" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {pagination.pages > 1 && (
                    <div className="pagination" style={{ padding: '12px 16px' }}>
                        <span>Page {pagination.page} of {pagination.pages} ({pagination.total} shops)</span>
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

export default ShopsPage;
