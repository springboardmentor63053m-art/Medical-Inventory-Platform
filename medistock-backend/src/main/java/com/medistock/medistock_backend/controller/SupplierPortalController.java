package com.medistock.medistock_backend.controller;

import com.medistock.medistock_backend.dto.ApiResponse;
import com.medistock.medistock_backend.dto.MedicineRequest;
import com.medistock.medistock_backend.dto.MedicineResponse;
import com.medistock.medistock_backend.dto.SupplierDashboardDto;
import com.medistock.medistock_backend.dto.SupplierDto;
import com.medistock.medistock_backend.service.SupplierPortalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/supplier")
@RequiredArgsConstructor
public class SupplierPortalController {

    private final SupplierPortalService supplierPortalService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ROLE_SUPPLIER')")
    public ResponseEntity<ApiResponse<SupplierDashboardDto>> getSupplierDashboard(Authentication authentication) {
        String username = authentication.getName();
        SupplierDashboardDto dashboardData = supplierPortalService.getSupplierDashboard(username);
        return ResponseEntity.ok(ApiResponse.success("Supplier dashboard data retrieved successfully", dashboardData));
    }

    @PutMapping("/medicines/{medicineId}/availability")
    @PreAuthorize("hasRole('ROLE_SUPPLIER')")
    public ResponseEntity<ApiResponse<MedicineResponse>> updateMedicineAvailability(
            @PathVariable Long medicineId,
            @RequestParam Integer availableQuantity,
            Authentication authentication) {
        String username = authentication.getName();
        MedicineResponse updated = supplierPortalService.updateSupplierMedicineAvailability(username, medicineId, availableQuantity);
        return ResponseEntity.ok(ApiResponse.success("Supplier medicine availability updated successfully", updated));
    }

    @DeleteMapping("/medicines/{medicineId}")
    @PreAuthorize("hasRole('ROLE_SUPPLIER')")
    public ResponseEntity<ApiResponse<Void>> removeSupplierMedicine(
            @PathVariable Long medicineId,
            Authentication authentication) {
        String username = authentication.getName();
        supplierPortalService.removeSupplierMedicine(username, medicineId);
        return ResponseEntity.ok(ApiResponse.success("Medicine removed from supplier list successfully", null));
    }

    @PostMapping("/medicines")
    @PreAuthorize("hasRole('ROLE_SUPPLIER')")
    public ResponseEntity<ApiResponse<MedicineResponse>> addSupplierMedicine(
            @Valid @RequestBody MedicineRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        MedicineResponse created = supplierPortalService.addSupplierMedicine(username, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Supplier medicine added successfully", created));
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('ROLE_SUPPLIER')")
    public ResponseEntity<ApiResponse<SupplierDto>> getSupplierProfile(Authentication authentication) {
        String username = authentication.getName();
        SupplierDto profile = supplierPortalService.getSupplierProfile(username);
        return ResponseEntity.ok(ApiResponse.success("Supplier profile retrieved successfully", profile));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('ROLE_SUPPLIER')")
    public ResponseEntity<ApiResponse<SupplierDto>> updateSupplierProfile(
            @Valid @RequestBody SupplierDto request,
            Authentication authentication) {
        String username = authentication.getName();
        SupplierDto updated = supplierPortalService.updateSupplierProfile(username, request);
        return ResponseEntity.ok(ApiResponse.success("Supplier profile updated successfully", updated));
    }
}
