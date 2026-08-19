import apiClient from '../../../../services/api/apiClient';

export const notificationsApi = {
  getActiveNotifications: async () => {
    const response = await apiClient.get('/notifications');
    return response.data;
  },
};