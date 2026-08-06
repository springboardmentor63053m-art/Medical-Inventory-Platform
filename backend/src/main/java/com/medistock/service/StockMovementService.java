package com.medistock.service;

import com.medistock.model.*;
import com.medistock.repository.StockMovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StockMovementService {

    private final StockMovementRepository stockMovementRepository;

    @Transactional
    public StockMovement log(Medicine medicine, MovementType type, int quantityChange,
                              int previousQuantity, int newQuantity, User performedBy, String note) {
        StockMovement movement = StockMovement.builder()
                .medicine(medicine)
                .type(type)
                .quantityChange(quantityChange)
                .previousQuantity(previousQuantity)
                .newQuantity(newQuantity)
                .performedBy(performedBy)
                .note(note)
                .build();
        return stockMovementRepository.save(movement);
    }

    public List<StockMovement> getAll() {
        return stockMovementRepository.findAllByOrderByTimestampDesc();
    }

    public List<StockMovement> getForMedicine(Long medicineId) {
        return stockMovementRepository.findByMedicine_IdOrderByTimestampDesc(medicineId);
    }
}
