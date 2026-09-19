package com.medistock.dto;

import com.medistock.enums.ExpiryStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ExpiryTrackingDTO {
    private Long id;

    @NotNull(message = "Medicine ID is required")
    private Long medicineId;

    private String medicineCode;
    private String medicineName;

    @NotNull(message = "Expiry date is required")
    private LocalDate expiryDate;

    private String batchNumber;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity;

    private ExpiryStatus status;
    private LocalDateTime createdAt;

    public ExpiryTrackingDTO() {}

    public ExpiryTrackingDTO(Long id, Long medicineId, String medicineCode, String medicineName, LocalDate expiryDate, String batchNumber, Integer quantity, ExpiryStatus status, LocalDateTime createdAt) {
        this.id = id;
        this.medicineId = medicineId;
        this.medicineCode = medicineCode;
        this.medicineName = medicineName;
        this.expiryDate = expiryDate;
        this.batchNumber = batchNumber;
        this.quantity = quantity;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getMedicineId() { return medicineId; }
    public void setMedicineId(Long medicineId) { this.medicineId = medicineId; }

    public String getMedicineCode() { return medicineCode; }
    public void setMedicineCode(String medicineCode) { this.medicineCode = medicineCode; }

    public String getMedicineName() { return medicineName; }
    public void setMedicineName(String medicineName) { this.medicineName = medicineName; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public ExpiryStatus getStatus() { return status; }
    public void setStatus(ExpiryStatus status) { this.status = status; }

    public Long getDaysRemaining() {
        if (expiryDate == null) return null;
        return java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), expiryDate);
    }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static ExpiryTrackingDTOBuilder builder() { return new ExpiryTrackingDTOBuilder(); }

    public static class ExpiryTrackingDTOBuilder {
        private Long id;
        private Long medicineId;
        private String medicineCode;
        private String medicineName;
        private LocalDate expiryDate;
        private String batchNumber;
        private Integer quantity;
        private ExpiryStatus status;
        private LocalDateTime createdAt;

        public ExpiryTrackingDTOBuilder id(Long id) { this.id = id; return this; }
        public ExpiryTrackingDTOBuilder medicineId(Long medicineId) { this.medicineId = medicineId; return this; }
        public ExpiryTrackingDTOBuilder medicineCode(String medicineCode) { this.medicineCode = medicineCode; return this; }
        public ExpiryTrackingDTOBuilder medicineName(String medicineName) { this.medicineName = medicineName; return this; }
        public ExpiryTrackingDTOBuilder expiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; return this; }
        public ExpiryTrackingDTOBuilder batchNumber(String batchNumber) { this.batchNumber = batchNumber; return this; }
        public ExpiryTrackingDTOBuilder quantity(Integer quantity) { this.quantity = quantity; return this; }
        public ExpiryTrackingDTOBuilder status(ExpiryStatus status) { this.status = status; return this; }
        public ExpiryTrackingDTOBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public ExpiryTrackingDTO build() {
            return new ExpiryTrackingDTO(id, medicineId, medicineCode, medicineName, expiryDate, batchNumber, quantity, status, createdAt);
        }
    }
}
