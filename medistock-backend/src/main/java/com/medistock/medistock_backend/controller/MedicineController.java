package com.medistock.medistock_backend.controller;

import com.medistock.medistock_backend.dto.ApiResponse;
import com.medistock.medistock_backend.dto.MedicineFilterRequest;
import com.medistock.medistock_backend.dto.MedicineRequest;
import com.medistock.medistock_backend.dto.MedicineResponse;
import com.medistock.medistock_backend.service.MedicineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicines")
@RequiredArgsConstructor
public class MedicineController {

    private final MedicineService medicineService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllMedicines(MedicineFilterRequest filter) {
        if (filter.getPage() == null || filter.getSize() == null) {
            return ResponseEntity.ok(ApiResponse.success("Medicines retrieved successfully", medicineService.getAllMedicinesList(filter)));
        } else {
            return ResponseEntity.ok(ApiResponse.success("Medicines retrieved successfully", medicineService.getAllMedicines(filter)));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicineResponse>> getMedicineById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Medicine retrieved successfully", medicineService.getMedicineById(id)));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<MedicineResponse>> getMedicineByCode(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.success("Medicine retrieved successfully", medicineService.getMedicineByCode(code)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<MedicineResponse>>> searchMedicines(@RequestParam String query) {
        return ResponseEntity.ok(ApiResponse.success("Search results retrieved", medicineService.searchMedicines(query)));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<MedicineResponse>>> getMedicinesByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(ApiResponse.success("Medicines retrieved by category", medicineService.getMedicinesByCategory(categoryId)));
    }

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_PHARMACIST')")
    public ResponseEntity<ApiResponse<MedicineResponse>> createMedicine(@Valid @RequestBody MedicineRequest medicineRequest) {
        MedicineResponse created = medicineService.createMedicine(medicineRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Medicine created successfully", created));
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_PHARMACIST')")
    public ResponseEntity<ApiResponse<MedicineResponse>> updateMedicine(@PathVariable Long id, @Valid @RequestBody MedicineRequest medicineRequest) {
        return ResponseEntity.ok(ApiResponse.success("Medicine updated successfully", medicineService.updateMedicine(id, medicineRequest)));
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_PHARMACIST')")
    public ResponseEntity<ApiResponse<Void>> deleteMedicine(@PathVariable Long id) {
        medicineService.deleteMedicine(id);
        return ResponseEntity.ok(ApiResponse.success("Medicine deleted successfully", null));
    }
}
