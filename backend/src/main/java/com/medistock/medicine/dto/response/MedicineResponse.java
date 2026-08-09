package com.medistock.medicine.dto.response;

import com.medistock.category.dto.response.CategoryResponse;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

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
    private String genericName;
    private String manufacturer;
    private String dosage;
    private BigDecimal unitPrice;
    private Integer reorderLevel;
    private String description;
    private String status;
    private Boolean prescriptionRequired;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
