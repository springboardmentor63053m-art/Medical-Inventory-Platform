import apiClient from './apiClient';

export const profileService = {
  getProfile: async () => {
    const response = await apiClient.get('/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await apiClient.put('/profile', data);
    return response.data;
  },

  changePassword: async (data) => {
    const response = await apiClient.put('/profile/change-password', data);
    return response.data;
  },
};
