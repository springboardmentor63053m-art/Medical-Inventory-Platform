package com.medistock.prescription.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StorePurchaseResponse {
    private Long id;
    private String receiptNumber;
    private String customerName;
    private String customerPhone;
    private String pharmacistName;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private LocalDateTime createdAt;
    private List<StorePurchaseItemResponse> items;
}
