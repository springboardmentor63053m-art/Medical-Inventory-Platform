package com.medistock.medistock_backend.controller;

import com.medistock.medistock_backend.dto.ApiResponse;
import com.medistock.medistock_backend.dto.PurchaseOrderRequest;
import com.medistock.medistock_backend.dto.PurchaseOrderResponse;
import com.medistock.medistock_backend.entity.OrderStatus;
import com.medistock.medistock_backend.service.PurchaseOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PurchaseOrderResponse>>> getAllPurchaseOrders() {
        return ResponseEntity.ok(ApiResponse.success("Purchase orders retrieved successfully", purchaseOrderService.getAllPurchaseOrders()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> getPurchaseOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Purchase order retrieved successfully", purchaseOrderService.getPurchaseOrderById(id)));
    }

    @GetMapping("/order-number/{orderNumber}")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> getPurchaseOrderByOrderNumber(@PathVariable String orderNumber) {
        return ResponseEntity.ok(ApiResponse.success("Purchase order retrieved successfully", purchaseOrderService.getPurchaseOrderByOrderNumber(orderNumber)));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<PurchaseOrderResponse>>> getPurchaseOrdersByStatus(@PathVariable OrderStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Purchase orders retrieved by status", purchaseOrderService.getPurchaseOrdersByStatus(status)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> createPurchaseOrder(
            @Valid @RequestBody PurchaseOrderRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : null;
        PurchaseOrderResponse created = purchaseOrderService.createPurchaseOrder(request, username);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Purchase order created successfully", created));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Order status updated successfully", purchaseOrderService.updateOrderStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePurchaseOrder(@PathVariable Long id) {
        purchaseOrderService.deletePurchaseOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Purchase order deleted successfully", null));
    }
}
