import axiosInstance from './axios';

export const authApi = {
  login: async (username, password) => {
    const response = await axiosInstance.post('/auth/login', { username, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  }
};
