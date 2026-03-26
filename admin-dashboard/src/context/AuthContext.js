import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        const savedUser = localStorage.getItem('admin_user');
        if (token && savedUser) {
            const parsed = JSON.parse(savedUser);
            if (parsed.role === 'admin') {
                setUser(parsed);
                // Verify token is still valid
                api.get('/auth/me')
                    .then(res => {
                        if (res.data.user.role !== 'admin') {
                            logout();
                        } else {
                            setUser(res.data.user);
                            localStorage.setItem('admin_user', JSON.stringify(res.data.user));
                        }
                    })
                    .catch(() => logout());
            } else {
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { token, user: userData } = res.data;

        if (userData.role !== 'admin') {
            throw new Error('Access denied. Admin privileges required.');
        }

        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
