package com.medistock.prescription.controller;

import com.medistock.prescription.dto.request.CreatePrescriptionOrderRequest;
import com.medistock.prescription.dto.request.VerifyPrescriptionRequest;
import com.medistock.prescription.dto.response.PrescriptionOrderResponse;
import com.medistock.prescription.service.PrescriptionService;
import com.medistock.prescription.entity.Prescription;
import com.medistock.prescription.entity.PrescriptionOrder;
import com.medistock.prescription.repository.PrescriptionRepository;
import com.medistock.prescription.repository.PrescriptionOrderRepository;
import com.medistock.user.entity.User;
import com.medistock.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions/orders")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
    private final UserRepository userRepository;
    private final PrescriptionOrderRepository prescriptionOrderRepository;
    private final PrescriptionRepository prescriptionRepository;

    @PostMapping
    public ResponseEntity<PrescriptionOrderResponse> createOrder(
            @Valid @RequestBody CreatePrescriptionOrderRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        PrescriptionOrderResponse response = prescriptionService.createPrescriptionOrder(user.getId(), request, null);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PrescriptionOrderResponse> createMultipartOrder(
            @Valid @RequestPart("order") CreatePrescriptionOrderRequest request,
            @RequestPart(value = "prescriptionFile", required = false) MultipartFile prescriptionFile,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + authentication.getName()));
        PrescriptionOrderResponse response = prescriptionService.createPrescriptionOrder(user.getId(), request, prescriptionFile);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}/document")
    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> getPrescriptionDocument(@PathVariable Long id, Authentication authentication) {
        PrescriptionOrder order = prescriptionOrderRepository.findById(id)
                .orElseThrow(() -> new com.medistock.common.exception.ResourceNotFoundException("Prescription order not found with id: " + id));

        String email = authentication.getName();
        boolean isOwner = order.getUser() != null && order.getUser().getEmail().equals(email);
        boolean isStaff = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_PHARMACIST"));

        if (!isOwner && !isStaff) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (order.getPrescription() == null || order.getPrescription().getPrescriptionFile() == null
                || order.getPrescription().getPrescriptionFile().length == 0) {
            return ResponseEntity.notFound().build();
        }

        byte[] fileBytes = order.getPrescription().getPrescriptionFile();
        String contentType = order.getPrescription().getPrescriptionContentType();
        String fileName = order.getPrescription().getPrescriptionFileName();
        String lowerFileName = fileName != null ? fileName.toLowerCase() : "";

        if (contentType == null || contentType.isEmpty() || "application/octet-stream".equals(contentType)) {
            if (lowerFileName.endsWith(".jpg") || lowerFileName.endsWith(".jpeg")) {
                contentType = "image/jpeg";
            } else if (lowerFileName.endsWith(".png")) {
                contentType = "image/png";
            } else if (lowerFileName.endsWith(".pdf")) {
                contentType = "application/pdf";
            } else {
                contentType = "application/octet-stream";
            }
        }

        if (fileName == null || fileName.isEmpty()) {
            fileName = "prescription-document";
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(fileBytes.length))
                .contentType(MediaType.parseMediaType(contentType))
                .body(fileBytes);
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
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<List<PrescriptionOrderResponse>> getAllOrders(
            @RequestParam(required = false) String status) {
        List<PrescriptionOrderResponse> orders = prescriptionService.getAllOrders(status);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<PrescriptionOrderResponse> getOrderById(@PathVariable Long id) {
        PrescriptionOrder order = prescriptionOrderRepository.findById(id)
                .orElseThrow(() -> new com.medistock.common.exception.ResourceNotFoundException("Prescription order not found with id: " + id));
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        boolean privileged = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_PHARMACIST"));
        if (!privileged && !order.getUser().getEmail().equals(email)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        PrescriptionOrderResponse response = prescriptionService.getOrderById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<PrescriptionOrderResponse> verifyOrder(
            @PathVariable Long id,
            @Valid @RequestBody VerifyPrescriptionRequest request,
            Authentication authentication) {
        String pharmacistEmail = authentication.getName();
        PrescriptionOrderResponse response = prescriptionService.verifyPrescriptionOrder(id, pharmacistEmail, request);
        return ResponseEntity.ok(response);
    }
}
