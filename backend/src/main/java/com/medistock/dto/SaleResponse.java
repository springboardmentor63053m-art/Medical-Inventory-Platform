package com.medistock.dto;

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
    private String billNumber;
    private String customerName;
    private String soldByName;
    private BigDecimal totalAmount;
    private LocalDateTime saleDate;
    private List<SaleItemResponse> items;

    /** Optional — requirement 14's recommended additional sale fields. */
    private String customerPhone;
    private String paymentMethod;
    private String paymentStatus;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SaleItemResponse {
        private Long medicineId;
        private String medicineName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
    }
}
