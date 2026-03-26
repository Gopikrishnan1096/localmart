/**
 * AuthContext - Global authentication state management
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      fetchCartCount();
    }
    setLoading(false);
  }, []);

  const fetchCartCount = async () => {
    try {
      const res = await API.get('/users/cart');
      setCartCount(res.data.data?.itemCount || 0);
    } catch { /* silent fail */ }
  };

  const login = async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      const { token, user: userData } = res.data;

      // Only allow regular users (not shop owners) on user frontend
      if (userData.role === 'shopowner') {
        toast.error('Please use the Shop Dashboard to login as a shop owner.');
        return false;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      fetchCartCount();
      toast.success(`Welcome back, ${userData.name}! 🎉`);
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
      return false;
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const res = await API.post('/auth/register', { name, email, password, phone, role: 'user' });
      const { token, user: userData } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      toast.success(`Welcome to LocalMart, ${userData.name}! 🎉`);
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed.';
      toast.error(message);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCartCount(0);
    toast.success('Logged out successfully.');
  };

  const updateLocation = async (latitude, longitude, address) => {
    try {
      await API.patch('/users/location', { latitude, longitude, address });
      const updatedUser = { ...user, location: { latitude, longitude, address } };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Location update failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user, loading, cartCount, setCartCount,
      login, register, logout, updateLocation, fetchCartCount
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
