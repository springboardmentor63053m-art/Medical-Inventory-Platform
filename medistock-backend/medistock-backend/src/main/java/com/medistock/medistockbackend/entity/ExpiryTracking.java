package com.medistock.medistockbackend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "expiry_trackings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExpiryTracking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "inventory_id", nullable = false)
    private Inventory inventory;

    private Integer daysToExpiry;

    private String status; // e.g., EXPIRED, EXPIRING_SOON, SAFE
}
