package com.medistock.medistock_backend.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class SaleRequest {
    private String customerName;
    private String customerPhone;
    private String paymentMethod;
    private BigDecimal discountAmount;

    @NotEmpty(message = "Sale must contain at least one item")
    private List<SaleItemRequest> items;
}
