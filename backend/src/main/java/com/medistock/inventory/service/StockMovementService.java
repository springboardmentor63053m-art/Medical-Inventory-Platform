package com.medistock.inventory.service;

import com.medistock.inventory.dto.response.StockMovementResponse;
import com.medistock.inventory.entity.StockMovement;
import com.medistock.medicine.entity.Medicine;

import java.util.List;

public interface StockMovementService {

    StockMovement recordMovement(Medicine medicine, String batchNumber, String movementType,
                                 int quantity, int previousQuantity, int newQuantity,
                                 String performedBy, String reason);

    List<StockMovementResponse> getMovements(String movementType, String search);

    List<StockMovementResponse> getMovementsByMedicineId(Long medicineId);
}
