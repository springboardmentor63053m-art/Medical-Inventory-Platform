package com.medistock.controller;

import com.medistock.dto.MedicineRequest;
import com.medistock.model.Medicine;
import com.medistock.service.MedicineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medicines")
@RequiredArgsConstructor
public class MedicineController {

    private final MedicineService medicineService;

    @GetMapping
    public ResponseEntity<List<Medicine>> getAll(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category) {
        if (name != null || category != null) {
            return ResponseEntity.ok(medicineService.search(name, category));
        }
        return ResponseEntity.ok(medicineService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Medicine> getById(@PathVariable Long id) {
        return ResponseEntity.ok(medicineService.getById(id));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<Medicine>> lowStock() {
        return ResponseEntity.ok(medicineService.getLowStock());
    }

    @GetMapping("/out-of-stock")
    public ResponseEntity<List<Medicine>> outOfStock() {
        return ResponseEntity.ok(medicineService.getOutOfStock());
    }

    @GetMapping("/near-expiry")
    public ResponseEntity<List<Medicine>> nearExpiry(@RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(medicineService.getNearExpiry(days));
    }

    @GetMapping("/expired")
    public ResponseEntity<List<Medicine>> expired() {
        return ResponseEntity.ok(medicineService.getExpired());
    }

    @PostMapping
    public ResponseEntity<Medicine> create(@Valid @RequestBody MedicineRequest request) {
        return ResponseEntity.ok(medicineService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Medicine> update(@PathVariable Long id, @Valid @RequestBody MedicineRequest request) {
        return ResponseEntity.ok(medicineService.update(id, request));
    }

    @PatchMapping("/{id}/adjust-stock")
    public ResponseEntity<Medicine> adjustStock(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        int delta = body.get("delta") != null ? ((Number) body.get("delta")).intValue() : 0;
        String reason = body.get("reason") != null ? body.get("reason").toString() : null;
        return ResponseEntity.ok(medicineService.adjustStock(id, delta, reason));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        medicineService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
