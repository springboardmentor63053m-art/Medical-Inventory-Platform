import axiosInstance from './axios';

export const stockMovementApi = {
  getAll: async () => {
    const response = await axiosInstance.get('/stock-movements');
    return response.data;
  },

  getByMedicineId: async (medicineId) => {
    const response = await axiosInstance.get(`/stock-movements/medicine/${medicineId}`);
    return response.data;
  }
};
