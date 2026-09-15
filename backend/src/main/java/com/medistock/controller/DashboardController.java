package com.medistock.controller;

import com.medistock.dto.AdminDashboardResponse;
import com.medistock.dto.DashboardStatsResponse;
import com.medistock.dto.PharmacistDashboardResponse;
import com.medistock.dto.StaffDashboardResponse;
import com.medistock.dto.SupplierDashboardResponse;
import com.medistock.service.AdminDashboardService;
import com.medistock.service.DashboardService;
import com.medistock.service.InventoryHealthService;
import com.medistock.service.PharmacistDashboardService;
import com.medistock.service.StaffDashboardService;
import com.medistock.service.SupplierDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final AdminDashboardService adminDashboardService;
    private final PharmacistDashboardService pharmacistDashboardService;
    private final StaffDashboardService staffDashboardService;
    private final SupplierDashboardService supplierDashboardService;
    private final InventoryHealthService inventoryHealthService;

    /** Generic summary — kept for backward compatibility / simple widgets. Internal roles only: Supplier accounts are scoped to their own data everywhere else in the app, and this endpoint returns global business figures. */
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','STAFF')")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminDashboardResponse> getAdminDashboard() {
        return ResponseEntity.ok(adminDashboardService.getStats());
    }

    @GetMapping("/pharmacist")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public ResponseEntity<PharmacistDashboardResponse> getPharmacistDashboard() {
        return ResponseEntity.ok(pharmacistDashboardService.getStats());
    }

    @GetMapping("/staff")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<StaffDashboardResponse> getStaffDashboard() {
        return ResponseEntity.ok(staffDashboardService.getStats());
    }

    /**
     * Supplier dashboard (documented as an optional role — see the User
     * Roles & Dashboard Guide, section 5). Deliberately SUPPLIER-only, not
     * ADMIN too: unlike the other three dashboards this one is scoped to a
     * single supplier's own data, so there's no sensible "admin view" of it.
     */
    /** Dead-stock detection + composite inventory health score (0-100). */
    @GetMapping("/inventory-health")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public ResponseEntity<com.medistock.dto.InventoryHealthResponse> getInventoryHealth() {
        return ResponseEntity.ok(inventoryHealthService.getHealth());
    }

    @GetMapping("/supplier")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<SupplierDashboardResponse> getSupplierDashboard() {
        return ResponseEntity.ok(supplierDashboardService.getStats());
    }
}
