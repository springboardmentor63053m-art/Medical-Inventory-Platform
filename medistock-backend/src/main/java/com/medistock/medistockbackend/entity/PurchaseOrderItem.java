package com.medistock.medistockbackend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "purchase_order_items")
public class PurchaseOrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "purchase_order_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("items")
    private PurchaseOrder purchaseOrder;

    @ManyToOne
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @Column(nullable = false)
    private Integer quantity;

    private Double price;

    public PurchaseOrderItem() {
    }

    public PurchaseOrderItem(Long id, PurchaseOrder purchaseOrder, Medicine medicine, Integer quantity, Double price) {
        this.id = id;
        this.purchaseOrder = purchaseOrder;
        this.medicine = medicine;
        this.quantity = quantity;
        this.price = price;
    }

    public Long getId() {
        return this.id;
    }

    public PurchaseOrder getPurchaseOrder() {
        return this.purchaseOrder;
    }

    public Medicine getMedicine() {
        return this.medicine;
    }

    public Integer getQuantity() {
        return this.quantity;
    }

    public Double getPrice() {
        return this.price;
    }

    public void setId(final Long id) {
        this.id = id;
    }

    public void setPurchaseOrder(final PurchaseOrder purchaseOrder) {
        this.purchaseOrder = purchaseOrder;
    }

    public void setMedicine(final Medicine medicine) {
        this.medicine = medicine;
    }

    public void setQuantity(final Integer quantity) {
        this.quantity = quantity;
    }

    public void setPrice(final Double price) {
        this.price = price;
    }
}
