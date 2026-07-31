package com.medicalinventory.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "purchase_items")
public class PurchaseItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_id", nullable = false)
    @JsonIgnore
    private Purchase purchase;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @Column(name = "batch_number", length = 50)
    private String batchNumber;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitCost;

    @Column(name = "total_cost", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalCost;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    public PurchaseItem() {}

    public PurchaseItem(Long id, Purchase purchase, Medicine medicine, String batchNumber, Integer quantity, BigDecimal unitCost, BigDecimal totalCost, LocalDate expiryDate) {
        this.id = id;
        this.purchase = purchase;
        this.medicine = medicine;
        this.batchNumber = batchNumber;
        this.quantity = quantity;
        this.unitCost = unitCost;
        this.totalCost = totalCost;
        this.expiryDate = expiryDate;
    }

    public static PurchaseItemBuilder builder() { return new PurchaseItemBuilder(); }

    public static class PurchaseItemBuilder {
        private Long id;
        private Purchase purchase;
        private Medicine medicine;
        private String batchNumber;
        private Integer quantity;
        private BigDecimal unitCost;
        private BigDecimal totalCost;
        private LocalDate expiryDate;

        public PurchaseItemBuilder id(Long id) { this.id = id; return this; }
        public PurchaseItemBuilder purchase(Purchase purchase) { this.purchase = purchase; return this; }
        public PurchaseItemBuilder medicine(Medicine medicine) { this.medicine = medicine; return this; }
        public PurchaseItemBuilder batchNumber(String batchNumber) { this.batchNumber = batchNumber; return this; }
        public PurchaseItemBuilder quantity(Integer quantity) { this.quantity = quantity; return this; }
        public PurchaseItemBuilder unitCost(BigDecimal unitCost) { this.unitCost = unitCost; return this; }
        public PurchaseItemBuilder totalCost(BigDecimal totalCost) { this.totalCost = totalCost; return this; }
        public PurchaseItemBuilder expiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; return this; }

        public PurchaseItem build() {
            return new PurchaseItem(id, purchase, medicine, batchNumber, quantity, unitCost, totalCost, expiryDate);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Purchase getPurchase() { return purchase; }
    public void setPurchase(Purchase purchase) { this.purchase = purchase; }
    public Medicine getMedicine() { return medicine; }
    public void setMedicine(Medicine medicine) { this.medicine = medicine; }
    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public BigDecimal getUnitCost() { return unitCost; }
    public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost; }
    public BigDecimal getTotalCost() { return totalCost; }
    public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
}
