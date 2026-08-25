package com.medicalinventory.controller;

import com.medicalinventory.entity.Prescription;
import com.medicalinventory.entity.User;
import com.medicalinventory.repository.UserRepository;
import com.medicalinventory.service.PrescriptionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/prescriptions")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
    private final UserRepository      userRepository;

    public PrescriptionController(PrescriptionService prescriptionService, UserRepository userRepository) {
        this.prescriptionService = prescriptionService;
        this.userRepository      = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Prescription>> getAll(
            @RequestParam(required = false) Prescription.PrescriptionStatus status) {
        if (status != null) {
            return ResponseEntity.ok(prescriptionService.getByStatus(status));
        }
        return ResponseEntity.ok(prescriptionService.getAll());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(prescriptionService.getStats());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Prescription> getById(@PathVariable Long id) {
        return ResponseEntity.ok(prescriptionService.getById(id));
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<List<Map<String, Object>>> checkAvailability(@PathVariable Long id) {
        return ResponseEntity.ok(prescriptionService.checkAvailability(id));
    }

    @PostMapping
    public ResponseEntity<Prescription> create(
            @RequestBody Prescription prescription,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.status(HttpStatus.CREATED).body(prescriptionService.create(prescription, user));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Prescription> approve(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(prescriptionService.approve(id, user));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Prescription> reject(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        String reason = body != null ? body.getOrDefault("reason", "Rejected by pharmacist") : "Rejected by pharmacist";
        return ResponseEntity.ok(prescriptionService.reject(id, reason, user));
    }

    @PutMapping("/{id}/dispense")
    public ResponseEntity<Map<String, Object>> dispense(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(prescriptionService.dispense(id, user));
    }
}
