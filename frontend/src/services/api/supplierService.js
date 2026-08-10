import apiClient from './apiClient';

export const supplierService = {
  getAllSuppliers: async () => {
    const response = await apiClient.get('/suppliers');
    return response.data;
  },

  getSupplierById: async (id) => {
    const response = await apiClient.get(`/suppliers/${id}`);
    return response.data;
  },

  searchSuppliers: async (name) => {
    try {
      const response = await apiClient.get('/suppliers/search', {
        params: { name },
      });
      const activeList = Array.isArray(response.data) ? response.data : [];
      if (!name || !name.trim()) return activeList;
      const q = name.toLowerCase().trim();
      return activeList.filter(
        (s) =>
          s.supplierName.toLowerCase().includes(q) ||
          s.supplierCode.toLowerCase().includes(q) ||
          (s.contactPerson && s.contactPerson.toLowerCase().includes(q))
      );
    } catch (err) {
      throw err;
    }
  },

  createSupplier: async (data) => {
    const response = await apiClient.post('/suppliers', data);
    return response.data;
  },

  updateSupplier: async (id, data) => {
    const response = await apiClient.put(`/suppliers/${id}`, data);
    return response.data;
  },

  deleteSupplier: async (id) => {
    const response = await apiClient.delete(`/suppliers/${id}`);
    return response.data;
  },

  linkMedicine: async (supplierId, medicineId) => {
    const response = await apiClient.post(`/suppliers/${supplierId}/medicines/${medicineId}`);
    return response.data;
  },

  unlinkMedicine: async (supplierId, medicineId) => {
    const response = await apiClient.delete(`/suppliers/${supplierId}/medicines/${medicineId}`);
    return response.data;
  },

  getSuppliedMedicines: async (supplierId) => {
    const response = await apiClient.get(`/suppliers/${supplierId}/medicines`);
    return response.data;
  },

  getMyMedicines: async () => {
    const response = await apiClient.get('/suppliers/me/medicines');
    return response.data;
  },

  addMyMedicine: async (medicineId) => {
    const response = await apiClient.post(`/suppliers/me/medicines/${medicineId}`);
    return response.data;
  },

  removeMyMedicine: async (medicineId) => {
    const response = await apiClient.delete(`/suppliers/me/medicines/${medicineId}`);
    return response.data;
  },
};
