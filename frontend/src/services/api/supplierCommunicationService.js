import apiClient from './apiClient';

export const supplierCommunicationService = {
  getAllConversations: async (search = '', filter = '') => {
    const response = await apiClient.get('/supplier-communications/conversations', {
      params: { search, filter },
    });
    return response.data;
  },

  getSupplierConversation: async (supplierIdentifier) => {
    const response = await apiClient.get(`/supplier-communications/suppliers/${supplierIdentifier}/conversation`);
    return response.data;
  },

  getSupplierMessages: async (supplierIdentifier) => {
    const response = await apiClient.get(`/supplier-communications/suppliers/${supplierIdentifier}/messages`);
    return response.data;
  },

  sendMessageToSupplier: async (supplierIdentifier, content, messageType = 'SUPPLIER_MESSAGE', purchaseOrderId = null, attachmentFile = null) => {
    if (attachmentFile) {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('messageType', messageType);
      if (purchaseOrderId) formData.append('purchaseOrderId', purchaseOrderId);
      formData.append('attachment', attachmentFile);

      const response = await apiClient.post(`/supplier-communications/suppliers/${supplierIdentifier}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } else {
      const response = await apiClient.post(`/supplier-communications/suppliers/${supplierIdentifier}/messages/text`, {
        content,
        messageType,
        purchaseOrderId,
      });
      return response.data;
    }
  },

  startConversation: async (supplierId, purchaseOrderId = null, initialMessage = '') => {
    const response = await apiClient.post('/supplier-communications/conversations', {
      supplierId,
      purchaseOrderId,
      initialMessage,
    });
    return response.data;
  },

  updateConversationStatus: async (id, status) => {
    const response = await apiClient.put(`/supplier-communications/conversations/${id}/status`, {
      status,
    });
    return response.data;
  },

  getMyConversation: async () => {
    const response = await apiClient.get('/supplier-communications/conversations/my');
    return response.data;
  },

  getConversationById: async (id) => {
    const response = await apiClient.get(`/supplier-communications/conversations/${id}`);
    return response.data;
  },

  getConversationByPO: async (poId) => {
    const response = await apiClient.get(`/supplier-communications/by-po/${poId}`);
    return response.data;
  },

  getMessages: async (conversationId) => {
    const response = await apiClient.get(`/supplier-communications/conversations/${conversationId}/messages`);
    return response.data;
  },

  sendMessage: async (conversationId, content, messageType = 'SUPPLIER_MESSAGE', purchaseOrderId = null, attachmentFile = null) => {
    if (attachmentFile) {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('messageType', messageType);
      if (purchaseOrderId) formData.append('purchaseOrderId', purchaseOrderId);
      formData.append('attachment', attachmentFile);

      const response = await apiClient.post(`/supplier-communications/conversations/${conversationId}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } else {
      const response = await apiClient.post(`/supplier-communications/conversations/${conversationId}/messages/text`, {
        content,
        messageType,
        purchaseOrderId,
      });
      return response.data;
    }
  },

  markAsRead: async (conversationId) => {
    const response = await apiClient.put(`/supplier-communications/conversations/${conversationId}/read`);
    return response.data;
  },

  updatePOStatusFromChat: async (poId, status, note = '') => {
    const response = await apiClient.post(`/supplier-communications/purchase-orders/${poId}/update-status`, {
      status,
      note,
    });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await apiClient.get('/supplier-communications/unread-count');
    return response.data;
  },
};
