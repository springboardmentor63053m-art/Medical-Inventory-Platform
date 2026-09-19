package com.medistock.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class AnalyticsDTO {

    public static class InventoryAnalytics {
        private long totalMedicines;
        private long totalStockQuantity;
        private long availableStock;
        private long lowStock;
        private long outOfStock;
        private BigDecimal inventoryValue;

        public InventoryAnalytics() {}
        public InventoryAnalytics(long totalMedicines, long totalStockQuantity, long availableStock, long lowStock, long outOfStock, BigDecimal inventoryValue) {
            this.totalMedicines = totalMedicines;
            this.totalStockQuantity = totalStockQuantity;
            this.availableStock = availableStock;
            this.lowStock = lowStock;
            this.outOfStock = outOfStock;
            this.inventoryValue = inventoryValue;
        }

        public long getTotalMedicines() { return totalMedicines; }
        public void setTotalMedicines(long totalMedicines) { this.totalMedicines = totalMedicines; }
        public long getTotalStockQuantity() { return totalStockQuantity; }
        public void setTotalStockQuantity(long totalStockQuantity) { this.totalStockQuantity = totalStockQuantity; }
        public long getAvailableStock() { return availableStock; }
        public void setAvailableStock(long availableStock) { this.availableStock = availableStock; }
        public long getLowStock() { return lowStock; }
        public void setLowStock(long lowStock) { this.lowStock = lowStock; }
        public long getOutOfStock() { return outOfStock; }
        public void setOutOfStock(long outOfStock) { this.outOfStock = outOfStock; }
        public BigDecimal getInventoryValue() { return inventoryValue; }
        public void setInventoryValue(BigDecimal inventoryValue) { this.inventoryValue = inventoryValue; }
    }

    public static class ExpiryAnalytics {
        private long expiredMedicines;
        private long expiringSoon;
        private long activeMedicines;
        private long expiredStockQuantity;
        private long expiringStockQuantity;

        public ExpiryAnalytics() {}
        public ExpiryAnalytics(long expiredMedicines, long expiringSoon, long activeMedicines, long expiredStockQuantity, long expiringStockQuantity) {
            this.expiredMedicines = expiredMedicines;
            this.expiringSoon = expiringSoon;
            this.activeMedicines = activeMedicines;
            this.expiredStockQuantity = expiredStockQuantity;
            this.expiringStockQuantity = expiringStockQuantity;
        }

        public long getExpiredMedicines() { return expiredMedicines; }
        public void setExpiredMedicines(long expiredMedicines) { this.expiredMedicines = expiredMedicines; }
        public long getExpiringSoon() { return expiringSoon; }
        public void setExpiringSoon(long expiringSoon) { this.expiringSoon = expiringSoon; }
        public long getActiveMedicines() { return activeMedicines; }
        public void setActiveMedicines(long activeMedicines) { this.activeMedicines = activeMedicines; }
        public long getExpiredStockQuantity() { return expiredStockQuantity; }
        public void setExpiredStockQuantity(long expiredStockQuantity) { this.expiredStockQuantity = expiredStockQuantity; }
        public long getExpiringStockQuantity() { return expiringStockQuantity; }
        public void setExpiringStockQuantity(long expiringStockQuantity) { this.expiringStockQuantity = expiringStockQuantity; }
    }

    public static class SupplierAnalytics {
        private long totalSuppliers;
        private List<SupplierStat> supplierStats;

        public SupplierAnalytics() {}
        public SupplierAnalytics(long totalSuppliers, List<SupplierStat> supplierStats) {
            this.totalSuppliers = totalSuppliers;
            this.supplierStats = supplierStats;
        }

        public long getTotalSuppliers() { return totalSuppliers; }
        public void setTotalSuppliers(long totalSuppliers) { this.totalSuppliers = totalSuppliers; }
        public List<SupplierStat> getSupplierStats() { return supplierStats; }
        public void setSupplierStats(List<SupplierStat> supplierStats) { this.supplierStats = supplierStats; }
    }

    public static class SupplierStat {
        private Long supplierId;
        private String supplierName;
        private long medicineCount;
        private long totalStock;

        public SupplierStat() {}
        public SupplierStat(Long supplierId, String supplierName, long medicineCount, long totalStock) {
            this.supplierId = supplierId;
            this.supplierName = supplierName;
            this.medicineCount = medicineCount;
            this.totalStock = totalStock;
        }

        public Long getSupplierId() { return supplierId; }
        public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }
        public String getSupplierName() { return supplierName; }
        public void setSupplierName(String supplierName) { this.supplierName = supplierName; }
        public long getMedicineCount() { return medicineCount; }
        public void setMedicineCount(long medicineCount) { this.medicineCount = medicineCount; }
        public long getTotalStock() { return totalStock; }
        public void setTotalStock(long totalStock) { this.totalStock = totalStock; }
    }

    public static class StockMovementAnalytics {
        private long stockIn;
        private long stockOut;
        private long adjustments;
        private long returns;

        public StockMovementAnalytics() {}
        public StockMovementAnalytics(long stockIn, long stockOut, long adjustments, long returns) {
            this.stockIn = stockIn;
            this.stockOut = stockOut;
            this.adjustments = adjustments;
            this.returns = returns;
        }

        public long getStockIn() { return stockIn; }
        public void setStockIn(long stockIn) { this.stockIn = stockIn; }
        public long getStockOut() { return stockOut; }
        public void setStockOut(long stockOut) { this.stockOut = stockOut; }
        public long getAdjustments() { return adjustments; }
        public void setAdjustments(long adjustments) { this.adjustments = adjustments; }
        public long getReturns() { return returns; }
        public void setReturns(long returns) { this.returns = returns; }
    }

    public static class PurchaseAnalytics {
        private long totalPurchases;
        private long purchasesThisMonth;
        private BigDecimal monthlyPurchaseSpending;

        public PurchaseAnalytics() {}
        public PurchaseAnalytics(long totalPurchases, long purchasesThisMonth, BigDecimal monthlyPurchaseSpending) {
            this.totalPurchases = totalPurchases;
            this.purchasesThisMonth = purchasesThisMonth;
            this.monthlyPurchaseSpending = monthlyPurchaseSpending;
        }

        public long getTotalPurchases() { return totalPurchases; }
        public void setTotalPurchases(long totalPurchases) { this.totalPurchases = totalPurchases; }
        public long getPurchasesThisMonth() { return purchasesThisMonth; }
        public void setPurchasesThisMonth(long purchasesThisMonth) { this.purchasesThisMonth = purchasesThisMonth; }
        public BigDecimal getMonthlyPurchaseSpending() { return monthlyPurchaseSpending; }
        public void setMonthlyPurchaseSpending(BigDecimal monthlyPurchaseSpending) { this.monthlyPurchaseSpending = monthlyPurchaseSpending; }
    }

    public static class DashboardAnalytics {
        private InventoryAnalytics inventory;
        private ExpiryAnalytics expiry;
        private SupplierAnalytics suppliers;
        private StockMovementAnalytics stockMovement;
        private PurchaseAnalytics purchases;

        public DashboardAnalytics() {}
        public DashboardAnalytics(InventoryAnalytics inventory, ExpiryAnalytics expiry, SupplierAnalytics suppliers, StockMovementAnalytics stockMovement, PurchaseAnalytics purchases) {
            this.inventory = inventory;
            this.expiry = expiry;
            this.suppliers = suppliers;
            this.stockMovement = stockMovement;
            this.purchases = purchases;
        }

        public InventoryAnalytics getInventory() { return inventory; }
        public void setInventory(InventoryAnalytics inventory) { this.inventory = inventory; }
        public ExpiryAnalytics getExpiry() { return expiry; }
        public void setExpiry(ExpiryAnalytics expiry) { this.expiry = expiry; }
        public SupplierAnalytics getSuppliers() { return suppliers; }
        public void setSuppliers(SupplierAnalytics suppliers) { this.suppliers = suppliers; }
        public StockMovementAnalytics getStockMovement() { return stockMovement; }
        public void setStockMovement(StockMovementAnalytics stockMovement) { this.stockMovement = stockMovement; }
        public PurchaseAnalytics getPurchases() { return purchases; }
        public void setPurchases(PurchaseAnalytics purchases) { this.purchases = purchases; }
    }
}
