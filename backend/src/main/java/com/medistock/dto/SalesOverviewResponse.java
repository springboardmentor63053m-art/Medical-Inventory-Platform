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
public class SalesOverviewResponse {
    private BigDecimal salesToday;
    private BigDecimal salesThisMonth;
    private BigDecimal salesThisYear;
    private long medicinesSoldThisMonth;
    private long billsGeneratedThisMonth;
    private List<SaleResponse> recentSales;
    private List<TopMedicineResponse> topSellingMedicines;
    private List<ChartPoint> quarterlySales;
}
