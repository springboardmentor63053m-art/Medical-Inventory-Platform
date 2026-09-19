package com.medistock.entity;

import com.medistock.enums.ExpiryStatus;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "expiry_tracking")
public class ExpiryTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "batch_number", length = 100)
    private String batchNumber;

    @Column(nullable = false)
    private Integer quantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ExpiryStatus status;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public ExpiryTracking() {}

    public ExpiryTracking(Long id, Medicine medicine, LocalDate expiryDate, String batchNumber, Integer quantity, ExpiryStatus status, LocalDateTime createdAt) {
        this.id = id;
        this.medicine = medicine;
        this.expiryDate = expiryDate;
        this.batchNumber = batchNumber;
        this.quantity = quantity;
        this.status = status;
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.quantity == null) this.quantity = 0;
        if (this.status == null) this.status = ExpiryStatus.ACTIVE;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Medicine getMedicine() { return medicine; }
    public void setMedicine(Medicine medicine) { this.medicine = medicine; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public ExpiryStatus getStatus() { return status; }
    public void setStatus(ExpiryStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static ExpiryTrackingBuilder builder() { return new ExpiryTrackingBuilder(); }

    public static class ExpiryTrackingBuilder {
        private Long id;
        private Medicine medicine;
        private LocalDate expiryDate;
        private String batchNumber;
        private Integer quantity;
        private ExpiryStatus status;
        private LocalDateTime createdAt;

        public ExpiryTrackingBuilder id(Long id) { this.id = id; return this; }
        public ExpiryTrackingBuilder medicine(Medicine medicine) { this.medicine = medicine; return this; }
        public ExpiryTrackingBuilder expiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; return this; }
        public ExpiryTrackingBuilder batchNumber(String batchNumber) { this.batchNumber = batchNumber; return this; }
        public ExpiryTrackingBuilder quantity(Integer quantity) { this.quantity = quantity; return this; }
        public ExpiryTrackingBuilder status(ExpiryStatus status) { this.status = status; return this; }
        public ExpiryTrackingBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public ExpiryTracking build() {
            return new ExpiryTracking(id, medicine, expiryDate, batchNumber, quantity, status, createdAt);
        }
    }
}
