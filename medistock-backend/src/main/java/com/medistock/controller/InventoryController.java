package com.medistock.controller;

import com.medistock.dto.ApiResponse;
import com.medistock.dto.InventoryDTO;
import com.medistock.dto.PageResponse;
import com.medistock.dto.StockAdjustmentRequest;
import com.medistock.enums.ActionType;
import com.medistock.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
@Tag(name = "Inventory", description = "Stock & Inventory Level Management APIs")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    @Operation(summary = "Get All Inventory", description = "Paginated search & retrieval of inventory stock levels")
    public ResponseEntity<ApiResponse<PageResponse<InventoryDTO>>> getAllInventory(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "medicine.medicineName") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        PageResponse<InventoryDTO> inventory = inventoryService.getAllInventory(search, pageable);
        return ResponseEntity.ok(ApiResponse.success(inventory));
    }

    @GetMapping("/low-stock")
    @Operation(summary = "Get Low Stock Items", description = "Get items where quantity < minimum stock")
    public ResponseEntity<ApiResponse<PageResponse<InventoryDTO>>> getLowStockInventory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<InventoryDTO> lowStock = inventoryService.getLowStockInventory(pageable);
        return ResponseEntity.ok(ApiResponse.success(lowStock));
    }

    @GetMapping("/out-of-stock")
    @Operation(summary = "Get Out of Stock Items", description = "Get items where quantity == 0")
    public ResponseEntity<ApiResponse<PageResponse<InventoryDTO>>> getOutOfStockInventory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<InventoryDTO> outOfStock = inventoryService.getOutOfStockInventory(pageable);
        return ResponseEntity.ok(ApiResponse.success(outOfStock));
    }

    @GetMapping("/medicine/{medicineId}")
    @Operation(summary = "Get Inventory by Medicine ID", description = "Fetch inventory stock details for a medicine")
    public ResponseEntity<ApiResponse<InventoryDTO>> getInventoryByMedicineId(@PathVariable Long medicineId) {
        InventoryDTO dto = inventoryService.getInventoryByMedicineId(medicineId);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @GetMapping("/{medicineId}")
    @Operation(summary = "Get Inventory by Medicine ID", description = "Fetch inventory stock details for a medicine")
    public ResponseEntity<ApiResponse<InventoryDTO>> getInventoryById(@PathVariable Long medicineId) {
        InventoryDTO dto = inventoryService.getInventoryByMedicineId(medicineId);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PostMapping("/stock-in")
    @Operation(summary = "Increase Stock (Stock In)", description = "Perform Stock IN operation for a medicine")
    public ResponseEntity<ApiResponse<InventoryDTO>> stockIn(
            @Valid @RequestBody StockAdjustmentRequest request,
            Authentication authentication
    ) {
        String performedBy = authentication != null ? authentication.getName() : "System User";
        if (request.getLocation() != null || request.getStorageLocation() != null) {
            String loc = request.getLocation() != null ? request.getLocation() : request.getStorageLocation();
            try {
                inventoryService.updateInventoryThresholds(request.getMedicineId(), null, null, loc);
            } catch (Exception e) {}
        }
        InventoryDTO updated = inventoryService.adjustStock(
                request.getMedicineId(),
                request.getQuantity(),
                ActionType.IN,
                performedBy,
                request.getRemarks()
        );
        return ResponseEntity.ok(ApiResponse.success(updated, "Stock increased successfully"));
    }

    @PostMapping("/stock-out")
    @Operation(summary = "Decrease Stock (Stock Out)", description = "Perform Stock OUT operation for a medicine")
    public ResponseEntity<ApiResponse<InventoryDTO>> stockOut(
            @Valid @RequestBody StockAdjustmentRequest request,
            Authentication authentication
    ) {
        String performedBy = authentication != null ? authentication.getName() : "System User";
        InventoryDTO updated = inventoryService.adjustStock(
                request.getMedicineId(),
                request.getQuantity(),
                ActionType.OUT,
                performedBy,
                request.getRemarks()
        );
        return ResponseEntity.ok(ApiResponse.success(updated, "Stock decreased successfully"));
    }

    @PostMapping("/adjust")
    @Operation(summary = "Adjust Stock Quantity", description = "Set exact stock quantity for a medicine")
    public ResponseEntity<ApiResponse<InventoryDTO>> adjustStockPost(
            @Valid @RequestBody StockAdjustmentRequest request,
            Authentication authentication
    ) {
        String performedBy = authentication != null ? authentication.getName() : "System User";
        InventoryDTO updated = inventoryService.adjustStock(
                request.getMedicineId(),
                request.getQuantity(),
                ActionType.ADJUSTMENT,
                performedBy,
                request.getRemarks()
        );
        return ResponseEntity.ok(ApiResponse.success(updated, "Stock adjusted successfully"));
    }

    @PutMapping("/medicine/{medicineId}/adjust")
    @Operation(summary = "Adjust Stock Quantity", description = "Perform stock IN, OUT, or ADJUSTMENT on medicine quantity")
    public ResponseEntity<ApiResponse<InventoryDTO>> adjustStock(
            @PathVariable Long medicineId,
            @RequestParam Integer quantity,
            @RequestParam ActionType actionType,
            @RequestParam(required = false) String remarks,
            Authentication authentication
    ) {
        String performedBy = authentication != null ? authentication.getName() : "System User";
        InventoryDTO updated = inventoryService.adjustStock(medicineId, quantity, actionType, performedBy, remarks);
        return ResponseEntity.ok(ApiResponse.success(updated, "Stock adjusted successfully"));
    }

    @PutMapping("/medicine/{medicineId}/thresholds")
    @Operation(summary = "Update Inventory Thresholds", description = "Update minimum stock, maximum stock, and location")
    public ResponseEntity<ApiResponse<InventoryDTO>> updateThresholds(
            @PathVariable Long medicineId,
            @RequestParam(required = false) Integer minimumStock,
            @RequestParam(required = false) Integer maximumStock,
            @RequestParam(required = false) String location
    ) {
        InventoryDTO updated = inventoryService.updateInventoryThresholds(medicineId, minimumStock, maximumStock, location);
        return ResponseEntity.ok(ApiResponse.success(updated, "Thresholds updated successfully"));
    }
}
