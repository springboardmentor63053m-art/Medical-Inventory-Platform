package com.medistock.medistock_backend.service;

import com.medistock.medistock_backend.dto.StockMovementResponse;
import com.medistock.medistock_backend.entity.MovementType;
import java.util.List;

public interface StockMovementService {
    StockMovementResponse logMovement(Long medicineId, String batchNo, MovementType type, Integer quantity, String username);
    List<StockMovementResponse> getAllMovements();
    List<StockMovementResponse> getMovementsByMedicine(Long medicineId);
}
