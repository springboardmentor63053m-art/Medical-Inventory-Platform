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
public class PharmacistDashboardResponse {
    private long purchasesThisMonth;
    private BigDecimal spendThisMonth;
    private long nearExpiryCount;
    private long expiredCount;
    private long lowStockCount;
    private List<SupplyInsightResponse> topSuppliers;
    private List<com.medistock.model.Medicine> expiringMedicines;
}
