package com.medistock.controller;

import com.medistock.model.SystemSettings;
import com.medistock.service.SystemSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Admin-tunable settings — currently just the near-expiry and dead-stock
 * windows (previously hardcoded to 30 / 90 days). Read is open to any
 * signed-in staff-facing role so the UI can show "expiring within N days"
 * consistently; only Admin can change the values.
 */
@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','STAFF')")
public class SystemSettingsController {

    private final SystemSettingsService systemSettingsService;

    @GetMapping
    public ResponseEntity<SystemSettings> get() {
        return ResponseEntity.ok(systemSettingsService.get());
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemSettings> update(@RequestBody Map<String, Object> body) {
        Integer nearExpiry = body.get("nearExpiryWindowDays") != null
                ? ((Number) body.get("nearExpiryWindowDays")).intValue() : null;
        Integer deadStock = body.get("deadStockWindowDays") != null
                ? ((Number) body.get("deadStockWindowDays")).intValue() : null;
        return ResponseEntity.ok(systemSettingsService.update(nearExpiry, deadStock));
    }
}
