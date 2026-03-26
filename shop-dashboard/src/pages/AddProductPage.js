/**
 * AddProductPage - Form to add a new product
 */

import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Upload, ArrowLeft, Package } from 'lucide-react';
import API, { getImageUrl } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['Grocery', 'Fruits & Vegetables', 'Dairy & Eggs', 'Bakery', 'Beverages', 'Snacks', 'Pharmacy', 'Electronics', 'Clothing', 'Home & Kitchen', 'Personal Care', 'Stationery', 'Toys', 'Other'];
const UNITS = ['piece', 'kg', 'g', 'liter', 'ml', 'pack', 'dozen', 'box', 'bottle'];

const ProductForm = ({ initialData = {}, onSubmit, loading, title }) => {
  const [form, setForm] = useState({
    name: initialData.name || '',
    description: initialData.description || '',
    price: initialData.price || '',
    discountPrice: initialData.discountPrice || '',
    stock: initialData.stock || 0,
    category: initialData.category || 'Grocery',
    unit: initialData.unit || 'piece',
    isAvailable: initialData.isAvailable !== false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData.image ? getImageUrl(initialData.image) : null);
  const fileRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Product name is required'); return; }
    if (!form.price || parseFloat(form.price) < 0) { toast.error('Valid price is required'); return; }
    onSubmit(form, imageFile);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
        {/* Main Form */}
        <div className="card">
          <div className="card-header">
            <h2 style={{ fontSize: '18px', fontWeight: '700' }}>{title}</h2>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label>Product Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Fresh Whole Milk 1L" className="input" required />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your product..." className="input" rows={3} style={{ resize: 'vertical' }} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input">
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Unit</label>
                <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="input">
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price (₹) *</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" min="0" step="0.01" className="input" required />
              </div>
              <div className="form-group">
                <label>Discount Price (₹) (Optional)</label>
                <input type="number" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} placeholder="Leave blank if no discount" min="0" step="0.01" className="input" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Stock Quantity *</label>
                <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} min="0" className="input" required />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#f9fafb', borderRadius: '8px', cursor: 'pointer', width: '100%' }}>
                  <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} style={{ width: '18px', height: '18px', accentColor: '#059669' }} />
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>Available for purchase</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card">
            <div className="card-header"><h3 style={{ fontSize: '16px', fontWeight: '700' }}>Product Image</h3></div>
            <div className="card-body">
              <div className="image-upload" onClick={() => fileRef.current.click()}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="image-preview" style={{ display: 'block', margin: '0 auto 12px' }} />
                ) : (
                  <div style={{ marginBottom: '12px' }}>
                    <Upload size={32} style={{ color: '#9ca3af', margin: '0 auto 8px' }} />
                  </div>
                )}
                <p style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>
                  {imagePreview ? 'Click to change image' : 'Click to upload product image'}
                </p>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>PNG, JPG up to 5MB</p>
              </div>
              <input type="file" ref={fileRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
            {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>
    </form>
  );
};

const AddProductPage = () => {
  const { shop } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleSubmit = async (form, imageFile) => {
    if (!shop) { toast.error('No shop found. Create your shop first.'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries({ ...form, shopId: shop._id }).forEach(([key, val]) => {
        if (val !== '' && val !== null && val !== undefined) formData.append(key, val);
      });
      if (imageFile) formData.append('image', imageFile);

      await API.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Product added successfully! 🎉');
      navigate('/products');
    } catch (error) {
      if (error.response?.data?.limitReached) {
        setShowUpgradeModal(true);
      } else {
        toast.error(error.response?.data?.message || 'Failed to add product');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#059669', textDecoration: 'none', fontWeight: '600', marginBottom: '20px', fontSize: '14px' }}>
        <ArrowLeft size={16} /> Back to Products
      </Link>
      <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>Add New Product</h1>
      <ProductForm onSubmit={handleSubmit} loading={loading} title="Product Details" />
      
      {showUpgradeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ padding: '30px', maxWidth: '400px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>Plan Limit Reached</h2>
            <p style={{ color: '#4b5563', marginBottom: '20px', fontSize: '15px' }}>
              You reached your current plan limit. Upgrade to Pro to add unlimited products to your shop.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowUpgradeModal(false)} style={{ flex: 1, padding: '10px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
                Cancel
              </button>
              <button onClick={() => navigate('/subscription')} style={{ flex: 1, padding: '10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { ProductForm };
export default AddProductPage;
