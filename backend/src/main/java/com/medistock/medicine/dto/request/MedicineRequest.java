package com.medistock.medicine.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineRequest {

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotBlank(message = "Medicine code is required")
    private String medicineCode;

    @NotBlank(message = "Medicine name is required")
    private String name;

    private String genericName;

    @NotBlank(message = "Manufacturer is required")
    private String manufacturer;

    private String dosage;

    @NotNull(message = "Unit price is required")
    @Positive(message = "Unit price must be positive")
    private BigDecimal unitPrice;

    @NotNull(message = "Reorder level is required")
    @PositiveOrZero(message = "Reorder level must be zero or positive")
    private Integer reorderLevel;

    private String description;

    @Builder.Default
    private String status = "ACTIVE";

    private String storageLocation;
}
