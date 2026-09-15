package com.medistock.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Staff dashboard — inventory view + their own sales activity. Purchase
 * records and supplier details are Admin-only (see AdminDashboard); Staff
 * can still record a purchase via the Purchases page, it's just not
 * duplicated here.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffDashboardResponse {
    private long totalMedicines;
    private long availableStock;
    private long lowStockCount;
    private long outOfStockCount;
    private List<com.medistock.model.Medicine> lowStockMedicines;

    private long mySalesCount;
    private BigDecimal mySalesTotal;
    private List<SaleResponse> recentSales;
}
