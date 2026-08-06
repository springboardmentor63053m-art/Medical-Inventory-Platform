package com.medistock.controller;

import com.medistock.model.StockMovement;
import com.medistock.service.StockMovementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/stock-movements")
@RequiredArgsConstructor
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
