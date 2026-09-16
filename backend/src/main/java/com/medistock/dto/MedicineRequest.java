package com.medistock.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MedicineRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String batchNumber;

    private String category;

    private Long supplierId;

    @NotNull @PositiveOrZero
    private Integer quantity;

    @PositiveOrZero
    private Integer reorderLevel;

    private LocalDate manufacturingDate;

    @NotNull
    private LocalDate expiryDate;

    @NotNull
    @PositiveOrZero
    private BigDecimal price;

    /** Optional real product photo URLs — box/packaging and blister sheet. */
    private String imageUrl;
    private String sheetImageUrl;
}
