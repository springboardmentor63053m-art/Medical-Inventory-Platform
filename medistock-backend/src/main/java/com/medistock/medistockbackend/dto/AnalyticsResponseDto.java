package com.medistock.medistockbackend.dto;

import com.medistock.medistockbackend.entity.Medicine;
import com.medistock.medistockbackend.entity.ExpiryTracking;
import java.util.List;

public class AnalyticsResponseDto {
    private long totalMedicines;
    private long totalStock;
    private int lowStockCount;
    private int outOfStockCount;
    private int expiringCount;
    private double inventoryValue;
    private long totalSuppliers;
    private List<Medicine> lowStockItems;
    private List<Medicine> outOfStockItems;
    private List<ExpiryTracking> expiringItems;

    public AnalyticsResponseDto() {
    }

    public AnalyticsResponseDto(long totalMedicines, long totalStock, int lowStockCount, int outOfStockCount,
                                int expiringCount, double inventoryValue, long totalSuppliers,
                                List<Medicine> lowStockItems, List<Medicine> outOfStockItems,
                                List<ExpiryTracking> expiringItems) {
        this.totalMedicines = totalMedicines;
        this.totalStock = totalStock;
        this.lowStockCount = lowStockCount;
        this.outOfStockCount = outOfStockCount;
        this.expiringCount = expiringCount;
        this.inventoryValue = inventoryValue;
        this.totalSuppliers = totalSuppliers;
        this.lowStockItems = lowStockItems;
        this.outOfStockItems = outOfStockItems;
        this.expiringItems = expiringItems;
    }

    public long getTotalMedicines() {
        return totalMedicines;
    }

    public void setTotalMedicines(long totalMedicines) {
        this.totalMedicines = totalMedicines;
    }

    public long getTotalStock() {
        return totalStock;
    }

    public void setTotalStock(long totalStock) {
        this.totalStock = totalStock;
    }

    public int getLowStockCount() {
        return lowStockCount;
    }

    public void setLowStockCount(int lowStockCount) {
        this.lowStockCount = lowStockCount;
    }

    public int getOutOfStockCount() {
        return outOfStockCount;
    }

    public void setOutOfStockCount(int outOfStockCount) {
        this.outOfStockCount = outOfStockCount;
    }

    public int getExpiringCount() {
        return expiringCount;
    }

    public void setExpiringCount(int expiringCount) {
        this.expiringCount = expiringCount;
    }

    public double getInventoryValue() {
        return inventoryValue;
    }

    public void setInventoryValue(double inventoryValue) {
        this.inventoryValue = inventoryValue;
    }

    public long getTotalSuppliers() {
        return totalSuppliers;
    }

    public void setTotalSuppliers(long totalSuppliers) {
        this.totalSuppliers = totalSuppliers;
    }

    public List<Medicine> getLowStockItems() {
        return lowStockItems;
    }

    public void setLowStockItems(List<Medicine> lowStockItems) {
        this.lowStockItems = lowStockItems;
    }

    public List<Medicine> getOutOfStockItems() {
        return outOfStockItems;
    }

    public void setOutOfStockItems(List<Medicine> outOfStockItems) {
        this.outOfStockItems = outOfStockItems;
    }

    public List<ExpiryTracking> getExpiringItems() {
        return expiringItems;
    }

    public void setExpiringItems(List<ExpiryTracking> expiringItems) {
        this.expiringItems = expiringItems;
    }
}
