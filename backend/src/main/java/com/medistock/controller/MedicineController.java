package com.medistock.controller;

import com.medistock.dto.MedicineRequest;
import com.medistock.model.Medicine;
import com.medistock.security.CurrentUserProvider;
import com.medistock.service.MedicineService;
import com.medistock.service.UserActivityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Full medicine catalog. Read endpoints (list/get/search/low-stock/
 * out-of-stock/near-expiry/expired) are open to ADMIN, PHARMACIST and
 * STAFF. Write endpoints (create/update/adjust-stock) are restricted to
 * ADMIN and PHARMACIST — Staff can view and search medicines but must not
 * create, edit, or arbitrarily adjust stock (see Role Permission Model,
 * "STAFF MUST NOT ... Arbitrarily modify stock"). Delete is ADMIN-only.
 * SUPPLIER logins are intentionally excluded here — a supplier only sees
 * their own supplied medicines, via /api/dashboard/supplier.
 */
@RestController
@RequestMapping("/api/medicines")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','STAFF')")
public class MedicineController {

    private final MedicineService medicineService;
    private final UserActivityService userActivityService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping
    public ResponseEntity<List<Medicine>> getAll(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "false") boolean includeInactive) {
        if (name != null || category != null) {
            return ResponseEntity.ok(medicineService.search(name, category));
        }
        // "Show inactive medicines" is an Admin-only toggle (requirement 10) — Pharmacist/Staff
        // always get the active-only view regardless of what the client requests.
        boolean isAdmin = currentUserProvider.getCurrentUser() != null
                && currentUserProvider.getCurrentUser().getRole() == com.medistock.model.Role.ADMIN;
        if (includeInactive && isAdmin) {
            return ResponseEntity.ok(medicineService.getAllIncludingInactive());
        }
        return ResponseEntity.ok(medicineService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Medicine> getById(@PathVariable Long id) {
        return ResponseEntity.ok(medicineService.getById(id));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<Medicine>> lowStock() {
        return ResponseEntity.ok(medicineService.getLowStock());
    }

    @GetMapping("/out-of-stock")
    public ResponseEntity<List<Medicine>> outOfStock() {
        return ResponseEntity.ok(medicineService.getOutOfStock());
    }

    @GetMapping("/near-expiry")
    public ResponseEntity<List<Medicine>> nearExpiry(@RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(medicineService.getNearExpiry(days));
    }

    @GetMapping("/expired")
    public ResponseEntity<List<Medicine>> expired() {
        return ResponseEntity.ok(medicineService.getExpired());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public ResponseEntity<Medicine> create(@Valid @RequestBody MedicineRequest request) {
        Medicine medicine = medicineService.create(request);
        userActivityService.log(currentUserProvider.getCurrentUser(), "MEDICINE_ADDED", "Added " + medicine.getName());
        return ResponseEntity.ok(medicine);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public ResponseEntity<Medicine> update(@PathVariable Long id, @Valid @RequestBody MedicineRequest request) {
        Medicine medicine = medicineService.update(id, request);
        userActivityService.log(currentUserProvider.getCurrentUser(), "MEDICINE_UPDATED", "Updated " + medicine.getName());
        return ResponseEntity.ok(medicine);
    }

    @PatchMapping("/{id}/adjust-stock")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public ResponseEntity<Medicine> adjustStock(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        int delta = body.get("delta") != null ? ((Number) body.get("delta")).intValue() : 0;
        String reason = body.get("reason") != null ? body.get("reason").toString() : null;
        Medicine medicine = medicineService.adjustStock(id, delta, reason);
        userActivityService.log(currentUserProvider.getCurrentUser(),
                delta >= 0 ? "STOCK_RESTOCKED" : "STOCK_REDUCED",
                (delta >= 0 ? "Restocked " : "Reduced ") + medicine.getName() + " by " + Math.abs(delta));
        return ResponseEntity.ok(medicine);
    }

    /**
     * Damaged/expired stock removal — separate from adjust-stock so it's
     * always recorded as DAMAGE_REMOVAL/EXPIRED_REMOVAL (not a generic
     * MANUAL_ADJUSTMENT), matching the workflow Staff/Pharmacist are
     * described as following when they flag damaged or expired items.
     */
    @PatchMapping("/{id}/remove-stock")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public ResponseEntity<Medicine> removeStock(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        int quantity = body.get("quantity") != null ? ((Number) body.get("quantity")).intValue() : 0;
        String reason = body.get("reason") != null ? body.get("reason").toString() : null;
        String typeStr = body.get("type") != null ? body.get("type").toString() : "DAMAGE_REMOVAL";
        com.medistock.model.MovementType type = "EXPIRED".equalsIgnoreCase(typeStr)
                || "EXPIRED_REMOVAL".equalsIgnoreCase(typeStr)
                ? com.medistock.model.MovementType.EXPIRED_REMOVAL
                : com.medistock.model.MovementType.DAMAGE_REMOVAL;
        Medicine medicine = medicineService.removeStock(id, quantity, type, reason);
        userActivityService.log(currentUserProvider.getCurrentUser(),
                type == com.medistock.model.MovementType.EXPIRED_REMOVAL ? "EXPIRED_STOCK_REMOVED" : "DAMAGED_STOCK_REMOVED",
                "Removed " + quantity + " units of " + medicine.getName()
                        + (type == com.medistock.model.MovementType.EXPIRED_REMOVAL ? " (expired)" : " (damaged)"));
        return ResponseEntity.ok(medicine);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Medicine medicine = medicineService.getById(id);
        String name = medicine.getName();
        medicineService.delete(id);
        userActivityService.log(currentUserProvider.getCurrentUser(), "MEDICINE_DELETED", "Deleted " + name);
        return ResponseEntity.noContent().build();
    }
}
