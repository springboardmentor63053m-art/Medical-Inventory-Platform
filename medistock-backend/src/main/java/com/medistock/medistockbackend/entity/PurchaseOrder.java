package com.medistock.medistockbackend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "purchase_orders")
public class PurchaseOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    private LocalDateTime orderDate = LocalDateTime.now();

    private String status; // e.g., PENDING, COMPLETED, CANCELLED

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("purchaseOrder")
    private List<PurchaseOrderItem> items;

    public PurchaseOrder() {
    }

    public PurchaseOrder(Long id, Supplier supplier, LocalDateTime orderDate, String status, List<PurchaseOrderItem> items) {
        this.id = id;
        this.supplier = supplier;
        this.orderDate = orderDate;
        this.status = status;
        this.items = items;
    }

    public Long getId() {
        return this.id;
    }

    public Supplier getSupplier() {
        return this.supplier;
    }

    public LocalDateTime getOrderDate() {
        return this.orderDate;
    }

    public String getStatus() {
        return this.status;
    }

    public List<PurchaseOrderItem> getItems() {
        return this.items;
    }

    public Double getTotalAmount() {
        if (items == null || items.isEmpty()) {
            return 0.0;
        }
        return items.stream()
                .mapToDouble(item -> {
                    double p = item.getPrice() != null ? item.getPrice() : (item.getMedicine() != null && item.getMedicine().getPrice() != null ? item.getMedicine().getPrice() : 0.0);
                    int q = item.getQuantity() != null ? item.getQuantity() : 0;
                    return p * q;
                })
                .sum();
    }

    public void setId(final Long id) {
        this.id = id;
    }

    public void setSupplier(final Supplier supplier) {
        this.supplier = supplier;
    }

    public void setOrderDate(final LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public void setStatus(final String status) {
        this.status = status;
    }

    public void setItems(final List<PurchaseOrderItem> items) {
        this.items = items;
    }
}
