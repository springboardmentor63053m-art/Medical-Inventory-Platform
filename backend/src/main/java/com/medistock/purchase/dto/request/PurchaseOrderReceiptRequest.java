package com.medistock.purchase.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class PurchaseOrderReceiptRequest {

    @NotEmpty(message = "Receipt details are required")
    @Valid
    private List<PurchaseOrderReceiptItemRequest> items;
}