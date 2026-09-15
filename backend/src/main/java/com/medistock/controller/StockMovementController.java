package com.medistock.controller;

import com.medistock.model.StockMovement;
import com.medistock.service.StockMovementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Full stock-movement audit trail. Excluded for SUPPLIER — internal to ADMIN/PHARMACIST/STAFF. */
@RestController
@RequestMapping("/api/stock-movements")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','STAFF')")
public class StockMovementController {

    private final StockMovementService stockMovementService;

    @GetMapping
    public ResponseEntity<List<StockMovement>> getAll() {
        return ResponseEntity.ok(stockMovementService.getAll());
    }

    @GetMapping("/medicine/{id}")
    public ResponseEntity<List<StockMovement>> getForMedicine(@PathVariable Long id) {
        return ResponseEntity.ok(stockMovementService.getForMedicine(id));
    }
}
