package com.medistock.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "medicines")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 50)
    private String batchNumber;

    @Column(length = 100)
    private String category;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    @Builder.Default
    private Integer reorderLevel = 20;

    private LocalDate manufacturingDate;

    @Column(nullable = false)
    private LocalDate expiryDate;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    /**
     * Soft-delete flag (requirement 10). When a medicine with historical
     * purchases/sales/stock-movements is "deleted", it is deactivated
     * instead of physically removed so the audit trail, past sales, and
     * past purchases stay intact. Defaults to true for every medicine.
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    /**
     * Optional real product photos, added by an Admin/Pharmacist via the
     * Medicines page (URL-based — MediStock has no file-upload pipeline).
     * Both nullable: the UI falls back to a category-illustrated visual
     * (see frontend MedicineAvatar) when either is unset.
     */
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "sheet_image_url", length = 500)
    private String sheetImageUrl;
}
