import apiClient from './apiClient';

export const customerService = {
  lookupCustomer: async (phone) => {
    try {
      const response = await apiClient.get('/customers/lookup', {
        params: { phone },
      });
      const data = response.data;
      const isFound = Boolean(data && (data.found || data.exists));
      const custData = data.customer || (isFound ? data : null);

      return {
        found: isFound,
        exists: isFound,
        customer: custData,
        id: custData ? custData.id : null,
        name: custData ? custData.name : '',
        phone: custData ? custData.phone : '',
        normalizedPhone: data.normalizedPhone || (custData ? custData.normalizedPhone : ''),
        previousPurchasesCount: custData ? (custData.previousPurchasesCount || custData.totalPurchases || 0) : 0,
        lifetimeSpend: custData ? (custData.lifetimeSpend || custData.totalAmountSpent || 0) : 0,
      };
    } catch (error) {
      console.error('Customer lookup error:', error);
      return {
        found: false,
        exists: false,
        customer: null,
        error: error.response?.data?.message || 'Failed to lookup customer',
      };
    }
  },

  createCustomer: async (customerData) => {
    const response = await apiClient.post('/customers', customerData);
    return response.data;
  },

  getAllCustomers: async (search = '', status = '', page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') => {
    const response = await apiClient.get('/customers', {
      params: { search, status, page, size, sortBy, sortDir },
    });
    return response.data;
  },

  getCustomerById: async (id) => {
    const response = await apiClient.get(`/customers/${id}`);
    return response.data;
  },

  getCustomerPurchases: async (id) => {
    const response = await apiClient.get(`/customers/${id}/purchases`);
    return response.data;
  },

  updateCustomerStatus: async (id, status) => {
    const response = await apiClient.put(`/customers/${id}/status`, { status });
    return response.data;
  },
};
