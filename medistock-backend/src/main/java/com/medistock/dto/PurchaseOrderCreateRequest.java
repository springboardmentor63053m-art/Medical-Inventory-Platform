package com.medistock.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class PurchaseOrderCreateRequest {
    @NotNull(message = "Supplier ID is required")
    private Long supplierId;

    private LocalDate expectedDelivery;

    @NotEmpty(message = "Purchase order must contain at least one item")
    @Valid
    private List<PurchaseOrderItemDTO> items;

    public PurchaseOrderCreateRequest() {}

    public PurchaseOrderCreateRequest(Long supplierId, LocalDate expectedDelivery, List<PurchaseOrderItemDTO> items) {
        this.supplierId = supplierId;
        this.expectedDelivery = expectedDelivery;
        this.items = items;
    }

    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }

    public LocalDate getExpectedDelivery() { return expectedDelivery; }
    public void setExpectedDelivery(LocalDate expectedDelivery) { this.expectedDelivery = expectedDelivery; }

    public List<PurchaseOrderItemDTO> getItems() { return items; }
    public void setItems(List<PurchaseOrderItemDTO> items) { this.items = items; }
}
