package com.medicalinventory.controller;

import com.medicalinventory.entity.StockMovement;
import com.medicalinventory.repository.StockMovementRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/stock-movements")
public class StockMovementController {

    private final StockMovementRepository stockMovementRepository;

    public StockMovementController(StockMovementRepository stockMovementRepository) {
        this.stockMovementRepository = stockMovementRepository;
    }

    @GetMapping
    public ResponseEntity<List<StockMovement>> getAll(
            @RequestParam(required = false) Long medicineId,
            @RequestParam(required = false) StockMovement.MovementType type) {
        if (medicineId != null) {
            return ResponseEntity.ok(stockMovementRepository.findByMedicineIdOrderByCreatedAtDesc(medicineId));
        }
        if (type != null) {
            return ResponseEntity.ok(stockMovementRepository.findByMovementTypeOrderByCreatedAtDesc(type));
        }
        return ResponseEntity.ok(stockMovementRepository.findAll());
    }

    @GetMapping("/medicine/{medicineId}")
    public ResponseEntity<List<StockMovement>> getByMedicine(@PathVariable Long medicineId) {
        return ResponseEntity.ok(stockMovementRepository.findByMedicineIdOrderByCreatedAtDesc(medicineId));
    }
}
