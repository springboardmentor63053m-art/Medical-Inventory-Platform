package com.medistock.dto;

import java.math.BigDecimal;
import java.util.List;

public class SupplierDashboardDTO {
    private SupplierDTO supplierProfile;
    private List<MedicineDTO> suppliedMedicines;
    private List<PurchaseOrderDTO> purchaseOrders;
    private long totalSuppliedMedicines;
    private long totalOrdersCount;
    private long completedOrdersCount;
    private long pendingOrdersCount;
    private BigDecimal totalRevenueSupplied;
    private double fulfillmentRate;
    private List<StockLogDTO> recentActivities;

    public SupplierDashboardDTO() {}

    public SupplierDTO getSupplierProfile() { return supplierProfile; }
    public void setSupplierProfile(SupplierDTO supplierProfile) { this.supplierProfile = supplierProfile; }

    public List<MedicineDTO> getSuppliedMedicines() { return suppliedMedicines; }
    public void setSuppliedMedicines(List<MedicineDTO> suppliedMedicines) { this.suppliedMedicines = suppliedMedicines; }

    public List<PurchaseOrderDTO> getPurchaseOrders() { return purchaseOrders; }
    public void setPurchaseOrders(List<PurchaseOrderDTO> purchaseOrders) { this.purchaseOrders = purchaseOrders; }

    public long getTotalSuppliedMedicines() { return totalSuppliedMedicines; }
    public void setTotalSuppliedMedicines(long totalSuppliedMedicines) { this.totalSuppliedMedicines = totalSuppliedMedicines; }

    public long getTotalOrdersCount() { return totalOrdersCount; }
    public void setTotalOrdersCount(long totalOrdersCount) { this.totalOrdersCount = totalOrdersCount; }

    public long getCompletedOrdersCount() { return completedOrdersCount; }
    public void setCompletedOrdersCount(long completedOrdersCount) { this.completedOrdersCount = completedOrdersCount; }

    public long getPendingOrdersCount() { return pendingOrdersCount; }
    public void setPendingOrdersCount(long pendingOrdersCount) { this.pendingOrdersCount = pendingOrdersCount; }

    public BigDecimal getTotalRevenueSupplied() { return totalRevenueSupplied; }
    public void setTotalRevenueSupplied(BigDecimal totalRevenueSupplied) { this.totalRevenueSupplied = totalRevenueSupplied; }

    public double getFulfillmentRate() { return fulfillmentRate; }
    public void setFulfillmentRate(double fulfillmentRate) { this.fulfillmentRate = fulfillmentRate; }

    public List<StockLogDTO> getRecentActivities() { return recentActivities; }
    public void setRecentActivities(List<StockLogDTO> recentActivities) { this.recentActivities = recentActivities; }

    public static SupplierDashboardDTOBuilder builder() { return new SupplierDashboardDTOBuilder(); }

    public static class SupplierDashboardDTOBuilder {
        private SupplierDTO supplierProfile;
        private List<MedicineDTO> suppliedMedicines;
        private List<PurchaseOrderDTO> purchaseOrders;
        private long totalSuppliedMedicines;
        private long totalOrdersCount;
        private long completedOrdersCount;
        private long pendingOrdersCount;
        private BigDecimal totalRevenueSupplied;
        private double fulfillmentRate;
        private List<StockLogDTO> recentActivities;

        public SupplierDashboardDTOBuilder supplierProfile(SupplierDTO profile) { this.supplierProfile = profile; return this; }
        public SupplierDashboardDTOBuilder suppliedMedicines(List<MedicineDTO> meds) { this.suppliedMedicines = meds; return this; }
        public SupplierDashboardDTOBuilder purchaseOrders(List<PurchaseOrderDTO> orders) { this.purchaseOrders = orders; return this; }
        public SupplierDashboardDTOBuilder totalSuppliedMedicines(long v) { this.totalSuppliedMedicines = v; return this; }
        public SupplierDashboardDTOBuilder totalOrdersCount(long v) { this.totalOrdersCount = v; return this; }
        public SupplierDashboardDTOBuilder completedOrdersCount(long v) { this.completedOrdersCount = v; return this; }
        public SupplierDashboardDTOBuilder pendingOrdersCount(long v) { this.pendingOrdersCount = v; return this; }
        public SupplierDashboardDTOBuilder totalRevenueSupplied(BigDecimal v) { this.totalRevenueSupplied = v; return this; }
        public SupplierDashboardDTOBuilder fulfillmentRate(double v) { this.fulfillmentRate = v; return this; }
        public SupplierDashboardDTOBuilder recentActivities(List<StockLogDTO> logs) { this.recentActivities = logs; return this; }

        public SupplierDashboardDTO build() {
            SupplierDashboardDTO dto = new SupplierDashboardDTO();
            dto.supplierProfile = this.supplierProfile;
            dto.suppliedMedicines = this.suppliedMedicines;
            dto.purchaseOrders = this.purchaseOrders;
            dto.totalSuppliedMedicines = this.totalSuppliedMedicines;
            dto.totalOrdersCount = this.totalOrdersCount;
            dto.completedOrdersCount = this.completedOrdersCount;
            dto.pendingOrdersCount = this.pendingOrdersCount;
            dto.totalRevenueSupplied = this.totalRevenueSupplied;
            dto.fulfillmentRate = this.fulfillmentRate;
            dto.recentActivities = this.recentActivities;
            return dto;
        }
    }
}
