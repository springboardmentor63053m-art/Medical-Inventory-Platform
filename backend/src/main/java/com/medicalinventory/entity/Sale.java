package com.medicalinventory.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sales")
public class Sale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sale_number", nullable = false, unique = true, length = 100)
    private String saleNumber;

    @Column(name = "customer_name", length = 150)
    private String customerName;

    @Column(name = "customer_phone", length = 20)
    private String customerPhone;

    @Column(name = "sale_date", nullable = false)
    private LocalDate saleDate;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 10, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "net_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal netAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod = PaymentMethod.CASH;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SaleStatus status = SaleStatus.COMPLETED;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<SaleItem> items = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public enum PaymentMethod { CASH, CARD, UPI, INSURANCE }
    public enum SaleStatus    { COMPLETED, CANCELLED, REFUNDED }

    public Sale() {}

    public Sale(Long id, String saleNumber, String customerName, String customerPhone, LocalDate saleDate, BigDecimal totalAmount, BigDecimal discount, BigDecimal taxAmount, BigDecimal netAmount, PaymentMethod paymentMethod, SaleStatus status, String notes, User createdBy, List<SaleItem> items, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.saleNumber = saleNumber;
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.saleDate = saleDate;
        this.totalAmount = totalAmount != null ? totalAmount : BigDecimal.ZERO;
        this.discount = discount != null ? discount : BigDecimal.ZERO;
        this.taxAmount = taxAmount != null ? taxAmount : BigDecimal.ZERO;
        this.netAmount = netAmount != null ? netAmount : BigDecimal.ZERO;
        this.paymentMethod = paymentMethod != null ? paymentMethod : PaymentMethod.CASH;
        this.status = status != null ? status : SaleStatus.COMPLETED;
        this.notes = notes;
        this.createdBy = createdBy;
        this.items = items != null ? items : new ArrayList<>();
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static SaleBuilder builder() { return new SaleBuilder(); }

    public static class SaleBuilder {
        private Long id;
        private String saleNumber;
        private String customerName;
        private String customerPhone;
        private LocalDate saleDate;
        private BigDecimal totalAmount = BigDecimal.ZERO;
        private BigDecimal discount = BigDecimal.ZERO;
        private BigDecimal taxAmount = BigDecimal.ZERO;
        private BigDecimal netAmount = BigDecimal.ZERO;
        private PaymentMethod paymentMethod = PaymentMethod.CASH;
        private SaleStatus status = SaleStatus.COMPLETED;
        private String notes;
        private User createdBy;
        private List<SaleItem> items = new ArrayList<>();
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public SaleBuilder id(Long id) { this.id = id; return this; }
        public SaleBuilder saleNumber(String saleNumber) { this.saleNumber = saleNumber; return this; }
        public SaleBuilder customerName(String customerName) { this.customerName = customerName; return this; }
        public SaleBuilder customerPhone(String customerPhone) { this.customerPhone = customerPhone; return this; }
        public SaleBuilder saleDate(LocalDate saleDate) { this.saleDate = saleDate; return this; }
        public SaleBuilder totalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; return this; }
        public SaleBuilder discount(BigDecimal discount) { this.discount = discount; return this; }
        public SaleBuilder taxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; return this; }
        public SaleBuilder netAmount(BigDecimal netAmount) { this.netAmount = netAmount; return this; }
        public SaleBuilder paymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; return this; }
        public SaleBuilder status(SaleStatus status) { this.status = status; return this; }
        public SaleBuilder notes(String notes) { this.notes = notes; return this; }
        public SaleBuilder createdBy(User createdBy) { this.createdBy = createdBy; return this; }
        public SaleBuilder items(List<SaleItem> items) { this.items = items; return this; }
        public SaleBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public SaleBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Sale build() {
            return new Sale(id, saleNumber, customerName, customerPhone, saleDate, totalAmount, discount, taxAmount, netAmount, paymentMethod, status, notes, createdBy, items, createdAt, updatedAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSaleNumber() { return saleNumber; }
    public void setSaleNumber(String saleNumber) { this.saleNumber = saleNumber; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
    public LocalDate getSaleDate() { return saleDate; }
    public void setSaleDate(LocalDate saleDate) { this.saleDate = saleDate; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public BigDecimal getDiscount() { return discount; }
    public void setDiscount(BigDecimal discount) { this.discount = discount; }
    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }
    public BigDecimal getNetAmount() { return netAmount; }
    public void setNetAmount(BigDecimal netAmount) { this.netAmount = netAmount; }
    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
    public SaleStatus getStatus() { return status; }
    public void setStatus(SaleStatus status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    public List<SaleItem> getItems() { return items; }
    public void setItems(List<SaleItem> items) { this.items = items; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
