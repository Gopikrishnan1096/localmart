import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Search, Trash2 } from 'lucide-react';

const UPLOAD_URL = process.env.REACT_APP_UPLOAD_URL || 'http://localhost:5000';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});

    const categories = [
        'Grocery', 'Fruits & Vegetables', 'Dairy & Eggs', 'Bakery',
        'Beverages', 'Snacks', 'Pharmacy', 'Electronics', 'Clothing',
        'Home & Kitchen', 'Personal Care', 'Stationery', 'Toys', 'Other'
    ];

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 15 };
            if (search) params.search = search;
            if (category) params.category = category;
            const res = await api.get('/admin/products', { params });
            setProducts(res.data.data);
            setPagination(res.data.pagination);
        } catch (err) {
            toast.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    }, [page, search, category]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete product "${name}"?`)) return;
        try {
            await api.delete(`/admin/products/${id}`);
            toast.success('Product deleted');
            fetchProducts();
        } catch (err) {
            toast.error('Failed to delete product');
        }
    };

    const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchProducts(); };

    return (
        <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Product Management</h2>

            <form onSubmit={handleSearch} className="search-bar">
                <div className="search-input" style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                        className="input"
                        style={{ paddingLeft: 40 }}
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select className="input" style={{ width: 180 }} value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
                    <option value="">All Categories</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
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
                                    <th>Product</th>
                                    <th>Shop</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length === 0 ? (
                                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No products found</td></tr>
                                ) : products.map((product) => (
                                    <tr key={product._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                {product.image ? (
                                                    <img
                                                        src={`${UPLOAD_URL}/${product.image}`}
                                                        alt={product.name}
                                                        style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#9ca3af' }}>N/A</div>
                                                )}
                                                <span style={{ fontWeight: 600 }}>{product.name}</span>
                                            </div>
                                        </td>
                                        <td>{product.shopId?.shopName || 'N/A'}</td>
                                        <td><span className="badge badge-user" style={{ fontSize: 11 }}>{product.category}</span></td>
                                        <td>
                                            {product.discountPrice ? (
                                                <div>
                                                    <span style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: 12 }}>₹{product.price}</span>
                                                    <br />
                                                    <span style={{ fontWeight: 700, color: '#059669' }}>₹{product.discountPrice}</span>
                                                </div>
                                            ) : (
                                                <span style={{ fontWeight: 600 }}>₹{product.price}</span>
                                            )}
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 600, color: product.stock === 0 ? '#ef4444' : '#111827' }}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${product.isAvailable ? 'badge-shopowner' : 'status-cancelled'}`}>
                                                {product.isAvailable ? 'Available' : 'Unavailable'}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn-icon" onClick={() => handleDelete(product._id, product.name)} title="Delete product">
                                                <Trash2 size={16} color="#ef4444" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {pagination.pages > 1 && (
                    <div className="pagination" style={{ padding: '12px 16px' }}>
                        <span>Page {pagination.page} of {pagination.pages} ({pagination.total} products)</span>
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

export default ProductsPage;
