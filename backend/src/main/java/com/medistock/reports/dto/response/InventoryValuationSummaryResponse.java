package com.medistock.reports.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryValuationSummaryResponse {

    private BigDecimal totalStockValue;
    private Long totalUnits;
    private Integer totalRecords;
    private BigDecimal averageUnitValue;
    private List<CategoryValuation> categoryValuations;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryValuation {

        private String categoryName;
        private Long totalUnits;
        private Integer inventoryRecords;
        private BigDecimal stockValue;
        private BigDecimal percentageOfTotal;
    }
}