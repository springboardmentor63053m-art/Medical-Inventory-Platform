package com.medistock.supplier.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierResponse {
    private Long id;
    private String supplierCode;
    private String supplierName;
    private String contactPerson;
    private String phone;
    private String email;
    private String address;
    private String city;
    private String state;
    private String country;
    private Boolean active;
    private String employeeId;
    private String accountEmail;
    private Boolean accountEnabled;
    private List<SuppliedMedicineDto> medicines;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SuppliedMedicineDto {
        private Long id;
        private String medicineCode;
        private String name;
        private String genericName;
        private String manufacturer;
        private String dosage;
        private String categoryName;
        private BigDecimal unitPrice;
    }
}
