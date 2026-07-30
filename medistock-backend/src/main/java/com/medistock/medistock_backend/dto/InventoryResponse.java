package com.medistock.medistock_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryResponse {
    private Long id;
    private Long medicineId;
    private String medicineName;
    private String medicineCode;
    private Integer quantity;
    private Integer reorderLevel;
    private Integer maxQuantity;
    private String locationRack;
    private boolean lowStock;
    private LocalDateTime lastUpdated;
}
