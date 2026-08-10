package com.medicalinventory.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "alert_type", nullable = false)
    private AlertType alertType;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertStatus status = AlertStatus.ACTIVE;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "acknowledged_by")
    private User acknowledgedBy;

    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public enum AlertType   { LOW_STOCK, EXPIRY_30_DAYS, EXPIRY_60_DAYS, EXPIRY_90_DAYS, OUT_OF_STOCK }
    public enum AlertStatus { ACTIVE, ACKNOWLEDGED, RESOLVED }

    public Alert() {}

    public Alert(Long id, AlertType alertType, Medicine medicine, String message, AlertStatus status, User acknowledgedBy, LocalDateTime acknowledgedAt, LocalDateTime resolvedAt, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.alertType = alertType;
        this.medicine = medicine;
        this.message = message;
        this.status = status != null ? status : AlertStatus.ACTIVE;
        this.acknowledgedBy = acknowledgedBy;
        this.acknowledgedAt = acknowledgedAt;
        this.resolvedAt = resolvedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static AlertBuilder builder() { return new AlertBuilder(); }

    public static class AlertBuilder {
        private Long id;
        private AlertType alertType;
        private Medicine medicine;
        private String message;
        private AlertStatus status = AlertStatus.ACTIVE;
        private User acknowledgedBy;
        private LocalDateTime acknowledgedAt;
        private LocalDateTime resolvedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public AlertBuilder id(Long id) { this.id = id; return this; }
        public AlertBuilder alertType(AlertType alertType) { this.alertType = alertType; return this; }
        public AlertBuilder medicine(Medicine medicine) { this.medicine = medicine; return this; }
        public AlertBuilder message(String message) { this.message = message; return this; }
        public AlertBuilder status(AlertStatus status) { this.status = status; return this; }
        public AlertBuilder acknowledgedBy(User acknowledgedBy) { this.acknowledgedBy = acknowledgedBy; return this; }
        public AlertBuilder acknowledgedAt(LocalDateTime acknowledgedAt) { this.acknowledgedAt = acknowledgedAt; return this; }
        public AlertBuilder resolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; return this; }
        public AlertBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public AlertBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Alert build() {
            return new Alert(id, alertType, medicine, message, status, acknowledgedBy, acknowledgedAt, resolvedAt, createdAt, updatedAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public AlertType getAlertType() { return alertType; }
    public void setAlertType(AlertType alertType) { this.alertType = alertType; }
    public Medicine getMedicine() { return medicine; }
    public void setMedicine(Medicine medicine) { this.medicine = medicine; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public AlertStatus getStatus() { return status; }
    public void setStatus(AlertStatus status) { this.status = status; }
    public User getAcknowledgedBy() { return acknowledgedBy; }
    public void setAcknowledgedBy(User acknowledgedBy) { this.acknowledgedBy = acknowledgedBy; }
    public LocalDateTime getAcknowledgedAt() { return acknowledgedAt; }
    public void setAcknowledgedAt(LocalDateTime acknowledgedAt) { this.acknowledgedAt = acknowledgedAt; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
