import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user credentials exist in local storage on mount
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        // Corrupted user data in local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    setError(null);
    try {
      const response = await api.post('/auth/login', { username, password });
      
      // Response shape: ApiResponse<JwtResponse>
      const apiResponse = response.data;
      if (apiResponse.success) {
        const { token, id, email, roles } = apiResponse.data;
        const loggedUser = { id, username: apiResponse.data.username, email, roles };
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        setUser(loggedUser);
        return loggedUser;
      } else {
        throw new Error(apiResponse.message || 'Login failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Authentication error';
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const hasRole = (roleName) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(roleName);
  };

  const hasAnyRole = (roleNames) => {
    if (!user || !user.roles) return false;
    return roleNames.some(role => user.roles.includes(role));
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    hasRole,
    hasAnyRole,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
