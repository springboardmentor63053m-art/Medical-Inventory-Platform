import apiClient from '../../../../services/api/apiClient';

export const notificationsApi = {
  getActiveNotifications: async () => {
    const response = await apiClient.get('/notifications');
    return response.data;
  },
  getUnreadNotifications: async () => {
    const response = await apiClient.get('/notifications/unread');
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await apiClient.patch('/notifications/read-all');
    return response.data;
  },
  dismissNotification: async (id) => {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data;
  },
  syncNotifications: async () => {
    const response = await apiClient.post('/notifications/sync');
    return response.data;
  },
};