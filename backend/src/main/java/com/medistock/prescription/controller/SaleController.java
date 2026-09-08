package com.medistock.prescription.controller;

import com.medistock.prescription.dto.request.CreateStorePurchaseRequest;
import com.medistock.prescription.dto.response.StorePurchaseResponse;
import com.medistock.prescription.service.PrescriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
public class SaleController {

    private final PrescriptionService prescriptionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<StorePurchaseResponse> createSale(
            @Valid @RequestBody CreateStorePurchaseRequest request,
            Authentication authentication) {
        String pharmacistEmail = authentication.getName();
        StorePurchaseResponse response = prescriptionService.createStorePurchase(pharmacistEmail, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<List<StorePurchaseResponse>> getAllSales() {
        List<StorePurchaseResponse> sales = prescriptionService.getAllStorePurchases();
        return ResponseEntity.ok(sales);
    }
}
