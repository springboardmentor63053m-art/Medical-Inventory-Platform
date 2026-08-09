package com.medistock.medistock_backend.controller;

import com.medistock.medistock_backend.dto.ApiResponse;
import com.medistock.medistock_backend.dto.SaleRequest;
import com.medistock.medistock_backend.dto.SaleResponse;
import com.medistock.medistock_backend.service.SaleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
public class SaleController {

    private final SaleService saleService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_STAFF')")
    public ResponseEntity<ApiResponse<SaleResponse>> createSale(
            @Valid @RequestBody SaleRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : null;
        SaleResponse created = saleService.createSale(request, username);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("POS Bill / Sale completed successfully", created));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_STAFF')")
    public ResponseEntity<ApiResponse<List<SaleResponse>>> getAllSales() {
        return ResponseEntity.ok(ApiResponse.success("Sales history retrieved successfully", saleService.getAllSales()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_STAFF')")
    public ResponseEntity<ApiResponse<SaleResponse>> getSaleById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Sale details retrieved successfully", saleService.getSaleById(id)));
    }
}
