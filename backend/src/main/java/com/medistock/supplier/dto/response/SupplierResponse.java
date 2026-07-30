package com.medistock.supplier.dto.response;

import lombok.*;
import java.time.LocalDateTime;

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
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
