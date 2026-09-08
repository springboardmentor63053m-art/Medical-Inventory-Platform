package com.medistock.inventory.service.impl;

import com.medistock.inventory.dto.response.StockMovementResponse;
import com.medistock.inventory.entity.StockMovement;
import com.medistock.inventory.entity.StockMovementType;
import com.medistock.inventory.repository.StockMovementRepository;
import com.medistock.inventory.service.StockMovementService;
import com.medistock.medicine.entity.Medicine;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockMovementServiceImpl implements StockMovementService {

    private final StockMovementRepository stockMovementRepository;

    @Override
    @Transactional
    public StockMovement recordMovement(Medicine medicine, String batchNumber, String movementType,
                                         int quantity, int previousQuantity, int newQuantity,
                                         String performedBy, String reason) {
        String actor = performedBy;
        if (actor == null || actor.isBlank()) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                actor = auth.getName();
            } else {
                actor = "Pharmacist System";
            }
        }

        StockMovementType typeEnum;
        try {
            typeEnum = StockMovementType.valueOf(movementType.toUpperCase());
        } catch (Exception e) {
            typeEnum = StockMovementType.ADJUSTMENT;
        }

        StockMovement movement = StockMovement.builder()
                .medicine(medicine)
                .medicineCode(medicine != null ? medicine.getMedicineCode() : null)
                .medicineName(medicine != null ? medicine.getName() : null)
                .batchNumber(batchNumber)
                .movementType(typeEnum)
                .quantity(quantity)
                .previousQuantity(previousQuantity)
                .newQuantity(newQuantity)
                .performedBy(actor)
                .reason(reason)
                .timestamp(LocalDateTime.now())
                .build();

        return stockMovementRepository.save(movement);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockMovementResponse> getMovements(String movementType, String search) {
        List<StockMovement> movements = stockMovementRepository.searchMovements(
                (movementType != null && !movementType.isBlank() && !"ALL".equalsIgnoreCase(movementType)) ? movementType : null,
                (search != null && !search.isBlank()) ? search.trim() : null
        );
        return movements.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockMovementResponse> getMovementsByMedicineId(Long medicineId) {
        return stockMovementRepository.findByMedicineIdOrderByTimestampDesc(medicineId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private StockMovementResponse mapToResponse(StockMovement sm) {
        return StockMovementResponse.builder()
                .id(sm.getId())
                .medicineId(sm.getMedicine() != null ? sm.getMedicine().getId() : null)
                .medicineCode(sm.getMedicineCode() != null ? sm.getMedicineCode() : (sm.getMedicine() != null ? sm.getMedicine().getMedicineCode() : ""))
                .medicineName(sm.getMedicineName() != null ? sm.getMedicineName() : (sm.getMedicine() != null ? sm.getMedicine().getName() : ""))
                .batchNumber(sm.getBatchNumber())
                .movementType(sm.getMovementType() != null ? sm.getMovementType().name() : "ADJUSTMENT")
                .quantity(sm.getQuantity())
                .previousQuantity(sm.getPreviousQuantity())
                .newQuantity(sm.getNewQuantity())
                .performedBy(sm.getPerformedBy() != null ? sm.getPerformedBy() : "System")
                .reason(sm.getReason() != null ? sm.getReason() : "Stock Adjustment")
                .timestamp(sm.getTimestamp())
                .build();
    }
}
