import axios from 'axios';
import { toast } from 'react-toastify';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Global Errors (401, 403, 500)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'An unexpected error occurred. Please try again.';

    if (status === 401) {
      // Unauthorized: clear session if token was invalid/expired
      const token = localStorage.getItem('token');
      if (token) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Session expired. Please log in again.');
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    } else if (status === 403) {
      toast.error('Access Denied: You do not have permission for this action.');
    } else if (status >= 500) {
      toast.error(`Server Error (${status}): ${message}`);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
