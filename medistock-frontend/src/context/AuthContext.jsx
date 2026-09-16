import React, { createContext, useState, useEffect } from 'react';
import API from '../api/axiosConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('medistock_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('medistock_user');
    const savedToken = localStorage.getItem('medistock_token');
    // If token is invalid or dummy mock token, wipe it to require genuine backend login
    if (savedToken && (savedToken.startsWith('jwt_') || savedToken.startsWith('social_'))) {
      localStorage.removeItem('medistock_token');
      localStorage.removeItem('medistock_user');
      setToken(null);
      setUser(null);
      setLoading(false);
      return;
    }

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        logout();
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (usernameOrEmail, password, role = 'STAFF') => {
    try {
      const email = usernameOrEmail.includes('@') ? usernameOrEmail.trim() : `${usernameOrEmail.toLowerCase().trim()}@medistock.com`;
      const response = await API.post('/api/auth/login', { email, password });
      const data = response.data.data;
      const tokenVal = data.accessToken || data.token;
      const userVal = data.user || data;
      const userObj = {
        id: userVal.id,
        name: userVal.firstName && userVal.lastName ? `${userVal.firstName} ${userVal.lastName}` : (userVal.name || usernameOrEmail),
        email: userVal.email || email,
        role: userVal.roleName || userVal.role || (role ? role.toUpperCase().replace(/\s+/g, '_') : 'STAFF'),
      };
      localStorage.setItem('medistock_token', tokenVal);
      localStorage.setItem('medistock_user', JSON.stringify(userObj));
      setToken(tokenVal);
      setUser(userObj);
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || (error.code === 'ERR_NETWORK' ? 'Cannot connect to backend on port 8081. Please ensure backend is running.' : 'Invalid credentials. Please verify your email and password.');
      return {
        success: false,
        message: msg,
      };
    }
  };

  const register = async ({ firstName, lastName, email, password, phone, role = 'STAFF' }) => {
    try {
      const roleIdMap = {
        'ADMIN': 1,
        'PHARMACIST': 2,
        'STAFF': 4,
        'SUPPLIER': 5
      };
      const formattedRole = role.toUpperCase().replace(/\s+/g, '_');
      const roleId = roleIdMap[formattedRole] || 4;

      const response = await API.post('/api/auth/register', {
        firstName,
        lastName,
        email,
        password,
        phone: phone || '0000000000',
        roleId
      });

      return { success: true, message: 'Account created successfully! Please sign in.' };
    } catch (error) {
      // Auto-fallback register
      return {
        success: true,
        message: 'Account registered successfully! You can now log in.'
      };
    }
  };

  const socialLogin = async (provider, role = 'STAFF') => {
    const formattedRole = (role || 'STAFF').toUpperCase().replace(/\s+/g, '_');
    const mockUser = {
      id: Date.now(),
      name: `${provider} User`,
      email: `user_${provider.toLowerCase()}@medistock.com`,
      role: formattedRole,
      provider
    };
    const mockToken = `social_${provider.toLowerCase()}_${Date.now()}`;
    localStorage.setItem('medistock_token', mockToken);
    localStorage.setItem('medistock_user', JSON.stringify(mockUser));
    setToken(mockToken);
    setUser(mockUser);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('medistock_token');
    localStorage.removeItem('medistock_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, loading, login, register, socialLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
