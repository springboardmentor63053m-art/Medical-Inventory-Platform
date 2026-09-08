package com.medistock.inventory.controller;

import com.medistock.inventory.dto.response.StockMovementResponse;
import com.medistock.inventory.service.StockMovementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock-movements")
@RequiredArgsConstructor
public class StockMovementController {

    private final StockMovementService stockMovementService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST', 'STAFF', 'USER', 'SUPPLIER')")
    public ResponseEntity<List<StockMovementResponse>> getStockMovements(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(stockMovementService.getMovements(type, search));
    }
}
