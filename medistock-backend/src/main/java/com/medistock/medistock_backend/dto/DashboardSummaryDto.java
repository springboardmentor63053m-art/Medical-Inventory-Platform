package com.medistock.medistock_backend.dto;

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
public class DashboardSummaryDto {
    private long totalUsers;
    private long totalMedicines;
    private long totalSuppliers;
    private long totalPurchaseOrders;
    private long lowStockCount;
    private BigDecimal totalInventoryValue;
    @Builder.Default
    private String currency = "INR";
    private List<InventoryResponse> lowStockItems;
    private List<PurchaseOrderResponse> recentOrders;
    
    private long availableMedicinesCount;
    private long lowStockMedicinesCount;
    private long outOfStockMedicinesCount;
    private long nearExpiryMedicinesCount;
    private long expiredMedicinesCount;
}
