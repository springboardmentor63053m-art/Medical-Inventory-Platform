import axiosInstance from './axios';

export const supplierApi = {
  getAll: async () => {
    const response = await axiosInstance.get('/suppliers');
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/suppliers/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axiosInstance.post('/suppliers', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/suppliers/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/suppliers/${id}`);
    return response.data;
  }
};
