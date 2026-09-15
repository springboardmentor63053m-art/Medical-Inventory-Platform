package com.medistock.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Pharmacist dashboard — deliberately inventory + sales focused. Supplier
 * insights and the purchase ledger are Admin-only (see AdminDashboard);
 * Pharmacist still records purchases/sales via their own pages, just
 * without duplicating supplier/financial analytics here.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PharmacistDashboardResponse {
    // Inventory summary
    private long totalMedicines;
    private long availableStock;
    private long lowStockCount;
    private long outOfStockCount;
    private long nearExpiryCount;
    private long expiredCount;
    private List<com.medistock.model.Medicine> lowStockMedicines;
    private List<com.medistock.model.Medicine> expiringMedicines;
    private List<AdminDashboardResponse.StockMovementSummary> recentStockMovements;

    // Sales (Pharmacist can record sales too)
    private long mySalesCount;
    private BigDecimal mySalesTotal;
    private List<SaleResponse> recentSales;
}
