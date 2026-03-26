import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, Users, Store, Package, ShoppingCart,
    LogOut, Shield
} from 'lucide-react';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { to: '/users', icon: Users, label: 'Users' },
        { to: '/shops', icon: Store, label: 'Shops' },
        { to: '/products', icon: Package, label: 'Products' },
        { to: '/orders', icon: ShoppingCart, label: 'Orders' },
        { to: '/subscriptions', icon: Store, label: 'Subscriptions' }, // Reuse icon for now if needed, or replace with CreditCard if added
    ];

    return (
        <div className="admin-layout">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <Shield size={24} color="#818cf8" />
                    <span>LocalMart</span> Admin
                </div>

                <nav className="sidebar-nav">
                    <div className="sidebar-section-label">Management</div>
                    {navItems.map(({ to, icon: Icon, label, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={18} />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div style={{ marginBottom: 12, fontWeight: 600, color: '#e0e7ff' }}>
                        {user?.name}
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            background: 'rgba(255,255,255,0.08)',
                            border: 'none',
                            color: '#c7d2fe',
                            padding: '8px 14px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontSize: 13,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            width: '100%',
                            fontFamily: 'inherit'
                        }}
                    >
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>
            </aside>

            <div className="main-content">
                <header className="admin-header">
                    <div className="header-title">Admin Panel</div>
                    <div className="header-user">
                        <div className="user-avatar">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        {user?.name}
                    </div>
                </header>

                <main className="page-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
