package com.medistock.entity;

import com.medistock.enums.OrderStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "purchase_orders")
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Column(name = "order_number", nullable = false, unique = true, length = 50)
    private String orderNumber;

    @Column(name = "order_date", nullable = false)
    private LocalDate orderDate;

    @Column(name = "expected_delivery")
    private LocalDate expectedDelivery;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status;

    @Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<PurchaseOrderItem> items = new ArrayList<>();

    public PurchaseOrder() {}

    public PurchaseOrder(Long id, Supplier supplier, String orderNumber, LocalDate orderDate, LocalDate expectedDelivery, OrderStatus status, BigDecimal totalAmount, LocalDateTime createdAt, LocalDateTime updatedAt, List<PurchaseOrderItem> items) {
        this.id = id;
        this.supplier = supplier;
        this.orderNumber = orderNumber;
        this.orderDate = orderDate;
        this.expectedDelivery = expectedDelivery;
        this.status = status;
        this.totalAmount = totalAmount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        if (items != null) {
            this.items = items;
        }
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) this.status = OrderStatus.PENDING;
        if (this.totalAmount == null) this.totalAmount = BigDecimal.ZERO;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void addItem(PurchaseOrderItem item) {
        items.add(item);
        item.setPurchaseOrder(this);
    }

    public void removeItem(PurchaseOrderItem item) {
        items.remove(item);
        item.setPurchaseOrder(null);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public LocalDate getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDate orderDate) { this.orderDate = orderDate; }

    public LocalDate getExpectedDelivery() { return expectedDelivery; }
    public void setExpectedDelivery(LocalDate expectedDelivery) { this.expectedDelivery = expectedDelivery; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<PurchaseOrderItem> getItems() { return items; }
    public void setItems(List<PurchaseOrderItem> items) { this.items = items; }

    public static PurchaseOrderBuilder builder() { return new PurchaseOrderBuilder(); }

    public static class PurchaseOrderBuilder {
        private Long id;
        private Supplier supplier;
        private String orderNumber;
        private LocalDate orderDate;
        private LocalDate expectedDelivery;
        private OrderStatus status;
        private BigDecimal totalAmount;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private List<PurchaseOrderItem> items = new ArrayList<>();

        public PurchaseOrderBuilder id(Long id) { this.id = id; return this; }
        public PurchaseOrderBuilder supplier(Supplier supplier) { this.supplier = supplier; return this; }
        public PurchaseOrderBuilder orderNumber(String orderNumber) { this.orderNumber = orderNumber; return this; }
        public PurchaseOrderBuilder orderDate(LocalDate orderDate) { this.orderDate = orderDate; return this; }
        public PurchaseOrderBuilder expectedDelivery(LocalDate expectedDelivery) { this.expectedDelivery = expectedDelivery; return this; }
        public PurchaseOrderBuilder status(OrderStatus status) { this.status = status; return this; }
        public PurchaseOrderBuilder totalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; return this; }
        public PurchaseOrderBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public PurchaseOrderBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
        public PurchaseOrderBuilder items(List<PurchaseOrderItem> items) { this.items = items; return this; }

        public PurchaseOrder build() {
            return new PurchaseOrder(id, supplier, orderNumber, orderDate, expectedDelivery, status, totalAmount, createdAt, updatedAt, items);
        }
    }
}
