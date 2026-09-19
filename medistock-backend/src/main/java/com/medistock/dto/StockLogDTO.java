package com.medistock.dto;

import com.medistock.enums.ActionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class StockLogDTO {
    private Long id;

    @NotNull(message = "Medicine ID is required")
    private Long medicineId;

    private String medicineCode;
    private String medicineName;

    @NotNull(message = "Action type is required")
    private ActionType actionType;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private Integer previousQuantity;
    private Integer newQuantity;
    private String performedBy;
    private String remarks;
    private LocalDateTime createdAt;

    public StockLogDTO() {}

    public StockLogDTO(Long id, Long medicineId, String medicineCode, String medicineName, ActionType actionType, Integer quantity, Integer previousQuantity, Integer newQuantity, String performedBy, String remarks, LocalDateTime createdAt) {
        this.id = id;
        this.medicineId = medicineId;
        this.medicineCode = medicineCode;
        this.medicineName = medicineName;
        this.actionType = actionType;
        this.quantity = quantity;
        this.previousQuantity = previousQuantity;
        this.newQuantity = newQuantity;
        this.performedBy = performedBy;
        this.remarks = remarks;
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

    public ActionType getActionType() { return actionType; }
    public void setActionType(ActionType actionType) { this.actionType = actionType; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Integer getPreviousQuantity() { return previousQuantity; }
    public void setPreviousQuantity(Integer previousQuantity) { this.previousQuantity = previousQuantity; }

    public Integer getNewQuantity() { return newQuantity; }
    public void setNewQuantity(Integer newQuantity) { this.newQuantity = newQuantity; }

    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static StockLogDTOBuilder builder() { return new StockLogDTOBuilder(); }

    public static class StockLogDTOBuilder {
        private Long id;
        private Long medicineId;
        private String medicineCode;
        private String medicineName;
        private ActionType actionType;
        private Integer quantity;
        private Integer previousQuantity;
        private Integer newQuantity;
        private String performedBy;
        private String remarks;
        private LocalDateTime createdAt;

        public StockLogDTOBuilder id(Long id) { this.id = id; return this; }
        public StockLogDTOBuilder medicineId(Long medicineId) { this.medicineId = medicineId; return this; }
        public StockLogDTOBuilder medicineCode(String medicineCode) { this.medicineCode = medicineCode; return this; }
        public StockLogDTOBuilder medicineName(String medicineName) { this.medicineName = medicineName; return this; }
        public StockLogDTOBuilder actionType(ActionType actionType) { this.actionType = actionType; return this; }
        public StockLogDTOBuilder quantity(Integer quantity) { this.quantity = quantity; return this; }
        public StockLogDTOBuilder previousQuantity(Integer previousQuantity) { this.previousQuantity = previousQuantity; return this; }
        public StockLogDTOBuilder newQuantity(Integer newQuantity) { this.newQuantity = newQuantity; return this; }
        public StockLogDTOBuilder performedBy(String performedBy) { this.performedBy = performedBy; return this; }
        public StockLogDTOBuilder remarks(String remarks) { this.remarks = remarks; return this; }
        public StockLogDTOBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public StockLogDTO build() {
            return new StockLogDTO(id, medicineId, medicineCode, medicineName, actionType, quantity, previousQuantity, newQuantity, performedBy, remarks, createdAt);
        }
    }
}
