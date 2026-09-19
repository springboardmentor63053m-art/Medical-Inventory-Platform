package com.medistock.entity;

import com.medistock.enums.ActionType;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_logs")
public class StockLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false, length = 20)
    private ActionType actionType;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "performed_by", length = 150)
    private String performedBy;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "previous_quantity")
    private Integer previousQuantity;

    @Column(name = "new_quantity")
    private Integer newQuantity;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public StockLog() {}

    public StockLog(Long id, Medicine medicine, ActionType actionType, Integer quantity, Integer previousQuantity, Integer newQuantity, String performedBy, String remarks, LocalDateTime createdAt) {
        this.id = id;
        this.medicine = medicine;
        this.actionType = actionType;
        this.quantity = quantity;
        this.previousQuantity = previousQuantity;
        this.newQuantity = newQuantity;
        this.performedBy = performedBy;
        this.remarks = remarks;
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Medicine getMedicine() { return medicine; }
    public void setMedicine(Medicine medicine) { this.medicine = medicine; }

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

    public static StockLogBuilder builder() { return new StockLogBuilder(); }

    public static class StockLogBuilder {
        private Long id;
        private Medicine medicine;
        private ActionType actionType;
        private Integer quantity;
        private Integer previousQuantity;
        private Integer newQuantity;
        private String performedBy;
        private String remarks;
        private LocalDateTime createdAt;

        public StockLogBuilder id(Long id) { this.id = id; return this; }
        public StockLogBuilder medicine(Medicine medicine) { this.medicine = medicine; return this; }
        public StockLogBuilder actionType(ActionType actionType) { this.actionType = actionType; return this; }
        public StockLogBuilder quantity(Integer quantity) { this.quantity = quantity; return this; }
        public StockLogBuilder previousQuantity(Integer previousQuantity) { this.previousQuantity = previousQuantity; return this; }
        public StockLogBuilder newQuantity(Integer newQuantity) { this.newQuantity = newQuantity; return this; }
        public StockLogBuilder performedBy(String performedBy) { this.performedBy = performedBy; return this; }
        public StockLogBuilder remarks(String remarks) { this.remarks = remarks; return this; }
        public StockLogBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public StockLog build() {
            return new StockLog(id, medicine, actionType, quantity, previousQuantity, newQuantity, performedBy, remarks, createdAt);
        }
    }
}
