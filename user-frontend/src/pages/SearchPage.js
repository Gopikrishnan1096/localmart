/**
 * SearchPage - Search products across all shops
 */

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ShoppingCart } from 'lucide-react';
import API, { getImageUrl } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Grocery', 'Fruits & Vegetables', 'Dairy & Eggs', 'Bakery', 'Beverages', 'Pharmacy', 'Electronics', 'Clothing', 'Other'];

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, fetchCartCount } = useAuth();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
    searchProducts(q, category);
  }, [searchParams]);

  const searchProducts = async (q, cat) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (cat && cat !== 'All') params.append('category', cat);
      const res = await API.get(`/products/search?${params}`);
      setProducts(res.data.data || []);
    } catch { toast.error('Search failed'); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(query ? { q: query } : {});
    searchProducts(query, category);
  };

  const addToCart = async (productId) => {
    if (!user) { toast.error('Please login'); return; }
    try {
      await API.post('/users/cart', { productId, quantity: 1 });
      fetchCartCount();
      toast.success('Added to cart! 🛒');
    } catch { toast.error('Failed to add to cart'); }
  };

  return (
    <div className="container page-wrapper">
      <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '20px' }}>Search Products</h1>

      {/* Search Form */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products across all shops..." className="input" style={{ paddingLeft: '42px' }} />
        </div>
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px' }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => { setCategory(cat); searchProducts(query, cat); }} style={{ flexShrink: 0, padding: '6px 14px', border: `2px solid ${category === cat ? '#6366f1' : '#e5e7eb'}`, borderRadius: '20px', background: category === cat ? '#6366f1' : '#fff', color: category === cat ? '#fff' : '#6b7280', cursor: 'pointer', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap' }}>
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" /></div>
      ) : products.length > 0 ? (
        <>
          <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '14px' }}>{products.length} results found</p>
          <div className="grid-4">
            {products.map(product => (
              <div key={product._id} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                <Link to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ height: '130px', background: '#f9fafb', overflow: 'hidden' }}>
                    {product.image ? <img src={getImageUrl(product.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>🛍️</div>}
                  </div>
                  <div style={{ padding: '12px' }}>
                    <p style={{ fontSize: '11px', color: '#6366f1', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>{product.category}</p>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{product.name}</h4>
                    <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>{product.shopId?.shopName}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '800' }}>₹{(product.discountPrice || product.price).toFixed(2)}</span>
                      {product.discountPrice && <span style={{ fontSize: '12px', color: '#9ca3af', textDecoration: 'line-through' }}>₹{product.price}</span>}
                    </div>
                  </div>
                </Link>
                <div style={{ padding: '0 12px 12px' }}>
                  <button onClick={() => addToCart(product._id)} disabled={product.stock === 0} style={{ width: '100%', padding: '8px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: product.stock === 0 ? 'not-allowed' : 'pointer', opacity: product.stock === 0 ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <ShoppingCart size={14} /> {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <Search size={48} />
          <h3>{query ? `No results for "${query}"` : 'Search for products'}</h3>
          <p>{query ? 'Try a different search term or category' : 'Enter a keyword to find products near you'}</p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
