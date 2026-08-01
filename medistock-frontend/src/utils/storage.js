const TOKEN_KEY = 'medistock_jwt_token';
const USER_KEY = 'medistock_user_data';

export const storage = {
  getToken: () => {
    try {
      return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken: (token, rememberMe = true) => {
    try {
      if (rememberMe) {
        localStorage.setItem(TOKEN_KEY, token);
        sessionStorage.removeItem(TOKEN_KEY);
      } else {
        sessionStorage.setItem(TOKEN_KEY, token);
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch (e) {
      console.error('Failed to save token to storage', e);
    }
  },

  getUser: () => {
    try {
      const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setUser: (user, rememberMe = true) => {
    try {
      const dataStr = JSON.stringify(user);
      if (rememberMe) {
        localStorage.setItem(USER_KEY, dataStr);
        sessionStorage.removeItem(USER_KEY);
      } else {
        sessionStorage.setItem(USER_KEY, dataStr);
        localStorage.removeItem(USER_KEY);
      }
    } catch (e) {
      console.error('Failed to save user to storage', e);
    }
  },

  clearAuth: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('Failed to clear auth storage', e);
    }
  },

  isTokenExpired: (token) => {
    if (!token) return true;
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return true;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      if (!payload.exp) return false;
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }
};
