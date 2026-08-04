package com.medistock.medistock_backend.dto;

import com.medistock.medistock_backend.entity.MovementType;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockMovementResponse {
    private Long id;
    private Long batchId;
    private String batchNo;
    private Long medicineId;
    private String medicineName;
    private String medicineCode;
    private MovementType type;
    private Integer quantity;
    private LocalDateTime date;
    private Long userId;
    private String username;
}
