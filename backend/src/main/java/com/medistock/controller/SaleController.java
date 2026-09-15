package com.medistock.controller;

import com.medistock.dto.SaleRequest;
import com.medistock.dto.SaleResponse;
import com.medistock.dto.SalesOverviewResponse;
import com.medistock.service.SaleService;
import com.medistock.service.SalesAnalyticsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Sales/billing (MediStock -> Customer). Creating a sale is a PHARMACIST/
 * STAFF action only — Admin oversees and audits sales (full history,
 * analytics) but does not sell medicines directly, per the platform's
 * role design. SUPPLIER is excluded entirely, same as Purchases/Medicines.
 */
@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
public class SaleController {

    private final SaleService saleService;
    private final SalesAnalyticsService salesAnalyticsService;

    /** Full sales history — Admin/Pharmacist only (Staff use /mine instead, per the role-security requirements). */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public ResponseEntity<List<SaleResponse>> getAll() {
        return ResponseEntity.ok(saleService.getAll());
    }

    /** The current user's own recorded sales — what Staff sees as "their" sales history. */
    @GetMapping("/mine")
    @PreAuthorize("hasAnyRole('PHARMACIST','STAFF')")
    public ResponseEntity<List<SaleResponse>> getMine() {
        return ResponseEntity.ok(saleService.getMine());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','STAFF')")
    public ResponseEntity<SaleResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(saleService.getById(id));
    }

    /** Admin is intentionally excluded — Admin oversees sales but does not sell medicines. */
    @PostMapping
    @PreAuthorize("hasAnyRole('PHARMACIST','STAFF')")
    public ResponseEntity<SaleResponse> create(@Valid @RequestBody SaleRequest request) {
        return ResponseEntity.ok(saleService.recordSale(request));
    }

    /** KPI cards + quarterly chart + top-selling medicines — Admin/Pharmacist only. */
    @GetMapping("/analytics")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public ResponseEntity<SalesOverviewResponse> analytics() {
        return ResponseEntity.ok(salesAnalyticsService.getSalesOverview());
    }
}
