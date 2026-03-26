/**
 * AuthContext for Shop Dashboard
 * Only shop owners can login here
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('shopUser');
    const token = localStorage.getItem('shopToken');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      fetchMyShop();
    }
    setLoading(false);
  }, []);

  const fetchMyShop = async () => {
    try {
      const res = await API.get('/shops/my-shop');
      setShop(res.data.data);
    } catch {
      // No shop created yet
      setShop(null);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      const { token, user: userData } = res.data;

      if (userData.role !== 'shopowner' && userData.role !== 'admin') {
        toast.error('Access denied. Only shop owners can login here.');
        return false;
      }

      localStorage.setItem('shopToken', token);
      localStorage.setItem('shopUser', JSON.stringify(userData));
      // Also set generic token for API calls
      localStorage.setItem('token', token);
      setUser(userData);
      fetchMyShop();
      toast.success(`Welcome back, ${userData.name}! 🏪`);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed.');
      return false;
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const res = await API.post('/auth/register', { name, email, password, phone, role: 'shopowner' });
      const { token, user: userData } = res.data;

      localStorage.setItem('shopToken', token);
      localStorage.setItem('shopUser', JSON.stringify(userData));
      localStorage.setItem('token', token);
      setUser(userData);
      toast.success(`Welcome to LocalMart, ${userData.name}! Now create your shop.`);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed.');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('shopToken');
    localStorage.removeItem('shopUser');
    localStorage.removeItem('token');
    setUser(null);
    setShop(null);
    toast.success('Logged out successfully.');
  };

  return (
    <AuthContext.Provider value={{ user, shop, setShop, loading, login, register, logout, fetchMyShop }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
