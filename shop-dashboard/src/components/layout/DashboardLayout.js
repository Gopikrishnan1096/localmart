/**
 * DashboardLayout - Sidebar navigation layout
 */

import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, BarChart2, Settings, LogOut, Store, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/orders', label: 'Orders', icon: ShoppingBag },
  { path: '/earnings', label: 'Earnings', icon: BarChart2 },
  { path: '/subscription', label: 'Subscription', icon: ShoppingBag }, // Using existing icon for now, could be CreditCard
  { path: '/settings', label: 'Shop Settings', icon: Settings },
];

const DashboardLayout = () => {
  const { user, shop, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <Store size={24} />
          <span>LocalMart</span>
        </div>

        {/* Shop Info */}
        {shop && (
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '4px' }}>Your Shop</p>
            <p style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>{shop.shopName}</p>
            <p style={{ fontSize: '12px', color: shop.isActive ? '#10b981' : '#ef4444' }}>
              {shop.isActive ? '● Active' : '● Inactive'}
            </p>
          </div>
        )}

        {/* Nav */}
        <nav className="sidebar-nav">
          <p className="sidebar-section-label">Menu</p>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '10px' }}>
            <p style={{ fontSize: '13px', color: '#9ca3af' }}>Logged in as</p>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>{user?.name}</p>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} />
      )}

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px', borderRadius: '8px', color: '#374151' }}>
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div style={{ flex: 1, padding: '0 16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>
              {shop ? shop.shopName : 'Shop Dashboard'}
            </h2>
          </div>

          <a href="http://localhost:3000" target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#059669', fontWeight: '600', textDecoration: 'none', padding: '7px 14px', background: '#d1fae5', borderRadius: '8px' }}>
            View Store →
          </a>
        </header>

        {/* Page Content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
