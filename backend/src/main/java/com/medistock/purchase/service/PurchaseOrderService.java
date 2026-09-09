package com.medistock.purchase.service;

import com.medistock.purchase.dto.request.PurchaseOrderRequest;
import com.medistock.purchase.dto.response.PurchaseOrderResponse;
import com.medistock.purchase.dto.request.PurchaseOrderReceiptRequest;
import java.util.List;

public interface PurchaseOrderService {
    PurchaseOrderResponse createPurchaseOrder(PurchaseOrderRequest request);
    List<PurchaseOrderResponse> getAllPurchaseOrders();
    PurchaseOrderResponse getPurchaseOrderById(Long id);
    PurchaseOrderResponse updatePurchaseOrderStatus(Long id, String status);
    PurchaseOrderResponse updatePurchaseOrderStatus(Long id, String status, String note);
    void deletePurchaseOrder(Long id);
        PurchaseOrderResponse receivePurchaseOrder(
            Long id,
            PurchaseOrderReceiptRequest request
    );
}
