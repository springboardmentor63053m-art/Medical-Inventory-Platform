package com.medistock.medistock_backend.controller;

import com.medistock.medistock_backend.dto.ApiResponse;
import com.medistock.medistock_backend.dto.DashboardSummaryDto;
import com.medistock.medistock_backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_STAFF')")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardSummaryDto>> getDashboardSummary() {
        return ResponseEntity.ok(ApiResponse.success("Dashboard metrics retrieved successfully", dashboardService.getDashboardSummary()));
    }
}
