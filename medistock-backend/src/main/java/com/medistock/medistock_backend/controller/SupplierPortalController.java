package com.medistock.medistock_backend.controller;

import com.medistock.medistock_backend.dto.ApiResponse;
import com.medistock.medistock_backend.dto.MedicineResponse;
import com.medistock.medistock_backend.dto.SupplierDashboardDto;
import com.medistock.medistock_backend.service.SupplierPortalService;
import lombok.RequiredArgsConstructor;
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
}
