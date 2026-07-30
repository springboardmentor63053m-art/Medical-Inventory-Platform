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
public class PurchaseOrderResponse {
    private Long id;
    private String orderNumber;
    private SupplierDto supplier;
    private String createdByUsername;
    private String status;
    private BigDecimal totalAmount;
    private LocalDateTime orderDate;
    private List<ItemDto> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ItemDto {
        private Long id;
        private Long medicineId;
        private String medicineName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }
}
