package com.medistock.controller;

import com.medistock.dto.AdminDashboardResponse;
import com.medistock.dto.DashboardStatsResponse;
import com.medistock.dto.PharmacistDashboardResponse;
import com.medistock.dto.StaffDashboardResponse;
import com.medistock.service.AdminDashboardService;
import com.medistock.service.DashboardService;
import com.medistock.service.PharmacistDashboardService;
import com.medistock.service.StaffDashboardService;
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

    /** Generic summary — kept for backward compatibility / simple widgets. */
    @GetMapping("/stats")
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
}
