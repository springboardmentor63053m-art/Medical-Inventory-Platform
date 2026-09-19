package com.medistock.controller;

import com.medistock.dto.ApiResponse;
import com.medistock.dto.ExpiryTrackingDTO;
import com.medistock.dto.PageResponse;
import com.medistock.enums.ExpiryStatus;
import com.medistock.service.ExpiryTrackingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expiry")
@Tag(name = "Expiry Tracking", description = "Medicine Expiry Monitoring APIs")
public class ExpiryTrackingController {

    private final ExpiryTrackingService expiryTrackingService;

    public ExpiryTrackingController(ExpiryTrackingService expiryTrackingService) {
        this.expiryTrackingService = expiryTrackingService;
    }

    @PostMapping
    @Operation(summary = "Add Expiry Batch Record", description = "Record medicine batch expiry date and quantity")
    public ResponseEntity<ApiResponse<ExpiryTrackingDTO>> addExpiryRecord(@Valid @RequestBody ExpiryTrackingDTO dto) {
        ExpiryTrackingDTO created = expiryTrackingService.addExpiryRecord(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Expiry record added successfully"));
    }

    @GetMapping
    @Operation(summary = "Get All Expiry Records", description = "Paginated listing & status filtering")
    public ResponseEntity<ApiResponse<PageResponse<ExpiryTrackingDTO>>> getAllExpiryRecords(
            @RequestParam(required = false) ExpiryStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "expiryDate") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        PageResponse<ExpiryTrackingDTO> pageResponse = expiryTrackingService.getAllExpiryRecords(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    @GetMapping("/expiring-soon")
    @Operation(summary = "Get Expiring Soon Batches", description = "List medicines expiring within 30 days")
    public ResponseEntity<ApiResponse<List<ExpiryTrackingDTO>>> getExpiringSoon() {
        List<ExpiryTrackingDTO> list = expiryTrackingService.getExpiringSoon();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/expired")
    @Operation(summary = "Get Expired Batches", description = "List medicines that are already expired")
    public ResponseEntity<ApiResponse<List<ExpiryTrackingDTO>>> getExpired() {
        List<ExpiryTrackingDTO> list = expiryTrackingService.getExpired();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/summary")
    @Operation(summary = "Get Expiry Summary Statistics", description = "Get counts and quantities of active, expiring soon, and expired medicines")
    public ResponseEntity<ApiResponse<com.medistock.dto.ExpiryTrackingSummaryDTO>> getExpirySummary() {
        com.medistock.dto.ExpiryTrackingSummaryDTO summary = expiryTrackingService.getExpirySummary();
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/{medicineId}")
    @Operation(summary = "Get Expiry Records by Medicine ID", description = "List expiry records for a specific medicine")
    public ResponseEntity<ApiResponse<List<ExpiryTrackingDTO>>> getExpiryByMedicineId(@PathVariable Long medicineId) {
        List<ExpiryTrackingDTO> list = expiryTrackingService.getExpiryRecordsByMedicineIdList(medicineId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/trigger-check")
    @Operation(summary = "Trigger Manual Expiry Check", description = "Manually trigger background check and update statuses")
    public ResponseEntity<ApiResponse<Void>> triggerExpiryCheck() {
        expiryTrackingService.updateExpiryStatuses();
        return ResponseEntity.ok(ApiResponse.success(null, "Expiry status check triggered successfully"));
    }
}

