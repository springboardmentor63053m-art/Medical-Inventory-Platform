package com.medistock.medistock_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaleResponse {
    private Long id;
    private String invoiceNumber;
    private String customerName;
    private String customerPhone;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private String paymentMethod;
    private LocalDateTime saleDate;
    private String createdByUsername;
    private List<SaleItemDto> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SaleItemDto {
        private Long id;
        private Long medicineId;
        private String medicineName;
        private String medicineCode;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }
}
