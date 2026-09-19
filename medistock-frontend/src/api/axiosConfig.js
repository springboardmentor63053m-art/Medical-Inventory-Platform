import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to attach JWT token to all requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medistock_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to catch errors gracefully
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    if (status === 401) {
      console.warn('API Unauthorized (401) on URL:', error.config?.url);
      // Only clear storage if not using offline mock mode
      const savedUser = localStorage.getItem('medistock_user');
      if (savedUser) {
        try {
          const userObj = JSON.parse(savedUser);
          if (userObj && !userObj.isMock) {
            localStorage.removeItem('medistock_token');
            localStorage.removeItem('medistock_user');
          }
        } catch (e) {}
      }
    } else {
      console.error('API Response Error:', status, error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

export default API;
