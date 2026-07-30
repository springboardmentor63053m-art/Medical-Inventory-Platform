package com.medistock.purchase.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderItemResponse {
    private Long id;
    private Long medicineId;
    private String medicineName;
    private String medicineCode;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
}
