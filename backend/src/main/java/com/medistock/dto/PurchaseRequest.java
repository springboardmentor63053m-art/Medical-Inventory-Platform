package com.medistock.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PurchaseRequest {
    @NotNull
    private Long medicineId;

    private Long supplierId;

    @NotNull @Positive
    private Integer quantity;

    @NotNull
    private BigDecimal unitPrice;

    private String note;
}
