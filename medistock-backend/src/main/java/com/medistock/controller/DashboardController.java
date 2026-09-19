package com.medistock.controller;

import com.medistock.dto.ApiResponse;
import com.medistock.dto.DashboardSummaryDTO;
import com.medistock.dto.SupplierDashboardDTO;
import com.medistock.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Dashboard Analytics & KPI Summary APIs")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    @Operation(summary = "Get Dashboard KPI Summary", description = "Aggregated KPI counts and recent activity history")
    public ResponseEntity<ApiResponse<DashboardSummaryDTO>> getDashboardSummary() {
        DashboardSummaryDTO summary = dashboardService.getDashboardSummary();
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/supplier")
    @Operation(summary = "Get Supplier Dashboard", description = "Isolated supplier dashboard profile, supplied medicines, purchase orders, and performance metrics")
    public ResponseEntity<ApiResponse<SupplierDashboardDTO>> getSupplierDashboard(
            @RequestParam(required = false) Long supplierId,
            Authentication authentication
    ) {
        SupplierDashboardDTO summary;
        if (supplierId != null) {
            summary = dashboardService.getSupplierDashboardSummary(supplierId);
        } else {
            String userEmail = authentication != null ? authentication.getName() : null;
            summary = dashboardService.getSupplierDashboardSummaryForUser(userEmail);
        }
        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}
