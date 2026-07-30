import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api/authService';
import { profileService } from '../services/api/profileService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Initialize auth state by fetching current user profile if token exists
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const profile = await profileService.getProfile();
          // Normalize roles format if needed
          const rolesArray = profile.roles
            ? Array.isArray(profile.roles)
              ? profile.roles
              : Array.from(profile.roles)
            : [];
          
          const updatedUser = {
            ...profile,
            roles: rolesArray,
          };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (err) {
          console.error('Failed to verify session token:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const loginWithToken = async (jwtToken) => {
    localStorage.setItem('token', jwtToken);
    setToken(jwtToken);
    try {
      const profile = await profileService.getProfile();
      const rolesArray = profile.roles
        ? Array.isArray(profile.roles)
          ? profile.roles
          : Array.from(profile.roles)
        : [];
      const updatedUser = { ...profile, roles: rolesArray };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (err) {
      console.error('Failed to initialize session with OAuth token:', err);
      logout();
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      const { token: jwtToken, ...userData } = response;

      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(jwtToken);
      setUser(userData);
      return response;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateUserProfileState = (updatedFields) => {
    setUser((prev) => {
      if (!prev) return prev;
      const nextUser = { ...prev, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  const hasRole = (...roles) => {
    if (!user || !user.roles) return false;
    const userRoles = Array.isArray(user.roles) ? user.roles : Array.from(user.roles);
    return roles.some((role) =>
      userRoles.some((r) => r.replace('ROLE_', '').toUpperCase() === role.toUpperCase())
    );
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        loginWithToken,
        logout,
        updateUserProfileState,
        hasRole,
        isAuthenticated: !!token && !!user,
        isAdmin: hasRole('ADMIN'),
        isPharmacist: hasRole('PHARMACIST'),
        isStaff: hasRole('STAFF'),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
