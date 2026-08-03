import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api/authService';
import { profileService } from '../services/api/profileService';

export const AuthContext = createContext(null);

export const clearAuthStorage = () => {
  const keys = ['token', 'user', 'auth', 'roles', 'jwt', 'refreshToken'];
  keys.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

export const isJwtValid = (token) => {
  if (!token || typeof token !== 'string' || token.trim() === '' || token === 'null' || token === 'undefined') {
    return false;
  }
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }
  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    if (payload && payload.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp <= currentTime) {
        return false;
      }
    }
    return true;
  } catch (e) {
    return false;
  }
};

export const getRoleDashboardPath = (user) => {
  if (!user || !user.roles) return '/login';
  const rolesArray = Array.isArray(user.roles) ? user.roles : Array.from(user.roles);
  const cleanRoles = rolesArray.map((r) => String(r).replace('ROLE_', '').toUpperCase());
  if (cleanRoles.includes('ADMIN')) return '/admin/dashboard';
  if (cleanRoles.includes('PHARMACIST')) return '/pharmacist/dashboard';
  if (cleanRoles.includes('STAFF')) return '/staff/dashboard';
  return '/user/dashboard';
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');
    if (isJwtValid(savedToken)) {
      return savedToken;
    }
    clearAuthStorage();
    return null;
  });

  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (isJwtValid(savedToken) && savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        clearAuthStorage();
        return null;
      }
    }
    clearAuthStorage();
    return null;
  });

  const [loading, setLoading] = useState(true);

  const logout = () => {
    clearAuthStorage();
    setToken(null);
    setUser(null);
  };

  // Initialize auth state by fetching current user profile if valid token exists
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (isJwtValid(storedToken)) {
        try {
          const profile = await profileService.getProfile();
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
          console.error('Failed to verify session token on initialization:', err);
          logout();
        }
      } else {
        // Token invalid or missing - enforce complete session cleanup
        logout();
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const loginWithToken = async (jwtToken) => {
    if (!isJwtValid(jwtToken)) {
      logout();
      throw new Error('Invalid JWT Token structure or expired.');
    }
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
      console.error('Failed to initialize session with token:', err);
      logout();
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      const { token: jwtToken, ...userData } = response;

      if (!isJwtValid(jwtToken)) {
        logout();
        throw new Error('Received invalid JWT token from server.');
      }

      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(jwtToken);
      setUser(userData);
      return response;
    } catch (err) {
      logout();
      throw err;
    }
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
      userRoles.some((r) => String(r).replace('ROLE_', '').toUpperCase() === role.toUpperCase())
    );
  };

  const getDashboardPath = () => getRoleDashboardPath(user);
  const isAuthenticated = isJwtValid(token) && !!user;

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
        getDashboardPath,
        isAuthenticated,
        isAdmin: isAuthenticated && hasRole('ADMIN'),
        isPharmacist: isAuthenticated && hasRole('PHARMACIST'),
        isStaff: isAuthenticated && hasRole('STAFF'),
        isUser: isAuthenticated && hasRole('USER'),
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
