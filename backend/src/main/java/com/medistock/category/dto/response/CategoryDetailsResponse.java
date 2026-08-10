package com.medistock.category.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDetailsResponse {

    private Long id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Real database summary metrics
    private int totalMedicines;
    private int inStockCount;
    private int lowStockCount;
    private int outOfStockCount;
    private int activeCount;
    private int inactiveCount;

    // Detailed lists
    private List<CategoryMedicineDto> medicines;
    private List<CategoryMedicineDto> lowStockMedicines;
    private List<CategoryMedicineDto> outOfStockMedicines;
    private List<ExpiringBatchDto> expiringBatches;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryMedicineDto {
        private Long id;
        private String medicineCode;
        private String name;
        private String genericName;
        private String manufacturer;
        private String dosage;
        private BigDecimal unitPrice;
        private Integer reorderLevel;
        private String status;
        private Boolean prescriptionRequired;
        private long currentStock;
        private String stockStatus; // IN_STOCK | LOW_STOCK | OUT_OF_STOCK
        private long shortage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExpiringBatchDto {
        private Long inventoryId;
        private Long medicineId;
        private String medicineName;
        private String medicineCode;
        private String batchNumber;
        private int quantity;
        private LocalDate expiryDate;
        private String storageLocation;
    }
}
