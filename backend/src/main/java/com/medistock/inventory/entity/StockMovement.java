package com.medistock.inventory.entity;

import com.medistock.medicine.entity.Medicine;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "stock_movements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @Column(name = "medicine_code", length = 50)
    private String medicineCode;

    @Column(name = "medicine_name", length = 150)
    private String medicineName;

    @Column(name = "batch_number", length = 50)
    private String batchNumber;

    @Column(name = "movement_type", nullable = false, length = 30)
    private String movementType;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "previous_quantity", nullable = false)
    private Integer previousQuantity;

    @Column(name = "new_quantity", nullable = false)
    private Integer newQuantity;

    @Column(name = "performed_by", length = 100)
    private String performedBy;

    @Column(length = 255)
    private String reason;

    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
        if (this.medicine != null) {
            if (this.medicineCode == null) {
                this.medicineCode = this.medicine.getMedicineCode();
            }
            if (this.medicineName == null) {
                this.medicineName = this.medicine.getName();
            }
        }
    }
}
