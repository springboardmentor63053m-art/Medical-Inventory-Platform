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

    // Supplier analytics
    private List<SupplyInsightResponse> supplierInsights;

    // System monitoring
    private long unreadNotifications;
    private String systemStatus;
    private String serverTime;
}
