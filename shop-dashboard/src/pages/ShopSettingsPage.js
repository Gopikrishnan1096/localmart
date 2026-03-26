/**
 * ShopSettingsPage - Create or update shop profile
 */

import React, { useState, useRef, useEffect } from 'react';
import { Store, MapPin, Upload, Clock, Phone, FileText } from 'lucide-react';
import API, { getImageUrl } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ShopSettingsPage = () => {
  const { shop, setShop, fetchMyShop } = useAuth();
  const [form, setForm] = useState({
    shopName: '',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    openTime: '09:00',
    closeTime: '21:00',
    phone: '',
    categories: [],
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const logoRef = useRef();

  const CATEGORY_OPTIONS = ['Grocery', 'Fruits & Vegetables', 'Dairy & Eggs', 'Bakery', 'Beverages', 'Snacks', 'Pharmacy', 'Electronics', 'Clothing', 'Home & Kitchen', 'Personal Care'];

  useEffect(() => {
    if (shop) {
      setForm({
        shopName: shop.shopName || '',
        description: shop.description || '',
        address: shop.address || '',
        latitude: shop.latitude || '',
        longitude: shop.longitude || '',
        openTime: shop.openTime || '09:00',
        closeTime: shop.closeTime || '21:00',
        phone: shop.phone || '',
        categories: shop.categories || [],
      });
      if (shop.logo) setLogoPreview(getImageUrl(shop.logo));
    }
  }, [shop]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const detectLocation = () => {
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(f => ({
          ...f,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
          address: f.address || 'Auto-detected location'
        }));
        toast.success('Location detected!');
        setDetectingLocation(false);
      },
      () => { toast.error('Could not detect location. Please enter manually.'); setDetectingLocation(false); }
    );
  };

  const toggleCategory = (cat) => {
    const cats = form.categories;
    if (cats.includes(cat)) {
      setForm({ ...form, categories: cats.filter(c => c !== cat) });
    } else {
      setForm({ ...form, categories: [...cats, cat] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.latitude || !form.longitude) {
      toast.error('Please set shop location (use "Detect Location" or enter coordinates)');
      return;
    }
    setSaving(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (key === 'categories') {
          val.forEach(cat => formData.append('categories[]', cat));
        } else if (val !== '' && val !== null) {
          formData.append(key, val);
        }
      });
      if (logoFile) formData.append('logo', logoFile);

      let res;
      if (shop) {
        res = await API.put(`/shops/${shop._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        res = await API.post('/shops', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      setShop(res.data.data);
      toast.success(shop ? 'Shop updated successfully!' : 'Shop created! Welcome to LocalMart! 🎉');
      fetchMyShop();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save shop settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800' }}>{shop ? 'Shop Settings' : 'Create Your Shop'}</h1>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          {shop ? 'Update your shop profile and settings' : 'Fill in the details to launch your shop on LocalMart'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
          {/* Main Settings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Basic Info */}
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Store size={18} style={{ color: '#059669' }} /> Basic Information
                </h3>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label>Shop Name *</label>
                  <input value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} placeholder="e.g. Fresh Mart" className="input" required />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Tell customers what your shop offers..." className="input" rows={3} style={{ resize: 'vertical' }} />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 9876543210" className="input" />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={18} style={{ color: '#059669' }} /> Location
                </h3>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label>Full Address *</label>
                  <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, City, State, PIN" className="input" required />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Latitude *</label>
                    <input type="number" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="e.g. 19.0760" step="0.000001" className="input" />
                  </div>
                  <div className="form-group">
                    <label>Longitude *</label>
                    <input type="number" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="e.g. 72.8777" step="0.000001" className="input" />
                  </div>
                </div>

                <button type="button" onClick={detectLocation} disabled={detectingLocation} className="btn btn-secondary" style={{ width: '100%' }}>
                  <MapPin size={16} /> {detectingLocation ? 'Detecting...' : 'Auto-Detect My Location'}
                </button>
              </div>
            </div>

            {/* Hours & Categories */}
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} style={{ color: '#059669' }} /> Business Hours & Categories
                </h3>
              </div>
              <div className="card-body">
                <div className="form-row" style={{ marginBottom: '20px' }}>
                  <div className="form-group">
                    <label>Opening Time *</label>
                    <input type="time" value={form.openTime} onChange={(e) => setForm({ ...form, openTime: e.target.value })} className="input" />
                  </div>
                  <div className="form-group">
                    <label>Closing Time *</label>
                    <input type="time" value={form.closeTime} onChange={(e) => setForm({ ...form, closeTime: e.target.value })} className="input" />
                  </div>
                </div>

                <label style={{ marginBottom: '10px', display: 'block' }}>Shop Categories</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {CATEGORY_OPTIONS.map(cat => (
                    <button key={cat} type="button" onClick={() => toggleCategory(cat)} style={{ padding: '6px 14px', border: `2px solid ${form.categories.includes(cat) ? '#059669' : '#e5e7eb'}`, borderRadius: '20px', background: form.categories.includes(cat) ? '#059669' : '#fff', color: form.categories.includes(cat) ? '#fff' : '#6b7280', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Logo Upload + Submit */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '80px' }}>
            <div className="card">
              <div className="card-header"><h3 style={{ fontSize: '16px', fontWeight: '700' }}>Shop Logo</h3></div>
              <div className="card-body">
                <div className="image-upload" onClick={() => logoRef.current.click()}>
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo Preview" style={{ width: '100px', height: '100px', borderRadius: '12px', objectFit: 'cover', display: 'block', margin: '0 auto 12px' }} />
                  ) : (
                    <div style={{ marginBottom: '12px' }}>
                      <Upload size={32} style={{ color: '#9ca3af', margin: '0 auto 8px' }} />
                    </div>
                  )}
                  <p style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>{logoPreview ? 'Click to change' : 'Upload Shop Logo'}</p>
                  <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>PNG, JPG up to 5MB</p>
                </div>
                <input type="file" ref={logoRef} onChange={handleLogoChange} accept="image/*" style={{ display: 'none' }} />
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
              {saving ? 'Saving...' : shop ? '💾 Update Shop' : '🏪 Create My Shop'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ShopSettingsPage;
