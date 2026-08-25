package com.medistock.customer.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 30)
    private String phone;

    @Column(name = "normalized_phone", nullable = false, unique = true, length = 30)
    private String normalizedPhone;

    @Column(length = 150)
    private String email;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Builder.Default
    @Column(name = "total_purchases")
    private Long totalPurchases = 0L;

    @Builder.Default
    @Column(name = "lifetime_spend", precision = 12, scale = 2)
    private BigDecimal lifetimeSpend = BigDecimal.ZERO;

    @Column(name = "last_purchase_at")
    private LocalDateTime lastPurchaseAt;

    @Builder.Default
    @Column(length = 20)
    private String status = "ACTIVE";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (totalPurchases == null) totalPurchases = 0L;
        if (lifetimeSpend == null) lifetimeSpend = BigDecimal.ZERO;
        if (status == null) status = "ACTIVE";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
