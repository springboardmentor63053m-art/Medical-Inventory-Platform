package com.medistock.medistock_backend.controller;

import com.medistock.medistock_backend.dto.ApiResponse;
import com.medistock.medistock_backend.dto.StockMovementResponse;
import com.medistock.medistock_backend.service.StockMovementService;
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
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_STAFF')")
    public ResponseEntity<ApiResponse<List<StockMovementResponse>>> getAllMovements() {
        return ResponseEntity.ok(ApiResponse.success("Stock movements retrieved successfully", stockMovementService.getAllMovements()));
    }

    @GetMapping("/medicine/{medicineId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_STAFF', 'ROLE_DOCTOR', 'ROLE_USER')")
    public ResponseEntity<ApiResponse<List<StockMovementResponse>>> getMovementsByMedicine(@PathVariable Long medicineId) {
        return ResponseEntity.ok(ApiResponse.success("Stock movements retrieved for medicine", stockMovementService.getMovementsByMedicine(medicineId)));
    }
}
