import apiClient from './apiClient';

export const userService = {
  getAllUsers: async () => {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },

  getUserById: async (id) => {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await apiClient.put(`/admin/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  },
};
