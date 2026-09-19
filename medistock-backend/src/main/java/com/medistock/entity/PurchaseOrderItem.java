package com.medistock.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "purchase_order_items")
public class PurchaseOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private PurchaseOrder purchaseOrder;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;

    public PurchaseOrderItem() {}

    public PurchaseOrderItem(Long id, PurchaseOrder purchaseOrder, Medicine medicine, Integer quantity, BigDecimal unitPrice, BigDecimal subtotal) {
        this.id = id;
        this.purchaseOrder = purchaseOrder;
        this.medicine = medicine;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.subtotal = subtotal;
    }

    @PrePersist
    protected void onCreate() {
        if (this.unitPrice == null) this.unitPrice = BigDecimal.ZERO;
        if (this.subtotal == null) {
            this.subtotal = this.unitPrice.multiply(BigDecimal.valueOf(this.quantity != null ? this.quantity : 0));
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public PurchaseOrder getPurchaseOrder() { return purchaseOrder; }
    public void setPurchaseOrder(PurchaseOrder purchaseOrder) { this.purchaseOrder = purchaseOrder; }

    public Medicine getMedicine() { return medicine; }
    public void setMedicine(Medicine medicine) { this.medicine = medicine; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public static PurchaseOrderItemBuilder builder() { return new PurchaseOrderItemBuilder(); }

    public static class PurchaseOrderItemBuilder {
        private Long id;
        private PurchaseOrder purchaseOrder;
        private Medicine medicine;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;

        public PurchaseOrderItemBuilder id(Long id) { this.id = id; return this; }
        public PurchaseOrderItemBuilder purchaseOrder(PurchaseOrder purchaseOrder) { this.purchaseOrder = purchaseOrder; return this; }
        public PurchaseOrderItemBuilder medicine(Medicine medicine) { this.medicine = medicine; return this; }
        public PurchaseOrderItemBuilder quantity(Integer quantity) { this.quantity = quantity; return this; }
        public PurchaseOrderItemBuilder unitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; return this; }
        public PurchaseOrderItemBuilder subtotal(BigDecimal subtotal) { this.subtotal = subtotal; return this; }

        public PurchaseOrderItem build() {
            return new PurchaseOrderItem(id, purchaseOrder, medicine, quantity, unitPrice, subtotal);
        }
    }
}
