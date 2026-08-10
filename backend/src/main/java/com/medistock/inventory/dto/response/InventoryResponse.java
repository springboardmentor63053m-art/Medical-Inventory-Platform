package com.medistock.inventory.dto.response;

import com.medistock.medicine.dto.response.MedicineResponse;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryResponse {
    private Long id;
    private MedicineResponse medicine;
    private Integer quantity;
    private Integer minimumStock;
    private String batchNumber;
    private LocalDate expiryDate;
    private String storageLocation;
    private Boolean isLowStock;
    private Boolean isOutOfStock;
    private Boolean isExpired;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
