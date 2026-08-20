package com.medistock.purchase.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PurchaseOrderReceiptItemRequest {

    @NotNull(message = "Purchase order item ID is required")
    private Long purchaseOrderItemId;

    @NotBlank(message = "Received batch number is required")
    private String batchNumber;

    @NotNull(message = "Received expiry date is required")
    @Future(message = "Received expiry date must be in the future")
    private LocalDate expiryDate;

    private String storageLocation;

    @PositiveOrZero(message = "Minimum stock cannot be negative")
    private Integer minimumStock;
}