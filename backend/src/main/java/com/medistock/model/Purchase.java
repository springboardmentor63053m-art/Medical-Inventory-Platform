package com.medistock.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Represents a purchase order (restock) placed with a supplier.
 * Creating a purchase order does NOT change stock — stock only
 * increases once Admin marks the order RECEIVED (see PurchaseService
 * and PurchaseOrderStatus for the full Admin -> Supplier -> Admin flow).
 */
@Entity
@Table(name = "purchases")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Purchase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "medicine_id")
    private Medicine medicine;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "purchased_by")
    private User purchasedBy;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime purchaseDate = LocalDateTime.now();

    @Column(length = 255)
    private String note;

    /** Purchase Order Number — requirement 13's minimum recommended addition. Optional; free text so it fits whatever numbering scheme the pharmacy already uses. */
    @Column(name = "po_number", length = 60)
    private String poNumber;

    /** Supplier's own invoice number for this purchase — requirement 13's other minimum recommended addition. */
    @Column(name = "invoice_number", length = 60)
    private String invoiceNumber;

    /**
     * Purchase-order workflow state. Existing rows created before this
     * column existed are backfilled to RECEIVED by Hibernate's column
     * default (see columnDefinition below) since the old flow updated
     * stock immediately at creation — functionally equivalent to having
     * already been received.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", nullable = false, length = 20, columnDefinition = "varchar(20) default 'RECEIVED'")
    @Builder.Default
    private PurchaseOrderStatus orderStatus = PurchaseOrderStatus.PENDING;

    /** Set once the supplier accepts or rejects the order. */
    private LocalDateTime respondedDate;

    /** Set once the supplier marks the order dispatched. */
    private LocalDateTime dispatchedDate;

    /** Set once Admin marks the order received — this is also when stock actually increases. */
    private LocalDateTime receivedDate;

    /** Optional note the supplier can attach when accepting/rejecting/dispatching. */
    @Column(length = 255)
    private String supplierNote;
}
