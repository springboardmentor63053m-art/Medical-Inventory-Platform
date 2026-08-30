package com.medistock.medistockbackend.controller;

import com.medistock.medistockbackend.dto.AnalyticsResponseDto;
import com.medistock.medistockbackend.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping
    public ResponseEntity<AnalyticsResponseDto> getAnalytics() {
        return ResponseEntity.ok(analyticsService.getAnalyticsSummary());
    }

    @GetMapping("/inventory")
    public ResponseEntity<AnalyticsResponseDto> getInventoryAnalytics() {
        return ResponseEntity.ok(analyticsService.getAnalyticsSummary());
    }
}
