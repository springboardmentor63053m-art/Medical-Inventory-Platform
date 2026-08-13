import apiClient from './apiClient';

export const medicineService = {
  getAllMedicines: async (page = 0, size = 10, sortBy = 'id', sortDir = 'asc') => {
    const response = await apiClient.get('/medicines', {
      params: { page, size, sortBy, sortDir },
    });
    return response.data;
  },

  getMedicineById: async (id) => {
    const response = await apiClient.get(`/medicines/${id}`);
    return response.data;
  },

  getSuppliersByMedicine: async (id) => {
    const response = await apiClient.get(`/medicines/${id}/suppliers`);
    return response.data;
  },

  searchMedicines: async (name) => {
    const response = await apiClient.get('/medicines/search', {
      params: { name },
    });
    return response.data;
  },

  getMedicinesByCategory: async (categoryId) => {
    const response = await apiClient.get(`/medicines/category/${categoryId}`);
    return response.data;
  },

  createMedicine: async (data) => {
    const response = await apiClient.post('/medicines', data);
    return response.data;
  },

  updateMedicine: async (id, data) => {
    const response = await apiClient.put(`/medicines/${id}`, data);
    return response.data;
  },

  deleteMedicine: async (id) => {
    const response = await apiClient.delete(`/medicines/${id}`);
    return response.data;
  },

  getMasterCatalog: async (page = 0, size = 250, search = '', categoryId = '', supplierId = '') => {
    const params = { page, size };
    if (search) params.search = search;
    if (categoryId) params.categoryId = categoryId;
    if (supplierId) params.supplierId = supplierId;
    const response = await apiClient.get('/medicines/master', { params });
    return response.data;
  },
};
