package com.medistock.controller;

import com.medistock.dto.ApiResponse;
import com.medistock.dto.InventoryDTO;
import com.medistock.dto.PageResponse;
import com.medistock.enums.ExpiryStatus;
import com.medistock.service.ExpiryTrackingService;
import com.medistock.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
@Tag(name = "Alerts", description = "Stock & Inventory Alert Management APIs")
public class AlertController {

    private final InventoryService inventoryService;
    private final ExpiryTrackingService expiryTrackingService;

    public AlertController(InventoryService inventoryService, ExpiryTrackingService expiryTrackingService) {
        this.inventoryService = inventoryService;
        this.expiryTrackingService = expiryTrackingService;
    }

    @GetMapping("/low-stock")
    @Operation(summary = "Get Low Stock Alerts", description = "List medicines where stock is below minimum threshold")
    public ResponseEntity<ApiResponse<PageResponse<InventoryDTO>>> getLowStockAlerts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<InventoryDTO> lowStock = inventoryService.getLowStockInventory(pageable);
        return ResponseEntity.ok(ApiResponse.success(lowStock));
    }

    @GetMapping("/out-of-stock")
    @Operation(summary = "Get Out of Stock Alerts", description = "List medicines where stock is 0")
    public ResponseEntity<ApiResponse<PageResponse<InventoryDTO>>> getOutOfStockAlerts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<InventoryDTO> outOfStock = inventoryService.getOutOfStockInventory(pageable);
        return ResponseEntity.ok(ApiResponse.success(outOfStock));
    }

    @GetMapping("/summary")
    @Operation(summary = "Get Alerts Summary", description = "Get aggregate count of low stock, out of stock, expiring soon, and expired alerts")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getAlertsSummary() {
        Map<String, Long> summary = new HashMap<>();
        summary.put("lowStockCount", inventoryService.countLowStockItems());
        summary.put("outOfStockCount", inventoryService.countOutOfStockItems());
        summary.put("expiringSoonCount", expiryTrackingService.countByStatus(ExpiryStatus.EXPIRING_SOON));
        summary.put("expiredCount", expiryTrackingService.countByStatus(ExpiryStatus.EXPIRED));
        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}
