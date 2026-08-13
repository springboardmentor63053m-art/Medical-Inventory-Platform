package com.medistock.inventory.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockMovementResponse {

    private Long id;
    private Long medicineId;
    private String medicineCode;
    private String medicineName;
    private String batchNumber;
    private String movementType;
    private Integer quantity;
    private Integer previousQuantity;
    private Integer newQuantity;
    private String performedBy;
    private String reason;
    private LocalDateTime timestamp;
}
