package com.medistock.inventory.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryRequest {

    @NotNull(message = "Medicine ID is required")
    private Long medicineId;

    @NotNull(message = "Quantity is required")
    @PositiveOrZero(message = "Quantity must be zero or positive")
    private Integer quantity;

    @NotNull(message = "Minimum stock is required")
    @PositiveOrZero(message = "Minimum stock must be zero or positive")
    private Integer minimumStock;

    @NotBlank(message = "Batch number is required")
    private String batchNumber;

    @NotNull(message = "Expiry date is required")
    private LocalDate expiryDate;

    private String storageLocation;
}
