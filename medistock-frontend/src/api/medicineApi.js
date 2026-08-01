import axiosInstance from './axios';

export const medicineApi = {
  getAll: async () => {
    const response = await axiosInstance.get('/medicines');
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/medicines/${id}`);
    return response.data;
  },

  getByCode: async (code) => {
    const response = await axiosInstance.get(`/medicines/code/${code}`);
    return response.data;
  },

  search: async (query) => {
    const response = await axiosInstance.get(`/medicines/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },

  getByCategory: async (categoryId) => {
    const response = await axiosInstance.get(`/medicines/category/${categoryId}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axiosInstance.post('/medicines', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/medicines/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/medicines/${id}`);
    return response.data;
  }
};
