package com.medicalinventory.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "medicines")
public class Medicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "generic_name", length = 150)
    private String genericName;

    @Column(name = "brand_name", length = 100)
    private String brandName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(nullable = false, length = 50)
    private String unit = "Tablets";

    @Column(name = "hsn_code", length = 20)
    private String hsnCode;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal mrp;

    @Column(name = "reorder_level", nullable = false)
    private Integer reorderLevel = 10;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MedicineStatus status = MedicineStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public enum MedicineStatus { ACTIVE, DISCONTINUED, OUT_OF_STOCK }

    public Medicine() {}

    public Medicine(Long id, String name, String genericName, String brandName, Category category, Supplier supplier, String unit, String hsnCode, String description, BigDecimal unitPrice, BigDecimal mrp, Integer reorderLevel, MedicineStatus status, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.genericName = genericName;
        this.brandName = brandName;
        this.category = category;
        this.supplier = supplier;
        this.unit = unit != null ? unit : "Tablets";
        this.hsnCode = hsnCode;
        this.description = description;
        this.unitPrice = unitPrice;
        this.mrp = mrp;
        this.reorderLevel = reorderLevel != null ? reorderLevel : 10;
        this.status = status != null ? status : MedicineStatus.ACTIVE;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static MedicineBuilder builder() { return new MedicineBuilder(); }

    public static class MedicineBuilder {
        private Long id;
        private String name;
        private String genericName;
        private String brandName;
        private Category category;
        private Supplier supplier;
        private String unit = "Tablets";
        private String hsnCode;
        private String description;
        private BigDecimal unitPrice;
        private BigDecimal mrp;
        private Integer reorderLevel = 10;
        private MedicineStatus status = MedicineStatus.ACTIVE;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public MedicineBuilder id(Long id) { this.id = id; return this; }
        public MedicineBuilder name(String name) { this.name = name; return this; }
        public MedicineBuilder genericName(String genericName) { this.genericName = genericName; return this; }
        public MedicineBuilder brandName(String brandName) { this.brandName = brandName; return this; }
        public MedicineBuilder category(Category category) { this.category = category; return this; }
        public MedicineBuilder supplier(Supplier supplier) { this.supplier = supplier; return this; }
        public MedicineBuilder unit(String unit) { this.unit = unit; return this; }
        public MedicineBuilder hsnCode(String hsnCode) { this.hsnCode = hsnCode; return this; }
        public MedicineBuilder description(String description) { this.description = description; return this; }
        public MedicineBuilder unitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; return this; }
        public MedicineBuilder mrp(BigDecimal mrp) { this.mrp = mrp; return this; }
        public MedicineBuilder reorderLevel(Integer reorderLevel) { this.reorderLevel = reorderLevel; return this; }
        public MedicineBuilder status(MedicineStatus status) { this.status = status; return this; }
        public MedicineBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public MedicineBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Medicine build() {
            return new Medicine(id, name, genericName, brandName, category, supplier, unit, hsnCode, description, unitPrice, mrp, reorderLevel, status, createdAt, updatedAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getGenericName() { return genericName; }
    public void setGenericName(String genericName) { this.genericName = genericName; }
    public String getBrandName() { return brandName; }
    public void setBrandName(String brandName) { this.brandName = brandName; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public String getHsnCode() { return hsnCode; }
    public void setHsnCode(String hsnCode) { this.hsnCode = hsnCode; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public BigDecimal getMrp() { return mrp; }
    public void setMrp(BigDecimal mrp) { this.mrp = mrp; }
    public Integer getReorderLevel() { return reorderLevel; }
    public void setReorderLevel(Integer reorderLevel) { this.reorderLevel = reorderLevel; }
    public MedicineStatus getStatus() { return status; }
    public void setStatus(MedicineStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
