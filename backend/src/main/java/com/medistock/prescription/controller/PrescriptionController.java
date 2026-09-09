package com.medistock.prescription.controller;

import com.medistock.prescription.dto.request.CreatePrescriptionOrderRequest;
import com.medistock.prescription.dto.request.VerifyPrescriptionRequest;
import com.medistock.prescription.dto.response.PrescriptionDocument;
import com.medistock.prescription.dto.response.PrescriptionOrderResponse;
import com.medistock.prescription.service.PrescriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions/orders")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PrescriptionOrderResponse> createOrder(
            @Valid @RequestBody CreatePrescriptionOrderRequest request,
            Authentication authentication) {
        PrescriptionOrderResponse response = prescriptionService.createPrescriptionOrderForEmail(
                authentication.getName(), request, null
        );
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PrescriptionOrderResponse> createMultipartOrder(
            @Valid @RequestPart("order") CreatePrescriptionOrderRequest request,
            @RequestPart(value = "prescriptionFile", required = false) MultipartFile prescriptionFile,
            Authentication authentication) {
        PrescriptionOrderResponse response = prescriptionService.createPrescriptionOrderForEmail(
                authentication.getName(), request, prescriptionFile
        );
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}/document")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> getPrescriptionDocument(@PathVariable Long id, Authentication authentication) {
        boolean isStaff = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_PHARMACIST"));

        PrescriptionDocument doc = prescriptionService.getPrescriptionDocument(id, authentication.getName(), isStaff);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + doc.getFileName() + "\"")
                .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(doc.getFileBytes().length))
                .contentType(MediaType.parseMediaType(doc.getContentType()))
                .body(doc.getFileBytes());
    }

    @GetMapping("/my-orders")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PrescriptionOrderResponse>> getMyOrders(Authentication authentication) {
        List<PrescriptionOrderResponse> orders = prescriptionService.getUserOrdersByEmail(authentication.getName());
        return ResponseEntity.ok(orders);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<List<PrescriptionOrderResponse>> getAllOrders(
            @RequestParam(required = false) String status) {
        List<PrescriptionOrderResponse> orders = prescriptionService.getAllOrders(status);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PrescriptionOrderResponse> getOrderById(@PathVariable Long id, Authentication authentication) {
        boolean isStaff = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_PHARMACIST"));
        PrescriptionOrderResponse response = prescriptionService.getOrderByIdForUser(id, authentication.getName(), isStaff);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<PrescriptionOrderResponse> verifyOrder(
            @PathVariable Long id,
            @Valid @RequestBody VerifyPrescriptionRequest request,
            Authentication authentication) {
        PrescriptionOrderResponse response = prescriptionService.verifyPrescriptionOrder(id, authentication.getName(), request);
        return ResponseEntity.ok(response);
    }
}
