/**
 * ProductsPage - List and manage shop products
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Package, ToggleLeft, ToggleRight, Search } from 'lucide-react';
import API, { getImageUrl } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProductsPage = () => {
  const { shop } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (shop) fetchProducts();
  }, [shop]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Get ALL products including unavailable for shop owner view
      const res = await API.get(`/products/shop/${shop._id}`);
      setProducts(res.data.data || []);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Delete "${productName}"? This cannot be undone.`)) return;
    setDeleting(productId);
    try {
      await API.delete(`/products/${productId}`);
      setProducts(products.filter(p => p._id !== productId));
      toast.success('Product deleted successfully');
    } catch {
      toast.error('Failed to delete product');
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleAvailability = async (product) => {
    try {
      await API.put(`/products/${product._id}`, { isAvailable: !product.isAvailable });
      setProducts(products.map(p => p._id === product._id ? { ...p, isAvailable: !p.isAvailable } : p));
      toast.success(`Product ${product.isAvailable ? 'hidden' : 'made available'}`);
    } catch {
      toast.error('Failed to update product');
    }
  };

  const handleStockUpdate = async (productId, newStock) => {
    const stock = parseInt(newStock);
    if (isNaN(stock) || stock < 0) return;
    try {
      await API.patch(`/products/${productId}/stock`, { stock });
      setProducts(products.map(p => p._id === productId ? { ...p, stock } : p));
      toast.success('Stock updated!');
    } catch {
      toast.error('Failed to update stock');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!shop) {
    return (
      <div style={{ textAlign: 'center', padding: '80px' }}>
        <Package size={48} style={{ color: '#d1d5db', margin: '0 auto 16px' }} />
        <h3>Create your shop first</h3>
        <Link to="/settings" className="btn btn-primary" style={{ marginTop: '16px' }}>Create Shop</Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800' }}>My Products</h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>{products.length} total products</p>
        </div>
        <Link to="/products/add" className="btn btn-primary">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '20px', maxWidth: '380px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input"
          style={{ paddingLeft: '38px' }}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" /></div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
          <Package size={48} style={{ color: '#d1d5db', margin: '0 auto 16px' }} />
          <h3 style={{ marginBottom: '8px' }}>{searchQuery ? 'No products match your search' : 'No products yet'}</h3>
          {!searchQuery && <Link to="/products/add" className="btn btn-primary" style={{ marginTop: '16px' }}>Add Your First Product</Link>}
        </div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product._id}>
                    {/* Product Info */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#f3f4f6', overflow: 'hidden', flexShrink: 0 }}>
                          {product.image ? (
                            <img src={getImageUrl(product.image)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🛍️</div>}
                        </div>
                        <div>
                          <p style={{ fontWeight: '600', color: '#111827' }}>{product.name}</p>
                          {product.description && <p style={{ fontSize: '12px', color: '#9ca3af' }}>{product.description.substring(0, 40)}...</p>}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="badge" style={{ background: '#ede9fe', color: '#5b21b6' }}>{product.category}</span>
                    </td>

                    <td>
                      <p style={{ fontWeight: '700' }}>₹{product.price.toFixed(2)}</p>
                      {product.discountPrice && <p style={{ fontSize: '12px', color: '#059669' }}>Sale: ₹{product.discountPrice.toFixed(2)}</p>}
                    </td>

                    {/* Inline stock editor */}
                    <td>
                      <input
                        type="number"
                        defaultValue={product.stock}
                        min="0"
                        onBlur={(e) => handleStockUpdate(product._id, e.target.value)}
                        style={{ width: '70px', padding: '5px 8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: '600', textAlign: 'center' }}
                      />
                      {product.stock === 0 && <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '2px' }}>Out of stock</p>}
                      {product.stock > 0 && product.stock < 10 && <p style={{ fontSize: '11px', color: '#f59e0b', marginTop: '2px' }}>Low stock</p>}
                    </td>

                    <td>
                      <button onClick={() => handleToggleAvailability(product)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: product.isAvailable ? '#059669' : '#9ca3af', fontWeight: '600', fontSize: '13px' }}>
                        {product.isAvailable ? <ToggleRight size={20} style={{ color: '#059669' }} /> : <ToggleLeft size={20} />}
                        {product.isAvailable ? 'Visible' : 'Hidden'}
                      </button>
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link to={`/products/edit/${product._id}`} className="btn btn-secondary btn-sm">
                          <Edit2 size={13} /> Edit
                        </Link>
                        <button onClick={() => handleDelete(product._id, product.name)} disabled={deleting === product._id} className="btn btn-danger btn-sm">
                          <Trash2 size={13} /> {deleting === product._id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
