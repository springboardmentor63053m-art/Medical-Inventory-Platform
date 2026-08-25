import apiClient from './apiClient';

export const inventoryService = {
  getAllInventory: async () => {
    const response = await apiClient.get('/inventory');
    return response.data;
  },

  getInventoryById: async (id) => {
    const response = await apiClient.get(`/inventory/${id}`);
    return response.data;
  },

  getLowStockInventory: async () => {
    const response = await apiClient.get('/inventory/low-stock');
    return response.data;
  },

  getExpiredInventory: async () => {
    const response = await apiClient.get('/inventory/expired');
    return response.data;
  },

  getExpiringInventory: async (days = 30) => {
    const response = await apiClient.get('/inventory/expiring', {
      params: { days },
    });
    return response.data;
  },

  getInventoryByMedicineId: async (medicineId) => {
    const response = await apiClient.get(`/inventory/medicine/${medicineId}`);
    return response.data;
  },

  createInventory: async (data) => {
    const response = await apiClient.post('/inventory', data);
    window.dispatchEvent(new Event('medistock-inventory-updated'));
    return response.data;
  },

  updateInventory: async (id, data) => {
    const response = await apiClient.put(`/inventory/${id}`, data);
    window.dispatchEvent(new Event('medistock-inventory-updated'));
    return response.data;
  },

  deleteInventory: async (id) => {
    const response = await apiClient.delete(`/inventory/${id}`);
    window.dispatchEvent(new Event('medistock-inventory-updated'));
    return response.data;
  },

  getStockMovements: async (type, search) => {
    const response = await apiClient.get('/inventory/movements', {
      params: { type, search },
    });
    return response.data;
  },
};
