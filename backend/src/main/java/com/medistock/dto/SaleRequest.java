package com.medistock.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class SaleRequest {

    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotEmpty(message = "A sale must contain at least one item")
    @Valid
    private List<SaleItemRequest> items;

    /** Optional — requirement 14's recommended additional sale fields. */
    private String customerPhone;
    private String paymentMethod;
    private String paymentStatus;

    @Data
    public static class SaleItemRequest {
        @NotNull
        private Long medicineId;

        @NotNull
        private Integer quantity;
    }
}
