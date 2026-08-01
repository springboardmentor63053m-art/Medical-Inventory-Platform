import axiosInstance from './axios';

export const purchaseOrderApi = {
  getAll: async () => {
    const response = await axiosInstance.get('/purchase-orders');
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/purchase-orders/${id}`);
    return response.data;
  },

  getByOrderNumber: async (orderNumber) => {
    const response = await axiosInstance.get(`/purchase-orders/order-number/${orderNumber}`);
    return response.data;
  },

  getByStatus: async (status) => {
    const response = await axiosInstance.get(`/purchase-orders/status/${status}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axiosInstance.post('/purchase-orders', data);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await axiosInstance.patch(`/purchase-orders/${id}/status?status=${status}`);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/purchase-orders/${id}`);
    return response.data;
  }
};
