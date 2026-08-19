package com.medistock.analytics.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryAnalyticsResponse {

    private Long totalMedicines;
    private Long totalCategories;
    private Long totalSuppliers;

    private Long totalInventoryRecords;
    private Long totalStockQuantity;

    private Long normalStockCount;
    private Long lowStockCount;
    private Long outOfStockCount;

    private Long validCount;
    private Long expiringSoonCount;
    private Long expiredCount;

    private Long totalPurchaseOrders;
    private BigDecimal totalPurchaseOrderValue;
}