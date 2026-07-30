import apiClient from './apiClient';

export const authService = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (data) => {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },

  validateResetToken: async (token) => {
    const response = await apiClient.get(`/auth/validate-reset-token?token=${token}`);
    return response.data;
  },

  validateToken: async (token) => {
    const response = await apiClient.get(`/auth/validate?token=${token}`);
    return response.data;
  },
};
