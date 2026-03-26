/**
 * ProfilePage - User profile and settings
 */

import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateLocation } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put('/users/profile', form);
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...savedUser, ...form }));
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const detectLocation = () => {
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await updateLocation(pos.coords.latitude, pos.coords.longitude, 'Current Location');
        toast.success('Location updated!');
        setDetectingLocation(false);
      },
      () => { toast.error('Could not detect location'); setDetectingLocation(false); }
    );
  };

  return (
    <div className="container page-wrapper">
      <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <User size={26} style={{ color: '#6366f1' }} /> My Profile
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Profile Form */}
        <div className="card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Personal Information</h2>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', marginBottom: '6px', color: '#374151' }}>Full Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="Your name" />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', marginBottom: '6px', color: '#374151' }}>Email (Cannot change)</label>
              <input value={user?.email || ''} disabled className="input" style={{ background: '#f9fafb', color: '#9ca3af' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', marginBottom: '6px', color: '#374151' }}>Phone Number</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" placeholder="+91 9876543210" />
            </div>
            <button type="submit" disabled={saving} style={{ padding: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Location Card */}
        <div className="card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>My Location</h2>
          <div style={{ background: '#f0f0ff', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <MapPin size={18} style={{ color: '#6366f1' }} />
              <span style={{ fontWeight: '600', color: '#374151' }}>Current Location</span>
            </div>
            {user?.location?.latitude ? (
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                {user.location.address || `${user.location.latitude.toFixed(6)}, ${user.location.longitude.toFixed(6)}`}
              </p>
            ) : (
              <p style={{ fontSize: '14px', color: '#9ca3af' }}>Location not set</p>
            )}
          </div>
          <button onClick={detectLocation} disabled={detectingLocation} style={{ width: '100%', padding: '12px', background: '#fff', border: '2px solid #6366f1', color: '#6366f1', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <MapPin size={16} /> {detectingLocation ? 'Detecting...' : 'Update Location'}
          </button>

          {/* Account Info */}
          <div style={{ marginTop: '24px', padding: '16px', background: '#f9fafb', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>Account Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={14} style={{ color: '#6366f1' }} /> {user?.email}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={14} style={{ color: '#6366f1' }} /> Role: {user?.role}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
