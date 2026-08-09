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
@RequestMapping("/api/store/purchases")
@RequiredArgsConstructor
public class StorePurchaseController {

    private final PrescriptionService prescriptionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SYSTEM_ADMINISTRATOR', 'PHARMACIST')")
    public ResponseEntity<StorePurchaseResponse> createStorePurchase(
            @Valid @RequestBody CreateStorePurchaseRequest request,
            Authentication authentication) {
        String pharmacistEmail = authentication.getName();
        StorePurchaseResponse response = prescriptionService.createStorePurchase(pharmacistEmail, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SYSTEM_ADMINISTRATOR', 'PHARMACIST')")
    public ResponseEntity<List<StorePurchaseResponse>> getAllStorePurchases() {
        List<StorePurchaseResponse> purchases = prescriptionService.getAllStorePurchases();
        return ResponseEntity.ok(purchases);
    }
}
