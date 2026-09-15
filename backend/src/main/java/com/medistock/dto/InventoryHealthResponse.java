package com.medistock.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Composite inventory health score (0-100) plus the dead-stock watchlist
 * that feeds into it. Surfaced on the Admin dashboard as a decision-oriented
 * summary rather than just raw counts.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryHealthResponse {
    /** 0-100 composite score: stock availability, expiry risk, low-stock compliance, and dead-stock all weighted equally. */
    private int healthScore;
    private String healthLabel;

    private long totalActiveMedicines;
    private long outOfStockCount;
    private long lowStockCount;
    private long expiryRiskCount;
    private long deadStockCount;

    private int deadStockWindowDays;
    private List<DeadStockItem> deadStockItems;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DeadStockItem {
        private Long medicineId;
        private String medicineName;
        private Integer quantity;
        private BigDecimal value;
        /** Null if this medicine has never been sold at all. */
        private Integer daysSinceLastSale;
        private boolean neverSold;
    }
}
