package com.medistock.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardSummaryDTO {
    private long totalMedicines;
    private long availableStockCount;
    private long lowStockCount;
    private long outOfStockCount;
    private long totalStockQuantity;
    private long expiringSoonCount;
    private long expiredCount;
    private long totalSuppliers;
    private long pendingOrdersCount;
    private BigDecimal totalInventoryValue;
    private long unreadNotificationsCount;
    private long purchasesThisMonth;
    private BigDecimal spendThisMonth;
    private List<StockLogDTO> recentActivities;

    public DashboardSummaryDTO() {}

    public long getTotalMedicines() { return totalMedicines; }
    public void setTotalMedicines(long totalMedicines) { this.totalMedicines = totalMedicines; }

    public long getAvailableStockCount() { return availableStockCount; }
    public void setAvailableStockCount(long availableStockCount) { this.availableStockCount = availableStockCount; }

    public long getLowStockCount() { return lowStockCount; }
    public void setLowStockCount(long lowStockCount) { this.lowStockCount = lowStockCount; }

    public long getOutOfStockCount() { return outOfStockCount; }
    public void setOutOfStockCount(long outOfStockCount) { this.outOfStockCount = outOfStockCount; }

    public long getTotalStockQuantity() { return totalStockQuantity; }
    public void setTotalStockQuantity(long totalStockQuantity) { this.totalStockQuantity = totalStockQuantity; }

    public long getExpiringSoonCount() { return expiringSoonCount; }
    public void setExpiringSoonCount(long expiringSoonCount) { this.expiringSoonCount = expiringSoonCount; }

    public long getExpiredCount() { return expiredCount; }
    public void setExpiredCount(long expiredCount) { this.expiredCount = expiredCount; }

    public long getTotalSuppliers() { return totalSuppliers; }
    public void setTotalSuppliers(long totalSuppliers) { this.totalSuppliers = totalSuppliers; }

    public long getPendingOrdersCount() { return pendingOrdersCount; }
    public void setPendingOrdersCount(long pendingOrdersCount) { this.pendingOrdersCount = pendingOrdersCount; }

    public BigDecimal getTotalInventoryValue() { return totalInventoryValue; }
    public void setTotalInventoryValue(BigDecimal totalInventoryValue) { this.totalInventoryValue = totalInventoryValue; }

    public long getUnreadNotificationsCount() { return unreadNotificationsCount; }
    public void setUnreadNotificationsCount(long unreadNotificationsCount) { this.unreadNotificationsCount = unreadNotificationsCount; }

    public long getPurchasesThisMonth() { return purchasesThisMonth; }
    public void setPurchasesThisMonth(long purchasesThisMonth) { this.purchasesThisMonth = purchasesThisMonth; }

    public BigDecimal getSpendThisMonth() { return spendThisMonth; }
    public void setSpendThisMonth(BigDecimal spendThisMonth) { this.spendThisMonth = spendThisMonth; }

    public List<StockLogDTO> getRecentActivities() { return recentActivities; }
    public void setRecentActivities(List<StockLogDTO> recentActivities) { this.recentActivities = recentActivities; }

    public static DashboardSummaryDTOBuilder builder() { return new DashboardSummaryDTOBuilder(); }

    public static class DashboardSummaryDTOBuilder {
        private long totalMedicines;
        private long availableStockCount;
        private long lowStockCount;
        private long outOfStockCount;
        private long totalStockQuantity;
        private long expiringSoonCount;
        private long expiredCount;
        private long totalSuppliers;
        private long pendingOrdersCount;
        private BigDecimal totalInventoryValue;
        private long unreadNotificationsCount;
        private long purchasesThisMonth;
        private BigDecimal spendThisMonth;
        private List<StockLogDTO> recentActivities;

        public DashboardSummaryDTOBuilder totalMedicines(long v) { this.totalMedicines = v; return this; }
        public DashboardSummaryDTOBuilder availableStockCount(long v) { this.availableStockCount = v; return this; }
        public DashboardSummaryDTOBuilder lowStockCount(long v) { this.lowStockCount = v; return this; }
        public DashboardSummaryDTOBuilder outOfStockCount(long v) { this.outOfStockCount = v; return this; }
        public DashboardSummaryDTOBuilder totalStockQuantity(long v) { this.totalStockQuantity = v; return this; }
        public DashboardSummaryDTOBuilder expiringSoonCount(long v) { this.expiringSoonCount = v; return this; }
        public DashboardSummaryDTOBuilder expiredCount(long v) { this.expiredCount = v; return this; }
        public DashboardSummaryDTOBuilder totalSuppliers(long v) { this.totalSuppliers = v; return this; }
        public DashboardSummaryDTOBuilder pendingOrdersCount(long v) { this.pendingOrdersCount = v; return this; }
        public DashboardSummaryDTOBuilder totalInventoryValue(BigDecimal v) { this.totalInventoryValue = v; return this; }
        public DashboardSummaryDTOBuilder unreadNotificationsCount(long v) { this.unreadNotificationsCount = v; return this; }
        public DashboardSummaryDTOBuilder purchasesThisMonth(long v) { this.purchasesThisMonth = v; return this; }
        public DashboardSummaryDTOBuilder spendThisMonth(BigDecimal v) { this.spendThisMonth = v; return this; }
        public DashboardSummaryDTOBuilder recentActivities(List<StockLogDTO> v) { this.recentActivities = v; return this; }

        public DashboardSummaryDTO build() {
            DashboardSummaryDTO dto = new DashboardSummaryDTO();
            dto.totalMedicines = this.totalMedicines;
            dto.availableStockCount = this.availableStockCount;
            dto.lowStockCount = this.lowStockCount;
            dto.outOfStockCount = this.outOfStockCount;
            dto.totalStockQuantity = this.totalStockQuantity;
            dto.expiringSoonCount = this.expiringSoonCount;
            dto.expiredCount = this.expiredCount;
            dto.totalSuppliers = this.totalSuppliers;
            dto.pendingOrdersCount = this.pendingOrdersCount;
            dto.totalInventoryValue = this.totalInventoryValue;
            dto.unreadNotificationsCount = this.unreadNotificationsCount;
            dto.purchasesThisMonth = this.purchasesThisMonth;
            dto.spendThisMonth = this.spendThisMonth;
            dto.recentActivities = this.recentActivities;
            return dto;
        }
    }
}
