package com.medistock.purchase.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class PurchaseOrderRequest {
    @NotNull(message = "Supplier ID is required")
    private Long supplierId;

    private LocalDate expectedDelivery;
    private String status;

    private List<PurchaseOrderItemRequest> items;
}
