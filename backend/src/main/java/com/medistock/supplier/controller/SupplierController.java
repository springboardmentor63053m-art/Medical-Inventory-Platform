package com.medistock.supplier.controller;

import com.medistock.supplier.dto.request.SupplierRequest;
import com.medistock.supplier.dto.response.SupplierResponse;
import com.medistock.supplier.service.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<SupplierResponse> createSupplier(@Valid @RequestBody SupplierRequest request) {
        SupplierResponse response = supplierService.createSupplier(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST', 'STAFF', 'SUPPLIER')")
    public ResponseEntity<List<SupplierResponse>> getAllSuppliers() {
        return ResponseEntity.ok(supplierService.getAllSuppliers());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST', 'SUPPLIER')")
    public ResponseEntity<SupplierResponse> getSupplierById(@PathVariable Long id) {
        return ResponseEntity.ok(supplierService.getSupplierById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<SupplierResponse> updateSupplier(@PathVariable Long id, @Valid @RequestBody SupplierRequest request) {
        return ResponseEntity.ok(supplierService.updateSupplier(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.ok(Map.of("message", "Supplier deleted successfully"));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST', 'SUPPLIER')")
    public ResponseEntity<List<SupplierResponse>> searchSuppliers(@RequestParam String name) {
        return ResponseEntity.ok(supplierService.searchSuppliers(name));
    }

    private String getAuthenticatedEmail(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new org.springframework.security.access.AccessDeniedException("Authentication is required");
        }
        return authentication.getName();
    }

    private Long resolveAuthorizedSupplierId(String idStr, Authentication authentication) {
        String email = getAuthenticatedEmail(authentication);
        boolean isSupplier = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equalsIgnoreCase("ROLE_SUPPLIER") || a.getAuthority().equalsIgnoreCase("SUPPLIER"));

        if ("me".equalsIgnoreCase(idStr)) {
            return supplierService.getSupplierByEmail(email).getId();
        }

        Long supplierId;
        try {
            supplierId = Long.parseLong(idStr);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid supplier ID: " + idStr);
        }

        if (isSupplier) {
            Long mySupplierId = supplierService.getSupplierByEmail(email).getId();
            if (!supplierId.equals(mySupplierId)) {
                throw new org.springframework.security.access.AccessDeniedException("Suppliers can only access their own supplier catalog");
            }
        }
        return supplierId;
    }

    @GetMapping("/{id}/medicines")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST', 'SUPPLIER')")
    public ResponseEntity<List<SupplierResponse.SuppliedMedicineDto>> getMedicinesBySupplier(
            @PathVariable String id,
            Authentication authentication
    ) {
        Long supplierId = resolveAuthorizedSupplierId(id, authentication);
        return ResponseEntity.ok(supplierService.getMedicinesBySupplier(supplierId));
    }

    @PostMapping("/{id}/medicines/{medicineId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST', 'SUPPLIER')")
    public ResponseEntity<SupplierResponse> linkMedicineToSupplier(
            @PathVariable String id,
            @PathVariable Long medicineId,
            Authentication authentication
    ) {
        Long supplierId = resolveAuthorizedSupplierId(id, authentication);
        return ResponseEntity.ok(supplierService.linkMedicineToSupplier(supplierId, medicineId));
    }

    @DeleteMapping("/{id}/medicines/{medicineId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST', 'SUPPLIER')")
    public ResponseEntity<SupplierResponse> unlinkMedicineFromSupplier(
            @PathVariable String id,
            @PathVariable Long medicineId,
            Authentication authentication
    ) {
        Long supplierId = resolveAuthorizedSupplierId(id, authentication);
        return ResponseEntity.ok(supplierService.unlinkMedicineFromSupplier(supplierId, medicineId));
    }
}
