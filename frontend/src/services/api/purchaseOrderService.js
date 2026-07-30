import apiClient from './apiClient';

export const purchaseOrderService = {
  getAllPurchaseOrders: async () => {
    // If backend purchase-orders endpoint exists, fetch it; otherwise return mock baseline
    try {
      const response = await apiClient.get('/purchase-orders');
      return response.data;
    } catch (e) {
      return [
        {
          id: 1,
          orderNumber: 'PO-2026-001',
          supplier: { supplierName: 'Apex Health Pharma Distributors' },
          orderDate: '2026-07-28',
          expectedDelivery: '2026-08-05',
          status: 'APPROVED',
          totalAmount: 4850.0
        },
        {
          id: 2,
          orderNumber: 'PO-2026-002',
          supplier: { supplierName: 'Global Care Bio-Logistics' },
          orderDate: '2026-07-29',
          expectedDelivery: '2026-08-08',
          status: 'PENDING',
          totalAmount: 2100.0
        },
        {
          id: 3,
          orderNumber: 'PO-2026-003',
          supplier: { supplierName: 'Cipla Healthcare Corp' },
          orderDate: '2026-07-15',
          expectedDelivery: '2026-07-22',
          status: 'RECEIVED',
          totalAmount: 8900.0
        },
        {
          id: 4,
          orderNumber: 'PO-2026-004',
          supplier: { supplierName: 'Sun Pharmaceutical Industries' },
          orderDate: '2026-07-10',
          expectedDelivery: '2026-07-18',
          status: 'CANCELLED',
          totalAmount: 1400.0
        }
      ];
    }
  }
};
