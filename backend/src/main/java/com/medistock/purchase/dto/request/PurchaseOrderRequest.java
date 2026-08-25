package com.medistock.purchase.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class PurchaseOrderRequest {
    @NotNull(message = "Supplier ID is required")
    private Long supplierId;

    @FutureOrPresent(message = "Expected delivery date cannot be in the past")
    private LocalDate expectedDelivery;
    private String status;

    private List<PurchaseOrderItemRequest> items;
}
