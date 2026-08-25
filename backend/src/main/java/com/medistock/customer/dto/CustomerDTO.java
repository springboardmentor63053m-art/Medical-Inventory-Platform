package com.medistock.customer.dto;

import com.medistock.prescription.dto.response.StorePurchaseResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDTO {
    private Long id;
    private String name;
    private String phone;
    private String normalizedPhone;
    private String email;
    private String address;
    private long previousPurchasesCount;
    private long totalPurchases;
    private BigDecimal lifetimeSpend;
    private BigDecimal totalAmountSpent;
    private LocalDateTime lastPurchaseAt;
    private LocalDateTime lastPurchaseDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String status;
    private boolean exists;
    private boolean found;
    private CustomerData customer;
    private List<StorePurchaseResponse> purchases;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerData {
        private Long id;
        private String name;
        private String phone;
        private String normalizedPhone;
        private String email;
        private String address;
        private long previousPurchasesCount;
        private long totalPurchases;
        private BigDecimal lifetimeSpend;
        private BigDecimal totalAmountSpent;
        private LocalDateTime lastPurchaseAt;
        private LocalDateTime lastPurchaseDate;
        private LocalDateTime createdAt;
        private String status;
    }
}
