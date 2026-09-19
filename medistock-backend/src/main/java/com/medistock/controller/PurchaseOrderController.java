package com.medistock.controller;

import com.medistock.dto.ApiResponse;
import com.medistock.dto.PageResponse;
import com.medistock.dto.PurchaseOrderCreateRequest;
import com.medistock.dto.PurchaseOrderDTO;
import com.medistock.enums.OrderStatus;
import com.medistock.service.PurchaseOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/purchase-orders")
@Tag(name = "Purchase Orders", description = "Purchase Order Procurement APIs")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    public PurchaseOrderController(PurchaseOrderService purchaseOrderService) {
        this.purchaseOrderService = purchaseOrderService;
    }

    @PostMapping
    @Operation(summary = "Create Purchase Order", description = "Create a new purchase order for supplier")
    public ResponseEntity<ApiResponse<PurchaseOrderDTO>> createPurchaseOrder(
            @Valid @RequestBody PurchaseOrderCreateRequest request
    ) {
        PurchaseOrderDTO created = purchaseOrderService.createPurchaseOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Purchase order created successfully"));
    }

    @GetMapping
    @Operation(summary = "Get All Purchase Orders", description = "Paginated listing & filtering by status or supplier")
    public ResponseEntity<ApiResponse<PageResponse<PurchaseOrderDTO>>> getAllPurchaseOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        PageResponse<PurchaseOrderDTO> orders = purchaseOrderService.getAllPurchaseOrders(status, supplierId, pageable);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Purchase Order by ID", description = "Fetch detailed purchase order by ID")
    public ResponseEntity<ApiResponse<PurchaseOrderDTO>> getPurchaseOrderById(@PathVariable Long id) {
        PurchaseOrderDTO order = purchaseOrderService.getPurchaseOrderById(id);
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update Order Status", description = "Update status (e.g. APPROVED, RECEIVED, CANCELLED). Mark RECEIVED auto-updates inventory stock!")
    public ResponseEntity<ApiResponse<PurchaseOrderDTO>> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status,
            Authentication authentication
    ) {
        String updatedBy = authentication != null ? authentication.getName() : "System User";
        PurchaseOrderDTO updated = purchaseOrderService.updateOrderStatus(id, status, updatedBy);
        return ResponseEntity.ok(ApiResponse.success(updated, "Purchase order status updated successfully"));
    }

    @PutMapping("/{id}/ship")
    @Operation(summary = "Ship Order (Supplier)", description = "Supplier marks order as SHIPPED and provides shipping tracking info")
    public ResponseEntity<ApiResponse<PurchaseOrderDTO>> shipOrder(
            @PathVariable Long id,
            @RequestParam(required = false) String trackingDetails,
            Authentication authentication
    ) {
        PurchaseOrderDTO shipped = purchaseOrderService.shipOrder(id, trackingDetails, null);
        return ResponseEntity.ok(ApiResponse.success(shipped, "Order marked as SHIPPED"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancel Purchase Order", description = "Cancel pending purchase order")
    public ResponseEntity<ApiResponse<Void>> cancelPurchaseOrder(@PathVariable Long id) {
        purchaseOrderService.cancelPurchaseOrder(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Purchase order cancelled successfully"));
    }
}
