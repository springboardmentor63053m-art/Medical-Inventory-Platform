package com.medistock.controller;

import com.medistock.dto.ApiResponse;
import com.medistock.dto.PageResponse;
import com.medistock.dto.StockLogDTO;
import com.medistock.enums.ActionType;
import com.medistock.service.StockLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/stock-logs", "/api/stocklogs"})
@Tag(name = "Stock Audit Logs", description = "Stock Audit Trail History APIs")
public class StockLogController {

    private final StockLogService stockLogService;

    public StockLogController(StockLogService stockLogService) {
        this.stockLogService = stockLogService;
    }

    @GetMapping
    @Operation(summary = "Get All Stock Logs", description = "Paginated stock movement audit trail history")
    public ResponseEntity<ApiResponse<PageResponse<StockLogDTO>>> getAllStockLogs(
            @RequestParam(required = false) ActionType actionType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PageResponse<StockLogDTO> logs;
        if (actionType != null) {
            logs = stockLogService.getStockLogsByActionType(actionType, pageable);
        } else {
            logs = stockLogService.getAllStockLogs(pageable);
        }

        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    @GetMapping("/medicine/{medicineId}")
    @Operation(summary = "Get Stock Logs by Medicine", description = "Audit trail history for a specific medicine")
    public ResponseEntity<ApiResponse<PageResponse<StockLogDTO>>> getStockLogsByMedicineId(
            @PathVariable Long medicineId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PageResponse<StockLogDTO> logs = stockLogService.getStockLogsByMedicineId(medicineId, pageable);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    @GetMapping("/{medicineId}")
    @Operation(summary = "Get Stock Logs by Medicine ID", description = "Audit trail history for a specific medicine ID")
    public ResponseEntity<ApiResponse<PageResponse<StockLogDTO>>> getStockLogsById(
            @PathVariable Long medicineId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PageResponse<StockLogDTO> logs = stockLogService.getStockLogsByMedicineId(medicineId, pageable);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }
}
