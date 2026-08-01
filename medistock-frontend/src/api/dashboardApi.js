import axiosInstance from './axios';

export const dashboardApi = {
  getSummary: async () => {
    const response = await axiosInstance.get('/dashboard');
    return response.data;
  }
};
