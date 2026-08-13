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

    @PostMapping("/{id}/medicines/{medicineId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<SupplierResponse> linkMedicineToSupplier(@PathVariable Long id, @PathVariable Long medicineId) {
        return ResponseEntity.ok(supplierService.linkMedicineToSupplier(id, medicineId));
    }

    @DeleteMapping("/{id}/medicines/{medicineId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<SupplierResponse> unlinkMedicineFromSupplier(@PathVariable Long id, @PathVariable Long medicineId) {
        return ResponseEntity.ok(supplierService.unlinkMedicineFromSupplier(id, medicineId));
    }

    @GetMapping("/me/medicines")
    @PreAuthorize("hasAnyRole('SUPPLIER', 'ADMIN')")
    public ResponseEntity<List<SupplierResponse.SuppliedMedicineDto>> getMySupplierMedicines(Authentication authentication) {
        return ResponseEntity.ok(supplierService.getMySupplierMedicines(authentication != null ? authentication.getName() : "supplier@medistock.com"));
    }

    @PostMapping("/me/medicines/{medicineId}")
    @PreAuthorize("hasAnyRole('SUPPLIER', 'ADMIN')")
    public ResponseEntity<SupplierResponse> addMedicineToMySupplierCatalog(Authentication authentication, @PathVariable Long medicineId) {
        return ResponseEntity.ok(supplierService.addMedicineToSupplierByEmail(authentication != null ? authentication.getName() : "supplier@medistock.com", medicineId));
    }

    @DeleteMapping("/me/medicines/{medicineId}")
    @PreAuthorize("hasAnyRole('SUPPLIER', 'ADMIN')")
    public ResponseEntity<SupplierResponse> removeMedicineFromMySupplierCatalog(Authentication authentication, @PathVariable Long medicineId) {
        return ResponseEntity.ok(supplierService.removeMedicineFromSupplierByEmail(authentication != null ? authentication.getName() : "supplier@medistock.com", medicineId));
    }

    @GetMapping("/{id}/medicines")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST', 'SUPPLIER')")
    public ResponseEntity<List<SupplierResponse.SuppliedMedicineDto>> getMedicinesBySupplier(@PathVariable Long id) {
        return ResponseEntity.ok(supplierService.getMedicinesBySupplier(id));
    }
}
