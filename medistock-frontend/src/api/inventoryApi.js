import axiosInstance from './axios';

export const inventoryApi = {
  getAll: async () => {
    const response = await axiosInstance.get('/inventory');
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/inventory/${id}`);
    return response.data;
  },

  getByMedicineId: async (medicineId) => {
    const response = await axiosInstance.get(`/inventory/medicine/${medicineId}`);
    return response.data;
  },

  getLowStock: async () => {
    const response = await axiosInstance.get('/inventory/low-stock');
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/inventory/${id}`, data);
    return response.data;
  },

  updateStockDelta: async (medicineId, delta) => {
    const response = await axiosInstance.patch(`/inventory/medicine/${medicineId}/stock?delta=${delta}`);
    return response.data;
  }
};
