package com.medistock.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class InventoryDTO {
    private Long id;

    @NotNull(message = "Medicine ID is required")
    private Long medicineId;

    private String medicineCode;
    private String medicineName;
    private String category;
    private String manufacturer;
    private Long supplierId;
    private String supplierName;
    private String batchNumber;
    private String expiryDate;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity;

    @NotNull(message = "Minimum stock is required")
    @Min(value = 0, message = "Minimum stock cannot be negative")
    private Integer minimumStock;

    @NotNull(message = "Maximum stock is required")
    @Min(value = 0, message = "Maximum stock cannot be negative")
    private Integer maximumStock;

    private String location;
    private LocalDateTime lastUpdated;
    private Boolean isLowStock;

    public InventoryDTO() {}

    public InventoryDTO(Long id, Long medicineId, String medicineCode, String medicineName, String category,
                        String manufacturer, Long supplierId, String supplierName, String batchNumber,
                        String expiryDate, Integer quantity, Integer minimumStock, Integer maximumStock,
                        String location, LocalDateTime lastUpdated, Boolean isLowStock) {
        this.id = id;
        this.medicineId = medicineId;
        this.medicineCode = medicineCode;
        this.medicineName = medicineName;
        this.category = category;
        this.manufacturer = manufacturer;
        this.supplierId = supplierId;
        this.supplierName = supplierName;
        this.batchNumber = batchNumber;
        this.expiryDate = expiryDate;
        this.quantity = quantity;
        this.minimumStock = minimumStock;
        this.maximumStock = maximumStock;
        this.location = location;
        this.lastUpdated = lastUpdated;
        this.isLowStock = isLowStock;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getMedicineId() { return medicineId; }
    public void setMedicineId(Long medicineId) { this.medicineId = medicineId; }

    public String getMedicineCode() { return medicineCode; }
    public void setMedicineCode(String medicineCode) { this.medicineCode = medicineCode; }

    public String getMedicineName() { return medicineName; }
    public void setMedicineName(String medicineName) { this.medicineName = medicineName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getManufacturer() { return manufacturer; }
    public void setManufacturer(String manufacturer) { this.manufacturer = manufacturer; }

    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }

    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }

    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }

    public String getExpiryDate() { return expiryDate; }
    public void setExpiryDate(String expiryDate) { this.expiryDate = expiryDate; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    // Aliases for Frontend Compatibility
    public Integer getAvailableQty() { return quantity; }
    public void setAvailableQty(Integer availableQty) { this.quantity = availableQty; }

    public Integer getMinimumStock() { return minimumStock; }
    public void setMinimumStock(Integer minimumStock) { this.minimumStock = minimumStock; }

    public Integer getMinThreshold() { return minimumStock; }
    public void setMinThreshold(Integer minThreshold) { this.minimumStock = minThreshold; }

    public Integer getMaximumStock() { return maximumStock; }
    public void setMaximumStock(Integer maximumStock) { this.maximumStock = maximumStock; }

    public Integer getMaxThreshold() { return maximumStock; }
    public void setMaxThreshold(Integer maxThreshold) { this.maximumStock = maxThreshold; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getStorageLocation() { return location; }
    public void setStorageLocation(String storageLocation) { this.location = storageLocation; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }

    public Boolean getIsLowStock() { return isLowStock; }
    public void setIsLowStock(Boolean isLowStock) { this.isLowStock = isLowStock; }

    public String getStatus() {
        if (quantity == null || quantity == 0) return "Out of Stock";
        if (minimumStock != null && quantity <= minimumStock) return "Low Stock";
        return "In Stock";
    }

    public static InventoryDTOBuilder builder() { return new InventoryDTOBuilder(); }

    public static class InventoryDTOBuilder {
        private Long id;
        private Long medicineId;
        private String medicineCode;
        private String medicineName;
        private String category;
        private String manufacturer;
        private Long supplierId;
        private String supplierName;
        private String batchNumber;
        private String expiryDate;
        private Integer quantity;
        private Integer minimumStock;
        private Integer maximumStock;
        private String location;
        private LocalDateTime lastUpdated;
        private Boolean isLowStock;

        public InventoryDTOBuilder id(Long id) { this.id = id; return this; }
        public InventoryDTOBuilder medicineId(Long medicineId) { this.medicineId = medicineId; return this; }
        public InventoryDTOBuilder medicineCode(String medicineCode) { this.medicineCode = medicineCode; return this; }
        public InventoryDTOBuilder medicineName(String medicineName) { this.medicineName = medicineName; return this; }
        public InventoryDTOBuilder category(String category) { this.category = category; return this; }
        public InventoryDTOBuilder manufacturer(String manufacturer) { this.manufacturer = manufacturer; return this; }
        public InventoryDTOBuilder supplierId(Long supplierId) { this.supplierId = supplierId; return this; }
        public InventoryDTOBuilder supplierName(String supplierName) { this.supplierName = supplierName; return this; }
        public InventoryDTOBuilder batchNumber(String batchNumber) { this.batchNumber = batchNumber; return this; }
        public InventoryDTOBuilder expiryDate(String expiryDate) { this.expiryDate = expiryDate; return this; }
        public InventoryDTOBuilder quantity(Integer quantity) { this.quantity = quantity; return this; }
        public InventoryDTOBuilder minimumStock(Integer minimumStock) { this.minimumStock = minimumStock; return this; }
        public InventoryDTOBuilder maximumStock(Integer maximumStock) { this.maximumStock = maximumStock; return this; }
        public InventoryDTOBuilder location(String location) { this.location = location; return this; }
        public InventoryDTOBuilder lastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; return this; }
        public InventoryDTOBuilder isLowStock(Boolean isLowStock) { this.isLowStock = isLowStock; return this; }

        public InventoryDTO build() {
            return new InventoryDTO(id, medicineId, medicineCode, medicineName, category, manufacturer,
                    supplierId, supplierName, batchNumber, expiryDate, quantity, minimumStock, maximumStock,
                    location, lastUpdated, isLowStock);
        }
    }
}
