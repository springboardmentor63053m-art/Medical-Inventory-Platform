package com.medistock.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {
    private long totalMedicines;
    private long totalSuppliers;
    private long lowStockCount;
    private long outOfStockCount;
    private long nearExpiryCount;
    private long expiredCount;
    private BigDecimal totalInventoryValue;
}
