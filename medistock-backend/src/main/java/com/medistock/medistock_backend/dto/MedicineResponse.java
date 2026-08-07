package com.medistock.medistock_backend.dto;

import com.medistock.medistock_backend.entity.StockStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineResponse {
    private Long id;
    private String name;
    private String code;
    private String genericName;
    private String manufacturer;
    private BigDecimal price;
    private LocalDate expiryDate;
    private String batchNumber;
    private CategoryDto category;
    private SupplierDto supplier;
    private Integer currentStock;
    private Integer reorderLevel;
    private StockStatus stockStatus;
}
