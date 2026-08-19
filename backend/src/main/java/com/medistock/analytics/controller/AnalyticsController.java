package com.medistock.analytics.controller;

import com.medistock.analytics.dto.response.InventoryAnalyticsResponse;
import com.medistock.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/inventory")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST', 'STAFF')")
    public ResponseEntity<InventoryAnalyticsResponse> getInventoryAnalytics() {
        return ResponseEntity.ok(
                analyticsService.getInventoryAnalytics()
        );
    }
}