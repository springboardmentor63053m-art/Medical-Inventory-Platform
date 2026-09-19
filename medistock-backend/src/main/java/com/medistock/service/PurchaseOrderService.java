package com.medistock.service;

import com.medistock.dto.PageResponse;
import com.medistock.dto.PurchaseOrderCreateRequest;
import com.medistock.dto.PurchaseOrderDTO;
import com.medistock.enums.OrderStatus;
import org.springframework.data.domain.Pageable;

public interface PurchaseOrderService {
    PurchaseOrderDTO createPurchaseOrder(PurchaseOrderCreateRequest request);
    PageResponse<PurchaseOrderDTO> getAllPurchaseOrders(OrderStatus status, Long supplierId, Pageable pageable);
    PurchaseOrderDTO getPurchaseOrderById(Long id);
    PurchaseOrderDTO updateOrderStatus(Long id, OrderStatus status, String updatedBy);
    PageResponse<PurchaseOrderDTO> getOrdersBySupplier(Long supplierId, Pageable pageable);
    PurchaseOrderDTO shipOrder(Long orderId, String trackingDetails, Long supplierUserId);
    void cancelPurchaseOrder(Long id);
}
