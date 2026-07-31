package com.medicalinventory.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory")
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "medicine_id", nullable = false, unique = true)
    private Medicine medicine;

    @Column(nullable = false)
    private Integer quantity = 0;

    @Column(name = "min_quantity", nullable = false)
    private Integer minQuantity = 10;

    @Column(name = "batch_number", length = 50)
    private String batchNumber;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(length = 100)
    private String location;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Inventory() {}

    public Inventory(Long id, Medicine medicine, Integer quantity, Integer minQuantity, String batchNumber, LocalDate expiryDate, String location, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.medicine = medicine;
        this.quantity = quantity != null ? quantity : 0;
        this.minQuantity = minQuantity != null ? minQuantity : 10;
        this.batchNumber = batchNumber;
        this.expiryDate = expiryDate;
        this.location = location;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static InventoryBuilder builder() { return new InventoryBuilder(); }

    public static class InventoryBuilder {
        private Long id;
        private Medicine medicine;
        private Integer quantity = 0;
        private Integer minQuantity = 10;
        private String batchNumber;
        private LocalDate expiryDate;
        private String location;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public InventoryBuilder id(Long id) { this.id = id; return this; }
        public InventoryBuilder medicine(Medicine medicine) { this.medicine = medicine; return this; }
        public InventoryBuilder quantity(Integer quantity) { this.quantity = quantity; return this; }
        public InventoryBuilder minQuantity(Integer minQuantity) { this.minQuantity = minQuantity; return this; }
        public InventoryBuilder batchNumber(String batchNumber) { this.batchNumber = batchNumber; return this; }
        public InventoryBuilder expiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; return this; }
        public InventoryBuilder location(String location) { this.location = location; return this; }
        public InventoryBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public InventoryBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Inventory build() {
            return new Inventory(id, medicine, quantity, minQuantity, batchNumber, expiryDate, location, createdAt, updatedAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Medicine getMedicine() { return medicine; }
    public void setMedicine(Medicine medicine) { this.medicine = medicine; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public Integer getMinQuantity() { return minQuantity; }
    public void setMinQuantity(Integer minQuantity) { this.minQuantity = minQuantity; }
    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
