package com.medistock.prescription.controller;

import com.medistock.prescription.dto.request.CreatePrescriptionOrderRequest;
import com.medistock.prescription.dto.request.VerifyPrescriptionRequest;
import com.medistock.prescription.dto.response.PrescriptionOrderResponse;
import com.medistock.prescription.service.PrescriptionService;
import com.medistock.user.entity.User;
import com.medistock.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions/orders")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<PrescriptionOrderResponse> createOrder(
            @Valid @RequestBody CreatePrescriptionOrderRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        PrescriptionOrderResponse response = prescriptionService.createPrescriptionOrder(user.getId(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<PrescriptionOrderResponse>> getMyOrders(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        List<PrescriptionOrderResponse> orders = prescriptionService.getUserOrders(user.getId());
        return ResponseEntity.ok(orders);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SYSTEM_ADMINISTRATOR', 'PHARMACIST')")
    public ResponseEntity<List<PrescriptionOrderResponse>> getAllOrders(
            @RequestParam(required = false) String status) {
        List<PrescriptionOrderResponse> orders = prescriptionService.getAllOrders(status);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PrescriptionOrderResponse> getOrderById(@PathVariable Long id) {
        PrescriptionOrderResponse response = prescriptionService.getOrderById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('ADMIN', 'SYSTEM_ADMINISTRATOR', 'PHARMACIST')")
    public ResponseEntity<PrescriptionOrderResponse> verifyOrder(
            @PathVariable Long id,
            @Valid @RequestBody VerifyPrescriptionRequest request,
            Authentication authentication) {
        String pharmacistEmail = authentication.getName();
        PrescriptionOrderResponse response = prescriptionService.verifyPrescriptionOrder(id, pharmacistEmail, request);
        return ResponseEntity.ok(response);
    }
}
