package com.medistock.purchase.service;

import com.medistock.purchase.dto.request.PurchaseOrderRequest;
import com.medistock.purchase.dto.response.PurchaseOrderResponse;

import java.util.List;

public interface PurchaseOrderService {
    PurchaseOrderResponse createPurchaseOrder(PurchaseOrderRequest request);
    List<PurchaseOrderResponse> getAllPurchaseOrders();
    PurchaseOrderResponse getPurchaseOrderById(Long id);
    PurchaseOrderResponse updatePurchaseOrderStatus(Long id, String status);
    void deletePurchaseOrder(Long id);
}
