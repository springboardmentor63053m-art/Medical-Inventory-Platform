import api from './apiClient';

export const prescriptionService = {
  // Place an online prescription order
  createPrescriptionOrder: async (data) => {
    const response = await api.post('/prescriptions/orders', data);
    return response.data;
  },

  // Get current user's orders
  getMyOrders: async () => {
    const response = await api.get('/prescriptions/orders/my-orders');
    return response.data;
  },

  // Get all orders (Pharmacist / Admin)
  getAllOrders: async (status = 'ALL') => {
    const response = await api.get('/prescriptions/orders', {
      params: { status },
    });
    return response.data;
  },

  // Get single order by ID
  getOrderById: async (id) => {
    const response = await api.get(`/prescriptions/orders/${id}`);
    return response.data;
  },

  // Pharmacist verify or reject prescription order
  verifyOrder: async (id, verificationData) => {
    const response = await api.put(`/prescriptions/orders/${id}/verify`, verificationData);
    return response.data;
  },

  // Create in-store walk-in counter purchase (POS)
  createStorePurchase: async (data) => {
    const response = await api.post('/store/purchases', data);
    return response.data;
  },

  // Get all store walk-in receipts
  getAllStorePurchases: async () => {
    const response = await api.get('/store/purchases');
    return response.data;
  },
};
