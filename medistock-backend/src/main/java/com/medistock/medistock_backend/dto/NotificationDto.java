package com.medistock.medistock_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDto {
    private String id;
    private String type; // CRITICAL, WARNING
    private String category; // EXPIRY, STOCK
    private String title;
    private String message;
    private Long medicineId;
    private String medicineName;
    private String medicineCode;
    private Long supplierId;
    private String supplierName;
    private Integer quantity;
    private Integer reorderLevel;
    private LocalDate expiryDate;
}
