/**
 * Navbar Component
 * Top navigation bar with cart count and user menu
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, MapPin, Search, Menu, X, Package, LogOut, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout, cartCount } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <span style={styles.logoIcon}>🛒</span>
          <span style={styles.logoText}>LocalMart</span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <div style={styles.searchWrapper}>
            <Search size={16} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </form>

        {/* Desktop Nav Links */}
        <div style={styles.navLinks}>
          <Link to="/" style={styles.navLink}>
            <Home size={18} />
            <span>Home</span>
          </Link>

          {user ? (
            <>
              <Link to="/wishlist" style={styles.navLink}>
                <Heart size={18} />
                <span>Wishlist</span>
              </Link>

              <Link to="/orders" style={styles.navLink}>
                <Package size={18} />
                <span>Orders</span>
              </Link>

              <Link to="/cart" style={styles.cartLink}>
                <ShoppingCart size={18} />
                {cartCount > 0 && <span style={styles.cartBadge}>{cartCount}</span>}
              </Link>

              <Link to="/profile" style={styles.navLink}>
                <div style={styles.avatar}>{user.name.charAt(0).toUpperCase()}</div>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.navLink}>Login</Link>
              <Link to="/register" style={styles.registerBtn}>Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          style={styles.menuToggle}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          <form onSubmit={handleSearch} style={{ padding: '12px 16px' }}>
            <div style={styles.searchWrapper}>
              <Search size={16} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </form>
          
          <Link to="/" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            <Home size={18} /> Home
          </Link>

          {user ? (
            <>
              <Link to="/cart" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                <ShoppingCart size={18} /> Cart {cartCount > 0 && `(${cartCount})`}
              </Link>
              <Link to="/wishlist" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                <Heart size={18} /> Wishlist
              </Link>
              <Link to="/orders" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                <Package size={18} /> Orders
              </Link>
              <Link to="/profile" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                <User size={18} /> Profile
              </Link>
              <button style={styles.mobileLogout} onClick={handleLogout}>
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

const styles = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: '#fff',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px',
    height: '65px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    flexShrink: 0
  },
  logoIcon: { fontSize: '24px' },
  logoText: {
    fontSize: '20px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  searchForm: { flex: 1, maxWidth: '420px' },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    color: '#9ca3af',
    pointerEvents: 'none'
  },
  searchInput: {
    width: '100%',
    padding: '9px 12px 9px 36px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '14px',
    fontFamily: 'inherit',
    background: '#f9fafb',
    transition: 'all 0.2s',
    outline: 'none'
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginLeft: 'auto',
    '@media (max-width: 768px)': { display: 'none' }
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '8px 12px',
    color: '#4b5563',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  cartLink: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    color: '#6366f1',
    textDecoration: 'none',
    borderRadius: '8px',
    background: '#ede9fe'
  },
  cartBadge: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    background: '#ef4444',
    color: '#fff',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    fontSize: '11px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '15px'
  },
  registerBtn: {
    padding: '8px 18px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600'
  },
  menuToggle: {
    display: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    color: '#4b5563',
    marginLeft: 'auto',
    '@media (max-width: 768px)': { display: 'flex' }
  },
  mobileMenu: {
    background: '#fff',
    borderTop: '1px solid #e5e7eb',
    padding: '8px 0',
    display: 'flex',
    flexDirection: 'column'
  },
  mobileLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 20px',
    color: '#374151',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '500',
    borderBottom: '1px solid #f3f4f6'
  },
  mobileLogout: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 20px',
    color: '#ef4444',
    fontSize: '15px',
    fontWeight: '500',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left'
  }
};

export default Navbar;
