package com.medistock.controller;

import com.medistock.dto.SupplierRequest;
import com.medistock.dto.SupplierSummaryResponse;
import com.medistock.model.Supplier;
import com.medistock.security.CurrentUserProvider;
import com.medistock.service.SupplierService;
import com.medistock.service.UserActivityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Supplier directory. GET is open to ADMIN, PHARMACIST and STAFF (Staff
 * need read access — e.g. to see who supplies a medicine — even though
 * they can't manage suppliers). Create/update/delete are ADMIN/PHARMACIST
 * only, per the Role-Based Functionality Comparison ("Manage suppliers":
 * Staff = No). SUPPLIER logins are excluded entirely — a supplier only
 * sees their own profile via /api/dashboard/supplier.
 */
@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;
    private final UserActivityService userActivityService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','STAFF')")
    public ResponseEntity<List<Supplier>> getAll() {
        return ResponseEntity.ok(supplierService.getAll());
    }

    /** Full supplier directory enriched with medicines-supplied count, stock health, and real purchase activity. */
    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','STAFF')")
    public ResponseEntity<List<SupplierSummaryResponse>> getSummaries() {
        return ResponseEntity.ok(supplierService.getSummaries());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','STAFF')")
    public ResponseEntity<Supplier> getById(@PathVariable Long id) {
        return ResponseEntity.ok(supplierService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public ResponseEntity<Supplier> create(@Valid @RequestBody SupplierRequest request) {
        Supplier supplier = supplierService.create(request);
        userActivityService.log(currentUserProvider.getCurrentUser(), "SUPPLIER_ADDED", "Added " + supplier.getName());
        return ResponseEntity.ok(supplier);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public ResponseEntity<Supplier> update(@PathVariable Long id, @Valid @RequestBody SupplierRequest request) {
        Supplier supplier = supplierService.update(id, request);
        userActivityService.log(currentUserProvider.getCurrentUser(), "SUPPLIER_UPDATED", "Updated " + supplier.getName());
        return ResponseEntity.ok(supplier);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Supplier supplier = supplierService.getById(id);
        String name = supplier.getName();
        supplierService.delete(id);
        userActivityService.log(currentUserProvider.getCurrentUser(), "SUPPLIER_DELETED", "Deleted " + name);
        return ResponseEntity.noContent().build();
    }
}
