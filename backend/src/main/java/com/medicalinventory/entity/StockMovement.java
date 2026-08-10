package com.medicalinventory.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "stock_movements")
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @Enumerated(EnumType.STRING)
    @Column(name = "movement_type", nullable = false)
    private MovementType movementType;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "quantity_before", nullable = false)
    private Integer quantityBefore;

    @Column(name = "quantity_after", nullable = false)
    private Integer quantityAfter;

    @Column(name = "reference_type", length = 50)
    private String referenceType;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "performed_by", nullable = false)
    private User performedBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum MovementType { PURCHASE_IN, SALE_OUT, ADJUSTMENT_IN, ADJUSTMENT_OUT, EXPIRED_REMOVAL }

    public StockMovement() {}

    public StockMovement(Long id, Medicine medicine, MovementType movementType, Integer quantity, Integer quantityBefore, Integer quantityAfter, String referenceType, Long referenceId, String reason, User performedBy, LocalDateTime createdAt) {
        this.id = id;
        this.medicine = medicine;
        this.movementType = movementType;
        this.quantity = quantity;
        this.quantityBefore = quantityBefore;
        this.quantityAfter = quantityAfter;
        this.referenceType = referenceType;
        this.referenceId = referenceId;
        this.reason = reason;
        this.performedBy = performedBy;
        this.createdAt = createdAt;
    }

    public static StockMovementBuilder builder() { return new StockMovementBuilder(); }

    public static class StockMovementBuilder {
        private Long id;
        private Medicine medicine;
        private MovementType movementType;
        private Integer quantity;
        private Integer quantityBefore;
        private Integer quantityAfter;
        private String referenceType;
        private Long referenceId;
        private String reason;
        private User performedBy;
        private LocalDateTime createdAt;

        public StockMovementBuilder id(Long id) { this.id = id; return this; }
        public StockMovementBuilder medicine(Medicine medicine) { this.medicine = medicine; return this; }
        public StockMovementBuilder movementType(MovementType movementType) { this.movementType = movementType; return this; }
        public StockMovementBuilder quantity(Integer quantity) { this.quantity = quantity; return this; }
        public StockMovementBuilder quantityBefore(Integer quantityBefore) { this.quantityBefore = quantityBefore; return this; }
        public StockMovementBuilder quantityAfter(Integer quantityAfter) { this.quantityAfter = quantityAfter; return this; }
        public StockMovementBuilder referenceType(String referenceType) { this.referenceType = referenceType; return this; }
        public StockMovementBuilder referenceId(Long referenceId) { this.referenceId = referenceId; return this; }
        public StockMovementBuilder reason(String reason) { this.reason = reason; return this; }
        public StockMovementBuilder performedBy(User performedBy) { this.performedBy = performedBy; return this; }
        public StockMovementBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public StockMovement build() {
            return new StockMovement(id, medicine, movementType, quantity, quantityBefore, quantityAfter, referenceType, referenceId, reason, performedBy, createdAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Medicine getMedicine() { return medicine; }
    public void setMedicine(Medicine medicine) { this.medicine = medicine; }
    public MovementType getMovementType() { return movementType; }
    public void setMovementType(MovementType movementType) { this.movementType = movementType; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public Integer getQuantityBefore() { return quantityBefore; }
    public void setQuantityBefore(Integer quantityBefore) { this.quantityBefore = quantityBefore; }
    public Integer getQuantityAfter() { return quantityAfter; }
    public void setQuantityAfter(Integer quantityAfter) { this.quantityAfter = quantityAfter; }
    public String getReferenceType() { return referenceType; }
    public void setReferenceType(String referenceType) { this.referenceType = referenceType; }
    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public User getPerformedBy() { return performedBy; }
    public void setPerformedBy(User performedBy) { this.performedBy = performedBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
