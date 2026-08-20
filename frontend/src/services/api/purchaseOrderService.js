import apiClient from './apiClient';

export const purchaseOrderService = {
  getAllPurchaseOrders: async () => {
    const response = await apiClient.get('/purchase-orders');
    return response.data;
  },

  getPurchaseOrderById: async (id) => {
    const response = await apiClient.get(`/purchase-orders/${id}`);
    return response.data;
  },

  createPurchaseOrder: async (data) => {
    const response = await apiClient.post('/purchase-orders', data);
    return response.data;
  },

  updatePurchaseOrderStatus: async (id, status) => {
    const response = await apiClient.patch(`/purchase-orders/${id}/status`, { status });
    return response.data;
  },

  deletePurchaseOrder: async (id) => {
    const response = await apiClient.delete(`/purchase-orders/${id}`);
    return response.data;
  },

  receivePurchaseOrder: async (id, receiptData) => {
  const response = await apiClient.post(
    `/purchase-orders/${id}/receive`,
    receiptData
  );
  return response.data;
},
};
