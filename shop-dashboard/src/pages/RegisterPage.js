/**
 * RegisterPage - Shop owner registration
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { alert('Password must be at least 6 characters'); return; }
    setLoading(true);
    const success = await register(form.name, form.email, form.password, form.phone);
    if (success) navigate('/settings'); // Redirect to create shop
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4, #d1fae5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 40px rgba(5, 150, 105, 0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '60px', height: '60px', background: '#059669', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Store size={30} color="#fff" />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#111827' }}>Create Shop Account</h1>
          <p style={{ color: '#6b7280', marginTop: '6px' }}>Register as a shop owner on LocalMart</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[
            { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Your Name', required: true },
            { key: 'email', label: 'Email Address', type: 'email', placeholder: 'owner@shop.com', required: true },
            { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+91 9876543210', required: false },
            { key: 'password', label: 'Password', type: 'password', placeholder: 'At least 6 characters', required: true },
          ].map(field => (
            <div key={field.key}>
              <label>{field.label} {field.required && '*'}</label>
              <input type={field.type} value={form[field.key]} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} placeholder={field.placeholder} required={field.required} className="input" />
            </div>
          ))}

          <button type="submit" disabled={loading} style={{ padding: '14px', background: '#059669', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '700', cursor: loading ? 'wait' : 'pointer', marginTop: '8px' }}>
            {loading ? 'Creating account...' : 'Create Shop Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6b7280' }}>
          Already have an account? <Link to="/login" style={{ color: '#059669', fontWeight: '700', textDecoration: 'none' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
