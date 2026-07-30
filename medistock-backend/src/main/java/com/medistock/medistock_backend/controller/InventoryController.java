package com.medistock.medistock_backend.controller;

import com.medistock.medistock_backend.dto.ApiResponse;
import com.medistock.medistock_backend.dto.InventoryRequest;
import com.medistock.medistock_backend.dto.InventoryResponse;
import com.medistock.medistock_backend.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<InventoryResponse>>> getAllInventory() {
        return ResponseEntity.ok(ApiResponse.success("Inventory retrieved successfully", inventoryService.getAllInventory()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InventoryResponse>> getInventoryById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Inventory item retrieved successfully", inventoryService.getInventoryById(id)));
    }

    @GetMapping("/medicine/{medicineId}")
    public ResponseEntity<ApiResponse<InventoryResponse>> getInventoryByMedicineId(@PathVariable Long medicineId) {
        return ResponseEntity.ok(ApiResponse.success("Inventory item retrieved successfully", inventoryService.getInventoryByMedicineId(medicineId)));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<InventoryResponse>>> getLowStockInventory() {
        return ResponseEntity.ok(ApiResponse.success("Low stock items retrieved", inventoryService.getLowStockInventory()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<InventoryResponse>> updateInventory(@PathVariable Long id, @Valid @RequestBody InventoryRequest inventoryRequest) {
        return ResponseEntity.ok(ApiResponse.success("Inventory updated successfully", inventoryService.updateInventory(id, inventoryRequest)));
    }

    @PatchMapping("/medicine/{medicineId}/stock")
    public ResponseEntity<ApiResponse<InventoryResponse>> updateStockQuantity(
            @PathVariable Long medicineId,
            @RequestParam Integer delta) {
        return ResponseEntity.ok(ApiResponse.success("Stock quantity updated", inventoryService.updateStockQuantity(medicineId, delta)));
    }
}
