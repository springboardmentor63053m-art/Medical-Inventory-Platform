package com.medicalinventory.controller;

import com.medicalinventory.entity.Medicine;
import com.medicalinventory.service.MedicineService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/medicines")
public class MedicineController {

    private final MedicineService medicineService;

    public MedicineController(MedicineService medicineService) {
        this.medicineService = medicineService;
    }

    @GetMapping
    public ResponseEntity<List<Medicine>> getAll(
            @RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(medicineService.searchMedicines(search));
        }
        return ResponseEntity.ok(medicineService.getAllMedicines());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Medicine> getById(@PathVariable Long id) {
        return ResponseEntity.ok(medicineService.getMedicineById(id));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Medicine>> getByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(medicineService.getMedicinesByCategory(categoryId));
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<Medicine>> getBySupplier(@PathVariable Long supplierId) {
        return ResponseEntity.ok(medicineService.getMedicinesBySupplier(supplierId));
    }

    @PostMapping
    public ResponseEntity<Medicine> create(@RequestBody Medicine medicine) {
        return ResponseEntity.status(HttpStatus.CREATED).body(medicineService.createMedicine(medicine));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Medicine> update(@PathVariable Long id, @RequestBody Medicine medicine) {
        return ResponseEntity.ok(medicineService.updateMedicine(id, medicine));
    }

    @PutMapping("/{medicineId}/link-supplier/{supplierId}")
    public ResponseEntity<Medicine> linkSupplier(@PathVariable Long medicineId, @PathVariable Long supplierId) {
        return ResponseEntity.ok(medicineService.linkSupplier(medicineId, supplierId));
    }

    @PutMapping("/{medicineId}/unlink-supplier")
    public ResponseEntity<Medicine> unlinkSupplier(@PathVariable Long medicineId) {
        return ResponseEntity.ok(medicineService.unlinkSupplier(medicineId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        medicineService.deleteMedicine(id);
        return ResponseEntity.noContent().build();
    }
}
