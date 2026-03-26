/**
 * HomePage - Main landing page showing nearby shops
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Store, Star, ChevronRight, AlertCircle, Loader } from 'lucide-react';
import API, { getImageUrl } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Grocery', 'Fruits & Vegetables', 'Dairy & Eggs', 'Pharmacy', 'Electronics', 'Clothing', 'Bakery', 'Beverages'];

const HomePage = () => {
  const { user, updateLocation } = useAuth();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [radius, setRadius] = useState(10);
  const [locationError, setLocationError] = useState(null);
  const [locationSearch, setLocationSearch] = useState('');

  // Auto-detect location on page load
  useEffect(() => {
    if (user?.location?.latitude) {
      setUserLocation(user.location);
      fetchNearbyShops(user.location.latitude, user.location.longitude, selectedCategory, radius);
    } else {
      detectLocation();
    }
  }, []);

  // Refetch shops when category, radius, or locationSearch changes
  useEffect(() => {
    if (userLocation || locationSearch) {
      fetchNearbyShops(userLocation?.latitude, userLocation?.longitude, selectedCategory, radius, locationSearch);
    }
  }, [selectedCategory, radius, locationSearch]);

  const detectLocation = () => {
    setLocationLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const location = { latitude, longitude, address: 'Current Location' };
        
        setUserLocation(location);
        if (user) await updateLocation(latitude, longitude, 'Current Location');
        fetchNearbyShops(latitude, longitude, selectedCategory, radius, locationSearch);
        setLocationLoading(false);
        toast.success('Location detected! 📍');
      },
      (error) => {
        setLocationError('Could not detect your location. Using default location for demo.');
        setLocationLoading(false);
        // Demo fallback - Kochi coordinates
        const demoLocation = { latitude: 10.0246, longitude: 76.3075, address: 'Kochi, Kerala (Demo)' };
        setUserLocation(demoLocation);
        fetchNearbyShops(demoLocation.latitude, demoLocation.longitude, selectedCategory, radius, locationSearch);
      },
      { timeout: 8000 }
    );
  };

  const fetchNearbyShops = async (lat, lng, category, rad, locSearch) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (lat && lng) {
        params.append('lat', lat);
        params.append('lng', lng);
      }
      params.append('radius', rad);
      if (category && category !== 'All') params.append('category', category);
      if (locSearch) params.append('locationSearch', locSearch);

      const res = await API.get(`/shops/nearby?${params}`);
      setShops(res.data.data || []);
    } catch (error) {
      console.error('Error fetching shops:', error);
      toast.error('Failed to load shops. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDistance = (km) => {
    if (km < 1) return `${Math.round(km * 1000)}m`;
    return `${km.toFixed(1)}km`;
  };

  return (
    <div>
      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            Shop Local, <span style={styles.heroHighlight}>Delivered Fast</span> 🚀
          </h1>
          <p style={styles.heroSubtitle}>
            Discover products from shops in your neighborhood
          </p>

          {/* Location Banner */}
          <div style={styles.locationBanner}>
            <MapPin size={18} style={{ color: '#6366f1', flexShrink: 0 }} />
            {locationLoading ? (
              <span style={{ color: '#6b7280' }}>Detecting your location...</span>
            ) : userLocation ? (
              <span style={{ color: '#374151', fontWeight: '500' }}>
                {userLocation.address || `${userLocation.latitude?.toFixed(4)}, ${userLocation.longitude?.toFixed(4)}`}
              </span>
            ) : (
              <span style={{ color: '#9ca3af' }}>Location not set</span>
            )}
            <button onClick={detectLocation} style={styles.changeLocationBtn}>
              {locationLoading ? <Loader size={14} className="spinning" /> : 'Change'}
            </button>
          </div>

          {locationError && (
            <div style={styles.errorBanner}>
              <AlertCircle size={16} />
              {locationError}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container" style={{ paddingTop: '24px', paddingBottom: '40px' }}>

        {/* Filter Controls */}
        <div style={styles.filterRow}>
          {/* Location Search Input */}
          <div style={{ position: 'relative', flexShrink: 0, width: '220px' }}>
            <MapPin size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input 
              type="text"
              placeholder="Search by area (e.g. Kakkanad)"
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              style={{ ...styles.radiusSelect, width: '100%', paddingLeft: '32px' }}
            />
          </div>

          {/* Categories */}
          <div style={styles.categoriesScroll}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  ...styles.categoryChip,
                  ...(selectedCategory === cat ? styles.categoryChipActive : {})
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Radius selector */}
          <select
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            style={styles.radiusSelect}
          >
            <option value={2}>Within 2km</option>
            <option value={5}>Within 5km</option>
            <option value={10}>Within 10km</option>
            <option value={20}>Within 20km</option>
          </select>
        </div>

        {/* Section Header */}
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            <Store size={22} style={{ color: '#6366f1' }} />
            Shops Near You
            {shops.length > 0 && (
              <span style={styles.countBadge}>{shops.length}</span>
            )}
          </h2>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={styles.loadingContainer}>
            <div className="spinner" />
            <p style={{ color: '#6b7280', marginTop: '12px' }}>Finding shops near you...</p>
          </div>
        )}

        {/* No Location */}
        {!loading && !userLocation && (
          <div className="empty-state">
            <MapPin size={48} />
            <h3>Enable Location Access</h3>
            <p>We need your location to show nearby shops</p>
            <button className="btn btn-primary" onClick={detectLocation} style={{ marginTop: '16px' }}>
              <MapPin size={16} /> Enable Location
            </button>
          </div>
        )}

        {/* Shops Grid */}
        {!loading && shops.length > 0 && (
          <div className="grid-3" style={{ marginTop: '16px' }}>
            {shops.map(shop => (
              <ShopCard key={shop._id} shop={shop} formatDistance={formatDistance} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && userLocation && shops.length === 0 && (
          <div className="empty-state" style={{ marginTop: '40px' }}>
            <Store size={48} />
            <h3>No shops found nearby</h3>
            <p>Try increasing the search radius or changing the category filter</p>
            <button
              className="btn btn-outline"
              onClick={() => { setRadius(20); setSelectedCategory('All'); }}
              style={{ marginTop: '16px' }}
            >
              Expand Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Shop Card Sub-component
const ShopCard = ({ shop, formatDistance }) => {
  const isOpen = (() => {
    const now = new Date();
    const current = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
    return current >= shop.openTime && current <= shop.closeTime;
  })();

  return (
    <Link to={`/shop/${shop._id}`} style={styles.shopCard} className="fade-in">
      {/* Shop Image / Logo */}
      <div style={styles.shopImageWrapper}>
        {shop.logo ? (
          <img
            src={getImageUrl(shop.logo)}
            alt={shop.shopName}
            style={styles.shopImage}
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div style={{ ...styles.shopImagePlaceholder, display: shop.logo ? 'none' : 'flex' }}>
          <Store size={36} style={{ color: '#6366f1' }} />
        </div>

        {/* Open/Closed Badge */}
        <span style={{ ...styles.statusBadge, background: isOpen ? '#d1fae5' : '#fee2e2', color: isOpen ? '#065f46' : '#991b1b' }}>
          {isOpen ? '🟢 Open' : '🔴 Closed'}
        </span>

        {/* Distance Badge */}
        {shop.distance !== undefined && (
          <span style={styles.distanceBadge}>
            <MapPin size={10} /> {formatDistance(shop.distance)}
          </span>
        )}
      </div>

      {/* Shop Info */}
      <div style={styles.shopInfo}>
        <h3 style={styles.shopName}>{shop.shopName}</h3>
        <p style={styles.shopAddress}>
          <MapPin size={13} style={{ color: '#9ca3af', flexShrink: 0 }} />
          {shop.address}
        </p>
        <div style={styles.shopMeta}>
          <span style={styles.shopHours}>
            <Clock size={13} style={{ color: '#6366f1' }} />
            {shop.openTime} - {shop.closeTime}
          </span>
          {shop.categories?.length > 0 && (
            <span style={styles.shopCategory}>{shop.categories[0]}</span>
          )}
        </div>
        <div style={styles.shopFooter}>
          <span style={styles.viewShopBtn}>
            View Products <ChevronRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
};

const styles = {
  hero: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)',
    padding: '40px 16px'
  },
  heroContent: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  heroTitle: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#fff',
    marginBottom: '8px',
    lineHeight: '1.2'
  },
  heroHighlight: {
    color: '#fcd34d'
  },
  heroSubtitle: {
    fontSize: '16px',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: '20px'
  },
  locationBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#fff',
    padding: '12px 16px',
    borderRadius: '12px',
    maxWidth: '500px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  },
  changeLocationBtn: {
    marginLeft: 'auto',
    background: 'none',
    border: '1px solid #6366f1',
    color: '#6366f1',
    padding: '4px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '12px',
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.15)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '13px'
  },
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '20px'
  },
  categoriesScroll: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'nowrap',
    overflowX: 'auto',
    flex: 1,
    paddingBottom: '4px'
  },
  categoryChip: {
    flexShrink: 0,
    padding: '7px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '20px',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    color: '#6b7280',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap'
  },
  categoryChipActive: {
    background: '#6366f1',
    borderColor: '#6366f1',
    color: '#fff'
  },
  radiusSelect: {
    padding: '8px 12px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '13px',
    fontFamily: 'inherit',
    background: '#fff',
    cursor: 'pointer',
    flexShrink: 0
  },
  sectionHeader: {
    marginBottom: '16px'
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '22px',
    fontWeight: '700',
    color: '#111827'
  },
  countBadge: {
    background: '#e0e7ff',
    color: '#6366f1',
    padding: '2px 10px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px 0'
  },
  // Shop Card styles
  shopCard: {
    textDecoration: 'none',
    background: '#fff',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
    transition: 'all 0.25s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'block',
    cursor: 'pointer'
  },
  shopImageWrapper: {
    position: 'relative',
    height: '160px',
    background: '#f3f4f6',
    overflow: 'hidden'
  },
  shopImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  shopImagePlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f0f0ff, #e0e7ff)'
  },
  statusBadge: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },
  distanceBadge: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'rgba(0,0,0,0.7)',
    color: '#fff',
    padding: '3px 8px',
    borderRadius: '20px',
    fontSize: '11px',
    display: 'flex',
    alignItems: 'center',
    gap: '3px'
  },
  shopInfo: {
    padding: '14px'
  },
  shopName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '6px'
  },
  shopAddress: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '4px',
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '10px',
    lineHeight: '1.4'
  },
  shopMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '10px',
    flexWrap: 'wrap'
  },
  shopHours: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#4b5563'
  },
  shopCategory: {
    fontSize: '12px',
    background: '#ede9fe',
    color: '#5b21b6',
    padding: '2px 8px',
    borderRadius: '20px',
    fontWeight: '500'
  },
  shopFooter: {
    borderTop: '1px solid #f3f4f6',
    paddingTop: '10px'
  },
  viewShopBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#6366f1',
    fontSize: '13px',
    fontWeight: '600'
  }
};

export default HomePage;
