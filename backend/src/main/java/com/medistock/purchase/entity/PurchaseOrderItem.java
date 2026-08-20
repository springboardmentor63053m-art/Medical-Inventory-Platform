package com.medistock.purchase.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.medistock.medicine.entity.Medicine;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "purchase_order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    @JsonIgnore
    private PurchaseOrder purchaseOrder;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;

        @Column(name = "received_quantity")
    private Integer receivedQuantity;

    @Column(name = "received_batch_number", length = 50)
    private String receivedBatchNumber;

    @Column(name = "received_expiry_date")
    private LocalDate receivedExpiryDate;

    @Column(name = "received_storage_location", length = 100)
    private String receivedStorageLocation;

    @PrePersist
    @PreUpdate
    protected void calculateSubtotal() {
        if (this.unitPrice != null && this.quantity != null) {
            this.subtotal = this.unitPrice.multiply(BigDecimal.valueOf(this.quantity));
        }
    }
}
