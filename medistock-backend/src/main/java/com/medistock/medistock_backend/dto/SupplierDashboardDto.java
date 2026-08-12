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
public class SupplierDashboardDto {
    private SupplierDto supplierProfile;
    private List<MedicineResponse> suppliedMedicines;
    private List<PurchaseOrderResponse> purchaseOrders;
    private long pendingOrdersCount;
    private long completedOrdersCount;
    private long totalOrdersCount;
    private BigDecimal totalOrderAmount;
    private List<PurchaseOrderResponse> recentActivity;
}
