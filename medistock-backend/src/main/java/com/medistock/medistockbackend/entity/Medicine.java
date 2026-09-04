package com.medistock.medistockbackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "medicines")
public class Medicine {

    // ============================================================
    // PRIMARY KEY
    // ============================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // ============================================================
    // BASIC MEDICINE INFORMATION
    // ============================================================

    @Column(nullable = false)
    private String name;

    private String description;

    private String category;

    @Column(nullable = false)
    private Double price;


    // ============================================================
    // INVENTORY / STOCK INFORMATION
    // ============================================================

    @Column(name = "stock_quantity")
    private Integer stockQuantity;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;


    // ============================================================
    // MEDICINE USAGE INFORMATION
    // ============================================================

    private String dosage;

    @Column(name = "age_group")
    private String ageGroup;


    // ============================================================
    // SAFETY / PRESCRIPTION INFORMATION
    // ============================================================

    @Column(name = "pregnancy_safe")
    private Boolean pregnancySafe;

    @Column(name = "prescription_required")
    private Boolean prescriptionRequired;


    // ============================================================
    // INSTRUCTIONS / WARNINGS
    // ============================================================

    @Column(name = "usage_instructions")
    private String usageInstructions;

    @Column(columnDefinition = "TEXT")
    private String warnings;


    // ============================================================
    // SUPPLIER
    // ============================================================

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;


    // ============================================================
    // RELATIONSHIPS
    // ============================================================

    @JsonIgnore
    @OneToMany(
        mappedBy = "medicine",
        cascade = CascadeType.ALL
    )
    private List<Inventory> inventories;

    @JsonIgnore
    @OneToMany(
        mappedBy = "medicine",
        cascade = CascadeType.ALL
    )
    private List<StockLog> stockLogs;

    @JsonIgnore
    @OneToMany(
        mappedBy = "medicine",
        cascade = CascadeType.ALL
    )
    private List<PurchaseOrderItem> purchaseOrderItems;


    // ============================================================
    // DEFAULT CONSTRUCTOR
    // ============================================================

    public Medicine() {
    }


    // ============================================================
    // GETTERS
    // ============================================================

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getCategory() {
        return category;
    }

    public Double getPrice() {
        return price;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public String getDosage() {
        return dosage;
    }

    public String getAgeGroup() {
        return ageGroup;
    }

    public Boolean getPregnancySafe() {
        return pregnancySafe;
    }

    public Boolean getPrescriptionRequired() {
        return prescriptionRequired;
    }

    public String getUsageInstructions() {
        return usageInstructions;
    }

    public String getWarnings() {
        return warnings;
    }

    public Supplier getSupplier() {
        return supplier;
    }

    public List<Inventory> getInventories() {
        return inventories;
    }

    public List<StockLog> getStockLogs() {
        return stockLogs;
    }

    public List<PurchaseOrderItem> getPurchaseOrderItems() {
        return purchaseOrderItems;
    }


    // ============================================================
    // SETTERS
    // ============================================================

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public void setDosage(String dosage) {
        this.dosage = dosage;
    }

    public void setAgeGroup(String ageGroup) {
        this.ageGroup = ageGroup;
    }

    public void setPregnancySafe(Boolean pregnancySafe) {
        this.pregnancySafe = pregnancySafe;
    }

    public void setPrescriptionRequired(Boolean prescriptionRequired) {
        this.prescriptionRequired = prescriptionRequired;
    }

    public void setUsageInstructions(String usageInstructions) {
        this.usageInstructions = usageInstructions;
    }

    public void setWarnings(String warnings) {
        this.warnings = warnings;
    }

    public void setSupplier(Supplier supplier) {
        this.supplier = supplier;
    }

    public void setInventories(List<Inventory> inventories) {
        this.inventories = inventories;
    }

    public void setStockLogs(List<StockLog> stockLogs) {
        this.stockLogs = stockLogs;
    }

    public void setPurchaseOrderItems(
        List<PurchaseOrderItem> purchaseOrderItems
    ) {
        this.purchaseOrderItems = purchaseOrderItems;
    }
}