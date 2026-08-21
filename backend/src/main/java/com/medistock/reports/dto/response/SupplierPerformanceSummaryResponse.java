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
public class SupplierPerformanceSummaryResponse {

    private Integer reportDays;
    private Integer totalOrders;
    private BigDecimal totalProcurementValue;
    private Integer activeOrders;
    private Integer receivedOrders;
    private Integer lateDeliveries;
    private List<SupplierMetric> suppliers;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupplierMetric {

        private String supplierName;
        private Integer purchaseOrderCount;
        private BigDecimal procurementValue;
        private BigDecimal averageOrderValue;

        private Integer pendingCount;
        private Integer approvedCount;
        private Integer processingCount;
        private Integer shippedCount;
        private Integer receivedCount;
        private Integer cancelledCount;

        private Integer lateDeliveries;
        private BigDecimal averageDeliveryDays;
        private BigDecimal procurementShare;
    }
}