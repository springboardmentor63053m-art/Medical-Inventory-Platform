package com.medistock.controller;

import com.medistock.dto.AnalyticsDTO;
import com.medistock.dto.ApiResponse;
import com.medistock.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@RestController
@RequestMapping("/api/analytics")
@Tag(name = "Analytics", description = "Inventory Analytics & Metrics APIs")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get Dashboard Analytics", description = "Aggregated analytics metrics for overall inventory, expiry, suppliers, stock movements, and purchases")
    public ResponseEntity<ApiResponse<AnalyticsDTO.DashboardAnalytics>> getDashboardAnalytics() {
        AnalyticsDTO.DashboardAnalytics analytics = analyticsService.getDashboardAnalytics();
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }

    @GetMapping("/summary")
    @Operation(summary = "Get Analytics Summary", description = "Aggregated summary of system analytics")
    public ResponseEntity<ApiResponse<AnalyticsDTO.DashboardAnalytics>> getAnalyticsSummary() {
        AnalyticsDTO.DashboardAnalytics analytics = analyticsService.getDashboardAnalytics();
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }

    @GetMapping("/inventory")
    @Operation(summary = "Get Inventory Analytics", description = "Total medicines, stock quantities, available/low/out-of-stock counts, and inventory valuation")
    public ResponseEntity<ApiResponse<AnalyticsDTO.InventoryAnalytics>> getInventoryAnalytics() {
        AnalyticsDTO.InventoryAnalytics analytics = analyticsService.getInventoryAnalytics();
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }

    @GetMapping("/expiry")
    @Operation(summary = "Get Expiry Analytics", description = "Counts and quantities of active, expiring soon, and expired stock")
    public ResponseEntity<ApiResponse<AnalyticsDTO.ExpiryAnalytics>> getExpiryAnalytics() {
        AnalyticsDTO.ExpiryAnalytics analytics = analyticsService.getExpiryAnalytics();
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }

    @GetMapping("/suppliers")
    @Operation(summary = "Get Supplier Analytics", description = "Supplier count, supplied medicine count, and total stock per supplier")
    public ResponseEntity<ApiResponse<AnalyticsDTO.SupplierAnalytics>> getSupplierAnalytics() {
        AnalyticsDTO.SupplierAnalytics analytics = analyticsService.getSupplierAnalytics();
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }

    @GetMapping("/stock-movement")
    @Operation(summary = "Get Stock Movement Analytics", description = "Stock IN, Stock OUT, Adjustment, and Return totals over a date range")
    public ResponseEntity<ApiResponse<AnalyticsDTO.StockMovementAnalytics>> getStockMovementAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        LocalDateTime fromDt = from != null ? from.atStartOfDay() : null;
        LocalDateTime toDt = to != null ? to.atTime(LocalTime.MAX) : null;

        AnalyticsDTO.StockMovementAnalytics analytics = analyticsService.getStockMovementAnalytics(fromDt, toDt);
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }

    @GetMapping("/purchases")
    @Operation(summary = "Get Purchase Analytics", description = "Total purchase orders, current month orders, and monthly spend")
    public ResponseEntity<ApiResponse<AnalyticsDTO.PurchaseAnalytics>> getPurchaseAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        LocalDateTime fromDt = from != null ? from.atStartOfDay() : null;
        LocalDateTime toDt = to != null ? to.atTime(LocalTime.MAX) : null;

        AnalyticsDTO.PurchaseAnalytics analytics = analyticsService.getPurchaseAnalytics(fromDt, toDt);
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }
}
