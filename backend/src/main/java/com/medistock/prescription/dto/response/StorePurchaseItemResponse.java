package com.medistock.prescription.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StorePurchaseItemResponse {
    private Long id;
    private Long medicineId;
    private String medicineCode;
    private String medicineName;
    private String genericName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
}
