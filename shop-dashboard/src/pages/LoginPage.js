/**
 * LoginPage - Shop Dashboard Authentication
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    if (success) navigate('/');
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4, #d1fae5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 40px rgba(5, 150, 105, 0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '60px', height: '60px', background: '#059669', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Store size={30} color="#fff" />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#111827' }}>Shop Dashboard</h1>
          <p style={{ color: '#6b7280', marginTop: '6px' }}>Sign in to manage your shop</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@shop.com" required className="input" style={{ paddingLeft: '40px' }} />
            </div>
          </div>
          <div>
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="input" style={{ paddingLeft: '40px', paddingRight: '40px' }} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ padding: '14px', background: '#059669', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '700', cursor: loading ? 'wait' : 'pointer', marginTop: '8px' }}>
            {loading ? 'Signing in...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6b7280' }}>
          New shop owner? <Link to="/register" style={{ color: '#059669', fontWeight: '700', textDecoration: 'none' }}>Create Account</Link>
        </p>

        <div style={{ marginTop: '16px', padding: '12px', background: '#ede9fe', borderRadius: '10px', textAlign: 'center', fontSize: '13px', color: '#5b21b6' }}>
          Customer? <a href="http://localhost:3000" style={{ color: '#5b21b6', fontWeight: '700' }}>Go to Shopping App →</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
