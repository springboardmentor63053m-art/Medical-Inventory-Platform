import apiClient from '../../../../services/api/apiClient';

export const dashboardApi = {
  getInventoryAnalytics: async () => {
    const response = await apiClient.get('/analytics/inventory');
    return response.data;
  },
};