package com.medistock.medistock_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MedicineRequest {
    @NotBlank(message = "Medicine name is required")
    private String name;

    @NotBlank(message = "Medicine code is required")
    private String code;

    private String genericName;
    private String manufacturer;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;

    private LocalDate expiryDate;
    private String batchNumber;

    private Long categoryId;
    private String categoryName;
    private Long supplierId;

    private Integer initialQuantity = 0;
    private Integer reorderLevel = 10;
    private Integer maxQuantity = 100;
    private String locationRack;
}
