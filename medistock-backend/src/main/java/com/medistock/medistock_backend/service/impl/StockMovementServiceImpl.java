package com.medistock.medistock_backend.service.impl;

import com.medistock.medistock_backend.dto.StockMovementResponse;
import com.medistock.medistock_backend.entity.*;
import com.medistock.medistock_backend.exception.ResourceNotFoundException;
import com.medistock.medistock_backend.repository.*;
import com.medistock.medistock_backend.service.StockMovementService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockMovementServiceImpl implements StockMovementService {

    private final StockMovementRepository stockMovementRepository;
    private final BatchRepository batchRepository;
    private final MedicineRepository medicineRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public StockMovementResponse logMovement(Long medicineId, String batchNo, MovementType type, Integer quantity, String username) {
        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + medicineId));

        String finalBatchNo = batchNo;
        if (finalBatchNo == null || finalBatchNo.isBlank()) {
            finalBatchNo = medicine.getBatchNumber();
        }
        if (finalBatchNo == null || finalBatchNo.isBlank()) {
            finalBatchNo = "DEFAULT";
        }

        String finalBatchNoQuery = finalBatchNo;
        Batch batch = batchRepository.findByMedicineIdAndBatchNo(medicineId, finalBatchNoQuery)
                .orElseGet(() -> {
                    Batch newBatch = Batch.builder()
                            .medicine(medicine)
                            .batchNo(finalBatchNoQuery)
                            .mfgDate(LocalDate.now())
                            .expiryDate(medicine.getExpiryDate() != null ? medicine.getExpiryDate() : LocalDate.now().plusYears(2))
                            .build();
                    return batchRepository.save(newBatch);
                });

        User user = null;
        if (username != null && !username.isBlank()) {
            user = userRepository.findByUsername(username).orElse(null);
        } else {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                Object principal = auth.getPrincipal();
                if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
                    user = userRepository.findByUsername(((org.springframework.security.core.userdetails.UserDetails) principal).getUsername()).orElse(null);
                } else if (principal instanceof String) {
                    user = userRepository.findByUsername((String) principal).orElse(null);
                }
            }
        }

        StockMovement movement = StockMovement.builder()
                .batch(batch)
                .type(type)
                .quantity(quantity)
                .user(user)
                .build();

        StockMovement savedMovement = stockMovementRepository.save(movement);
        return mapToResponse(savedMovement);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockMovementResponse> getAllMovements() {
        return stockMovementRepository.findAllByOrderByDateDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockMovementResponse> getMovementsByMedicine(Long medicineId) {
        return stockMovementRepository.findByBatchMedicineIdOrderByDateDesc(medicineId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private StockMovementResponse mapToResponse(StockMovement sm) {
        String batchNo = sm.getBatch() != null ? sm.getBatch().getBatchNo() : "N/A";
        Long medicineId = null;
        String medicineName = "N/A";
        String medicineCode = "N/A";

        if (sm.getBatch() != null && sm.getBatch().getMedicine() != null) {
            Medicine medicine = sm.getBatch().getMedicine();
            medicineId = medicine.getId();
            medicineName = medicine.getName();
            medicineCode = medicine.getCode();
        }

        Long userId = sm.getUser() != null ? sm.getUser().getId() : null;
        String username = sm.getUser() != null ? sm.getUser().getUsername() : "System";

        return StockMovementResponse.builder()
                .id(sm.getId())
                .batchId(sm.getBatch() != null ? sm.getBatch().getId() : null)
                .batchNo(batchNo)
                .medicineId(medicineId)
                .medicineName(medicineName)
                .medicineCode(medicineCode)
                .type(sm.getType())
                .quantity(sm.getQuantity())
                .date(sm.getDate())
                .userId(userId)
                .username(username)
                .build();
    }
}
