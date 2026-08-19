package com.medistock.notification.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

    private String id;
    private String type;
    private String severity;

    private String title;
    private String message;

    private Long inventoryId;
    private String medicineName;
    private String batchNumber;

    private Integer quantity;
    private Integer minimumStock;
    private LocalDate expiryDate;

    private LocalDateTime generatedAt;
}