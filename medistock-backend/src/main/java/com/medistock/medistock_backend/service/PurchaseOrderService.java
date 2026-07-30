package com.medistock.medistock_backend.service;

import com.medistock.medistock_backend.dto.PurchaseOrderRequest;
import com.medistock.medistock_backend.dto.PurchaseOrderResponse;
import com.medistock.medistock_backend.entity.OrderStatus;

import java.util.List;

public interface PurchaseOrderService {
    List<PurchaseOrderResponse> getAllPurchaseOrders();
    PurchaseOrderResponse getPurchaseOrderById(Long id);
    PurchaseOrderResponse getPurchaseOrderByOrderNumber(String orderNumber);
    List<PurchaseOrderResponse> getPurchaseOrdersByStatus(OrderStatus status);
    PurchaseOrderResponse createPurchaseOrder(PurchaseOrderRequest request, String currentUsername);
    PurchaseOrderResponse updateOrderStatus(Long id, OrderStatus status);
    void deletePurchaseOrder(Long id);
}
