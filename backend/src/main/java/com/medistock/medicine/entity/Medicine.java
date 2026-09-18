package com.medistock.medicine.entity;

import com.medistock.category.entity.Category;
import com.medistock.supplier.entity.Supplier;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "medicines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "medicine_code", nullable = false, unique = true, length = 50)
    private String medicineCode;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "generic_name", length = 150)
    private String genericName;

    @Column(nullable = false, length = 150)
    private String manufacturer;

    @Column(length = 50)
    private String dosage;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "cost_price", precision = 10, scale = 2)
    private BigDecimal costPrice;

    @Column(name = "selling_price", precision = 10, scale = 2)
    private BigDecimal sellingPrice;

    @Builder.Default
    @Column(name = "reorder_level", nullable = false)
    private Integer reorderLevel = 10;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(name = "storage_location", length = 100)
    private String storageLocation;

    @Builder.Default
    @Column(name = "prescription_required", nullable = false)
    private Boolean prescriptionRequired = true;

    @Builder.Default
    @ManyToMany(mappedBy = "medicines", fetch = FetchType.LAZY)
    private Set<Supplier> suppliers = new HashSet<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        syncPrices();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        syncPrices();
        this.updatedAt = LocalDateTime.now();
    }

    private void syncPrices() {
        if (this.sellingPrice != null) {
            this.unitPrice = this.sellingPrice;
        } else if (this.unitPrice != null) {
            this.sellingPrice = this.unitPrice;
        } else {
            this.sellingPrice = BigDecimal.ZERO;
            this.unitPrice = BigDecimal.ZERO;
        }

        if (this.costPrice == null) {
            this.costPrice = BigDecimal.ZERO;
        }
    }

    public BigDecimal getSellingPrice() {
        if (sellingPrice != null) return sellingPrice;
        return unitPrice != null ? unitPrice : BigDecimal.ZERO;
    }

    public BigDecimal getCostPrice() {
        return costPrice != null ? costPrice : BigDecimal.ZERO;
    }

    public BigDecimal getProfitPerUnit() {
        BigDecimal sp = getSellingPrice();
        BigDecimal cp = getCostPrice();
        return sp.subtract(cp);
    }

    public Double getProfitMargin() {
        BigDecimal cp = getCostPrice();
        if (cp.compareTo(BigDecimal.ZERO) <= 0) {
            return 0.0;
        }
        BigDecimal profit = getProfitPerUnit();
        return profit.multiply(BigDecimal.valueOf(100))
                .divide(cp, 2, java.math.RoundingMode.HALF_UP)
                .doubleValue();
    }
}
