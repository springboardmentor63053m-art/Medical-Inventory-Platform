package com.medistock.medistockbackend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "inventories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Inventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    private String batchNumber;

    @Column(nullable = false)
    private Integer quantity;

    private LocalDate expiryDate;

    @OneToOne(mappedBy = "inventory", cascade = CascadeType.ALL)
    private ExpiryTracking expiryTracking;
}
