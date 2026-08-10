package com.medistock.medistock_backend.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class SaleRequest {
    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotBlank(message = "Customer phone is required")
    private String customerPhone;

    private String paymentMethod;
    private BigDecimal discountAmount;

    @NotEmpty(message = "Sale must contain at least one item")
    private List<SaleItemRequest> items;
}
