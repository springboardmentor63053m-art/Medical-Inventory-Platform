package com.medistock.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffDashboardResponse {
    private long myPurchasesCount;
    private long lowStockCount;
    private long totalMedicines;
    private List<com.medistock.model.Purchase> recentPurchases;
}
