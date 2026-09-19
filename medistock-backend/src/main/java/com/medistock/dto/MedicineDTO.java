package com.medistock.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class MedicineDTO {
    private Long id;

    @NotBlank(message = "Medicine code is required")
    private String medicineCode;

    @NotBlank(message = "Medicine name is required")
    private String medicineName;

    private String genericName;

    @NotBlank(message = "Category is required")
    private String category;

    private String manufacturer;

    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.0", message = "Unit price must be >= 0")
    private BigDecimal unitPrice;

    @NotNull(message = "Selling price is required")
    @DecimalMin(value = "0.0", message = "Selling price must be >= 0")
    private BigDecimal sellingPrice;

    private String batchNumber;
    private String description;
    private Long supplierId;
    private String supplierName;
    private Integer quantity;
    private Integer minimumStock;
    private Integer maximumStock;
    private LocalDateTime createdAt;

    public MedicineDTO() {}

    public MedicineDTO(Long id, String medicineCode, String medicineName, String genericName, String category, String manufacturer, BigDecimal unitPrice, BigDecimal sellingPrice, String batchNumber, String description, Long supplierId, String supplierName, LocalDateTime createdAt) {
        this.id = id;
        this.medicineCode = medicineCode;
        this.medicineName = medicineName;
        this.genericName = genericName;
        this.category = category;
        this.manufacturer = manufacturer;
        this.unitPrice = unitPrice;
        this.sellingPrice = sellingPrice;
        this.batchNumber = batchNumber;
        this.description = description;
        this.supplierId = supplierId;
        this.supplierName = supplierName;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMedicineCode() { return medicineCode; }
    public void setMedicineCode(String medicineCode) { this.medicineCode = medicineCode; }

    public String getMedicineName() { return medicineName; }
    public void setMedicineName(String medicineName) { this.medicineName = medicineName; }

    public String getGenericName() { return genericName; }
    public void setGenericName(String genericName) { this.genericName = genericName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getManufacturer() { return manufacturer; }
    public void setManufacturer(String manufacturer) { this.manufacturer = manufacturer; }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

    public BigDecimal getSellingPrice() { return sellingPrice; }
    public void setSellingPrice(BigDecimal sellingPrice) { this.sellingPrice = sellingPrice; }

    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }

    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Integer getMinimumStock() { return minimumStock; }
    public void setMinimumStock(Integer minimumStock) { this.minimumStock = minimumStock; }

    public Integer getMaximumStock() { return maximumStock; }
    public void setMaximumStock(Integer maximumStock) { this.maximumStock = maximumStock; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static MedicineDTOBuilder builder() { return new MedicineDTOBuilder(); }

    public static class MedicineDTOBuilder {
        private Long id;
        private String medicineCode;
        private String medicineName;
        private String genericName;
        private String category;
        private String manufacturer;
        private BigDecimal unitPrice;
        private BigDecimal sellingPrice;
        private String batchNumber;
        private String description;
        private Long supplierId;
        private String supplierName;
        private LocalDateTime createdAt;

        public MedicineDTOBuilder id(Long id) { this.id = id; return this; }
        public MedicineDTOBuilder medicineCode(String medicineCode) { this.medicineCode = medicineCode; return this; }
        public MedicineDTOBuilder medicineName(String medicineName) { this.medicineName = medicineName; return this; }
        public MedicineDTOBuilder genericName(String genericName) { this.genericName = genericName; return this; }
        public MedicineDTOBuilder category(String category) { this.category = category; return this; }
        public MedicineDTOBuilder manufacturer(String manufacturer) { this.manufacturer = manufacturer; return this; }
        public MedicineDTOBuilder unitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; return this; }
        public MedicineDTOBuilder sellingPrice(BigDecimal sellingPrice) { this.sellingPrice = sellingPrice; return this; }
        public MedicineDTOBuilder batchNumber(String batchNumber) { this.batchNumber = batchNumber; return this; }
        public MedicineDTOBuilder description(String description) { this.description = description; return this; }
        public MedicineDTOBuilder supplierId(Long supplierId) { this.supplierId = supplierId; return this; }
        public MedicineDTOBuilder supplierName(String supplierName) { this.supplierName = supplierName; return this; }
        public MedicineDTOBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public MedicineDTO build() {
            return new MedicineDTO(id, medicineCode, medicineName, genericName, category, manufacturer, unitPrice, sellingPrice, batchNumber, description, supplierId, supplierName, createdAt);
        }
    }
}
