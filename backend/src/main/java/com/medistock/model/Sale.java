package com.medistock.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * A completed over-the-counter sale/bill: MediStock -> Customer.
 * Kept deliberately separate from {@link Purchase} (Supplier -> MediStock)
 * so the two directions of stock movement are never conflated.
 */
@Entity
@Table(name = "sales")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Human-facing invoice number, e.g. "INV-1001". Assigned once the row has an id. */
    @Column(name = "bill_number", unique = true, length = 30)
    private String billNumber;

    @Column(name = "customer_name", nullable = false, length = 120)
    private String customerName;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "sold_by")
    private User soldBy;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "sale_date", nullable = false)
    @Builder.Default
    private LocalDateTime saleDate = LocalDateTime.now();

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<SaleItem> items = new ArrayList<>();

    /** Optional — requirement 14's recommended additional sale fields. */
    @Column(name = "customer_phone", length = 20)
    private String customerPhone;

    @Column(name = "payment_method", length = 30)
    private String paymentMethod;

    /** Free text (e.g. "PAID", "PENDING") rather than an enum — keeps this additive and non-breaking for existing rows/consumers that don't set it. */
    @Column(name = "payment_status", length = 30)
    @Builder.Default
    private String paymentStatus = "PAID";
}
