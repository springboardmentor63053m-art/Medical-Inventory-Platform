package com.medistock.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class PurchaseOrderItemDTO {
    private Long id;

    @NotNull(message = "Medicine ID is required")
    private Long medicineId;

    private String medicineCode;
    private String medicineName;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.0", message = "Unit price must be >= 0")
    private BigDecimal unitPrice;

    private BigDecimal subtotal;

    public PurchaseOrderItemDTO() {}

    public PurchaseOrderItemDTO(Long id, Long medicineId, String medicineCode, String medicineName, Integer quantity, BigDecimal unitPrice, BigDecimal subtotal) {
        this.id = id;
        this.medicineId = medicineId;
        this.medicineCode = medicineCode;
        this.medicineName = medicineName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.subtotal = subtotal;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getMedicineId() { return medicineId; }
    public void setMedicineId(Long medicineId) { this.medicineId = medicineId; }

    public String getMedicineCode() { return medicineCode; }
    public void setMedicineCode(String medicineCode) { this.medicineCode = medicineCode; }

    public String getMedicineName() { return medicineName; }
    public void setMedicineName(String medicineName) { this.medicineName = medicineName; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public static PurchaseOrderItemDTOBuilder builder() { return new PurchaseOrderItemDTOBuilder(); }

    public static class PurchaseOrderItemDTOBuilder {
        private Long id;
        private Long medicineId;
        private String medicineCode;
        private String medicineName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;

        public PurchaseOrderItemDTOBuilder id(Long id) { this.id = id; return this; }
        public PurchaseOrderItemDTOBuilder medicineId(Long medicineId) { this.medicineId = medicineId; return this; }
        public PurchaseOrderItemDTOBuilder medicineCode(String medicineCode) { this.medicineCode = medicineCode; return this; }
        public PurchaseOrderItemDTOBuilder medicineName(String medicineName) { this.medicineName = medicineName; return this; }
        public PurchaseOrderItemDTOBuilder quantity(Integer quantity) { this.quantity = quantity; return this; }
        public PurchaseOrderItemDTOBuilder unitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; return this; }
        public PurchaseOrderItemDTOBuilder subtotal(BigDecimal subtotal) { this.subtotal = subtotal; return this; }

        public PurchaseOrderItemDTO build() {
            return new PurchaseOrderItemDTO(id, medicineId, medicineCode, medicineName, quantity, unitPrice, subtotal);
        }
    }
}
