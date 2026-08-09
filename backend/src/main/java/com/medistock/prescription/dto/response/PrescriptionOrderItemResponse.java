package com.medistock.prescription.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionOrderItemResponse {
    private Long id;
    private Long medicineId;
    private String medicineCode;
    private String medicineName;
    private String genericName;
    private Boolean prescriptionRequired;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
}
