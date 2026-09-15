package com.medistock.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardResponse {
    // Inventory analytics
    private long totalMedicines;
    private long totalSuppliers;
    private long totalUsers;
    private BigDecimal totalInventoryValue;
    private long lowStockCount;
    private long outOfStockCount;
    private long nearExpiryCount;
    private long expiredCount;

    // Purchase / financial
    private BigDecimal totalSpendThisMonth;
    private long purchasesThisMonth;
    private BigDecimal totalPurchaseValueAllTime;
    private long totalPurchasesAllTime;
    private long ordersAwaitingAction;
    private List<PurchaseSummary> recentPurchases;

    // Supplier analytics
    private long totalActiveSuppliers;
    private List<SupplyInsightResponse> supplierInsights;

    // Stock movements
    private List<StockMovementSummary> recentStockMovements;

    // Sales overview (requirement 14) + quarterly graphs (requirement 8/15)
    private BigDecimal salesToday;
    private BigDecimal salesThisMonth;
    private long billsGeneratedThisMonth;
    private long medicinesSoldThisMonth;
    private List<SaleResponse> recentSales;
    private List<TopMedicineResponse> topSellingMedicines;
    private List<ChartPoint> quarterlySales;
    private List<ChartPoint> quarterlyPurchaseValue;

    // Active users (requirement 3/24)
    private ActiveUsersSummary activeUsers;

    // System monitoring
    private long unreadNotifications;
    private String systemStatus;
    private String serverTime;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PurchaseSummary {
        private Long id;
        private String medicineName;
        private String supplierName;
        private Integer quantity;
        private BigDecimal totalAmount;
        private String purchaseDate;
        private String recordedBy;
        private String orderStatus;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StockMovementSummary {
        private String medicineName;
        private String type;
        private Integer quantityChange;
        private Integer newQuantity;
        private String performedBy;
        private String timestamp;
    }
}
