package com.medistock.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public class FulfillPrescriptionRequest {

    @NotNull(message = "Medicine items are required")
    private List<CreateSaleRequest.SaleItemRequest> items;

    private String deliveryNotes;

    public FulfillPrescriptionRequest() {}

    public List<CreateSaleRequest.SaleItemRequest> getItems() { return items; }
    public void setItems(List<CreateSaleRequest.SaleItemRequest> items) { this.items = items; }

    public String getDeliveryNotes() { return deliveryNotes; }
    public void setDeliveryNotes(String deliveryNotes) { this.deliveryNotes = deliveryNotes; }
}
