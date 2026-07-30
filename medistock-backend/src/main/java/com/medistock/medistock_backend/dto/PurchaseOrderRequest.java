package com.medistock.medistock_backend.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class PurchaseOrderRequest {
    @NotNull(message = "Supplier ID is required")
    private Long supplierId;

    @NotEmpty(message = "Order must contain at least one item")
    private List<PurchaseOrderItemRequest> items;
}
