import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { storage } from '../utils/storage';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from persistent storage on mount
  useEffect(() => {
    const storedToken = storage.getToken();
    const storedUser = storage.getUser();

    if (storedToken && storedUser && !storage.isTokenExpired(storedToken)) {
      setToken(storedToken);
      setUser(storedUser);
    } else {
      storage.clearAuth();
    }
    setLoading(false);
  }, []);

  const login = async (username, password, rememberMe = true) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.login(username, password);

      if (response && response.success && response.data) {
        const authData = response.data;
        const jwtToken = authData.token;

        const rolesArray = Array.isArray(authData.roles)
          ? authData.roles
          : Array.from(authData.roles || []);

        const userData = {
          id: authData.id,
          username: authData.username,
          email: authData.email,
          roles: rolesArray,
        };

        storage.setToken(jwtToken, rememberMe);
        storage.setUser(userData, rememberMe);

        setToken(jwtToken);
        setUser(userData);
        setLoading(false);
        return { success: true, user: userData, roles: rolesArray };
      } else {
        const errMsg = response?.message || 'Login failed. Please verify credentials.';
        setError(errMsg);
        setLoading(false);
        return { success: false, message: errMsg };
      }
    } catch (err) {
      console.error('Login error details:', err);
      let errMsg = 'Network or server error occurred. Please try again.';
      if (err.response?.data) {
        errMsg = err.response.data.message || err.response.data.errors?.join(', ') || errMsg;
      }
      setError(errMsg);
      setLoading(false);
      return { success: false, message: errMsg };
    }
  };

  const logout = useCallback(() => {
    storage.clearAuth();
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const hasRole = useCallback((roleName) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(roleName);
  }, [user]);

  const hasAnyRole = useCallback((requiredRoles) => {
    if (!user || !user.roles) return false;
    return requiredRoles.some(r => user.roles.includes(r));
  }, [user]);

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    roles: user?.roles || [],
    loading,
    error,
    login,
    logout,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
