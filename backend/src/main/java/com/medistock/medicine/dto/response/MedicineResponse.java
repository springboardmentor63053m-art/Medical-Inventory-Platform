package com.medistock.medicine.dto.response;

import com.medistock.category.dto.response.CategoryResponse;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineResponse {
    private Long id;
    private CategoryResponse category;
    private String medicineCode;
    private String name;
    private String brandName;
    private String genericName;
    private String manufacturer;
    private String dosage;
    private BigDecimal unitPrice;
    private Integer reorderLevel;
    private String description;
    private String status;
    private String drugClass;
    private String therapeuticClass;
    private String packSize;
    private String countryOfOrigin;
    private String licenseNo;
    private Boolean prescriptionRequired;
    private List<LinkedSupplierDto> suppliers;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public String getBrandName() {
        return brandName != null && !brandName.isBlank() ? brandName : name;
    }

    public String getDrugClass() {
        return drugClass != null && !drugClass.isBlank() ? drugClass : (category != null ? category.getName() : "Pharmaceutical Agent");
    }

    public String getTherapeuticClass() {
        return therapeuticClass != null && !therapeuticClass.isBlank() ? therapeuticClass : "Therapeutic Health Formulation";
    }

    public String getPackSize() {
        return packSize != null && !packSize.isBlank() ? packSize : "Standard Pack";
    }

    public String getCountryOfOrigin() {
        return countryOfOrigin != null && !countryOfOrigin.isBlank() ? countryOfOrigin : "India";
    }

    public String getLicenseNo() {
        return licenseNo != null && !licenseNo.isBlank() ? licenseNo : "MFG/DL-2024/FDA-08";
    }

    public Boolean getPrescriptionRequired() {
        return prescriptionRequired != null ? prescriptionRequired : true;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LinkedSupplierDto {
        private Long id;
        private String supplierCode;
        private String supplierName;
        private String contactPerson;
        private String phone;
        private String email;
        private String city;
        private String country;
    }
}
