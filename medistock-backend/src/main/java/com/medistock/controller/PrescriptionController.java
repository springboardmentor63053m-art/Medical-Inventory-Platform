package com.medistock.controller;

import com.medistock.dto.ApiResponse;
import com.medistock.dto.FulfillPrescriptionRequest;
import com.medistock.dto.PageResponse;
import com.medistock.dto.PrescriptionDTO;
import com.medistock.dto.SaleDTO;
import com.medistock.enums.PrescriptionStatus;
import com.medistock.security.CustomUserDetails;
import com.medistock.service.PrescriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
@Tag(name = "Prescriptions", description = "Prescription Upload & Admin Verification APIs")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload Prescription", description = "Upload prescription image for verification")
    public ResponseEntity<ApiResponse<PrescriptionDTO>> uploadPrescription(
            @RequestParam("customerId") Long customerId,
            @RequestParam("file") MultipartFile file
    ) {
        PrescriptionDTO uploaded = prescriptionService.uploadPrescription(customerId, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(uploaded, "Prescription uploaded successfully. Pending admin approval."));
    }

    @GetMapping
    @Operation(summary = "Get All Prescriptions", description = "List all prescriptions with optional status filter")
    public ResponseEntity<ApiResponse<PageResponse<PrescriptionDTO>>> getAllPrescriptions(
            @RequestParam(required = false) PrescriptionStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PageResponse<PrescriptionDTO> prescriptions = prescriptionService.getAllPrescriptions(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(prescriptions));
    }

    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Get Customer Prescriptions", description = "List prescriptions for a customer")
    public ResponseEntity<ApiResponse<List<PrescriptionDTO>>> getCustomerPrescriptions(@PathVariable Long customerId) {
        List<PrescriptionDTO> prescriptions = prescriptionService.getCustomerPrescriptions(customerId);
        return ResponseEntity.ok(ApiResponse.success(prescriptions));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Prescription Details", description = "Fetch single prescription details")
    public ResponseEntity<ApiResponse<PrescriptionDTO>> getPrescriptionById(@PathVariable Long id) {
        PrescriptionDTO prescription = prescriptionService.getPrescriptionById(id);
        return ResponseEntity.ok(ApiResponse.success(prescription));
    }

    @PutMapping("/{id}/verify")
    @Operation(summary = "Verify Prescription (Admin)", description = "Approve or Reject prescription upload")
    public ResponseEntity<ApiResponse<PrescriptionDTO>> verifyPrescription(
            @PathVariable Long id,
            @RequestParam PrescriptionStatus status,
            @RequestParam(required = false) String adminNotes,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        PrescriptionDTO verified = prescriptionService.verifyPrescription(id, status, adminNotes, userDetails.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success(verified, "Prescription status updated to " + status));
    }

    @PostMapping("/{id}/fulfill")
    @Operation(summary = "Fulfill Prescription Order (Admin/Pharmacist)", description = "Deliver an approved online prescription order. Creates sale, deducts inventory stock, and marks prescription as FULFILLED.")
    public ResponseEntity<ApiResponse<SaleDTO>> fulfillPrescriptionOrder(
            @PathVariable Long id,
            @Valid @RequestBody FulfillPrescriptionRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        SaleDTO sale = prescriptionService.fulfillPrescriptionOrder(
                id, request.getItems(), userDetails.getUser().getId(), request.getDeliveryNotes()
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(sale, "Prescription order fulfilled. Sale created and inventory updated."));
    }

    @GetMapping("/{id}/image")
    @Operation(summary = "Serve Prescription Image", description = "Fetch prescription image binary")
    public ResponseEntity<Resource> getPrescriptionImage(@PathVariable Long id) {
        PrescriptionDTO dto = prescriptionService.getPrescriptionById(id);
        try {
            Path path = Paths.get(dto.getImagePath());
            Resource resource = new UrlResource(path.toUri());
            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .contentType(MediaType.IMAGE_JPEG)
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

