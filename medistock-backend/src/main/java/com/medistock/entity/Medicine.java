package com.medistock.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "medicines")
public class Medicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "medicine_code", unique = true, length = 50)
    private String medicineCode;

    @Column(name = "medicine_name", length = 200)
    private String medicineName;

    @Column(name = "name", length = 200)
    private String name;

    @Column(name = "generic_name", length = 200)
    private String genericName;

    @Column(length = 100)
    private String category;

    @Column(length = 200)
    private String manufacturer;

    @Column(length = 200)
    private String brand;

    @Column(name = "unit_price", precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "selling_price", precision = 12, scale = 2)
    private BigDecimal sellingPrice;

    @Column(name = "batch_number", length = 100)
    private String batchNumber;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Medicine() {}

    public Medicine(Long id, String medicineCode, String medicineName, String genericName, String category, String manufacturer, String brand, BigDecimal unitPrice, BigDecimal sellingPrice, String batchNumber, String description, Supplier supplier, LocalDateTime createdAt) {
        this.id = id;
        this.medicineCode = medicineCode;
        this.medicineName = medicineName;
        this.genericName = genericName;
        this.category = category;
        this.manufacturer = manufacturer;
        this.brand = brand;
        this.unitPrice = unitPrice != null ? unitPrice : BigDecimal.ZERO;
        this.sellingPrice = sellingPrice != null ? sellingPrice : BigDecimal.ZERO;
        this.batchNumber = batchNumber;
        this.description = description;
        this.supplier = supplier;
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.unitPrice == null) this.unitPrice = BigDecimal.ZERO;
        if (this.sellingPrice == null) this.sellingPrice = BigDecimal.ZERO;
        if (this.brand == null) this.brand = this.manufacturer != null ? this.manufacturer : "Generic";
        if (this.name == null) this.name = this.medicineName;
        if (this.medicineName == null) this.medicineName = this.name;
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

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

    public BigDecimal getSellingPrice() { return sellingPrice; }
    public void setSellingPrice(BigDecimal sellingPrice) { this.sellingPrice = sellingPrice; }

    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static MedicineBuilder builder() { return new MedicineBuilder(); }

    public static class MedicineBuilder {
        private Long id;
        private String medicineCode;
        private String medicineName;
        private String genericName;
        private String category;
        private String manufacturer;
        private String brand;
        private BigDecimal unitPrice;
        private BigDecimal sellingPrice;
        private String batchNumber;
        private String description;
        private Supplier supplier;
        private LocalDateTime createdAt;

        public MedicineBuilder id(Long id) { this.id = id; return this; }
        public MedicineBuilder medicineCode(String medicineCode) { this.medicineCode = medicineCode; return this; }
        public MedicineBuilder medicineName(String medicineName) { this.medicineName = medicineName; return this; }
        public MedicineBuilder genericName(String genericName) { this.genericName = genericName; return this; }
        public MedicineBuilder category(String category) { this.category = category; return this; }
        public MedicineBuilder manufacturer(String manufacturer) { this.manufacturer = manufacturer; return this; }
        public MedicineBuilder brand(String brand) { this.brand = brand; return this; }
        public MedicineBuilder unitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; return this; }
        public MedicineBuilder sellingPrice(BigDecimal sellingPrice) { this.sellingPrice = sellingPrice; return this; }
        public MedicineBuilder batchNumber(String batchNumber) { this.batchNumber = batchNumber; return this; }
        public MedicineBuilder description(String description) { this.description = description; return this; }
        public MedicineBuilder supplier(Supplier supplier) { this.supplier = supplier; return this; }
        public MedicineBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Medicine build() {
            return new Medicine(id, medicineCode, medicineName, genericName, category, manufacturer, brand, unitPrice, sellingPrice, batchNumber, description, supplier, createdAt);
        }
    }
}
