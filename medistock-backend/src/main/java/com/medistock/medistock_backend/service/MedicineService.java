package com.medistock.medistock_backend.service;

import com.medistock.medistock_backend.dto.MedicineRequest;
import com.medistock.medistock_backend.dto.MedicineResponse;

import java.util.List;

public interface MedicineService {
    List<MedicineResponse> getAllMedicines();
    MedicineResponse getMedicineById(Long id);
    MedicineResponse getMedicineByCode(String code);
    List<MedicineResponse> searchMedicines(String query);
    List<MedicineResponse> getMedicinesByCategory(Long categoryId);
    MedicineResponse createMedicine(MedicineRequest medicineRequest);
    MedicineResponse updateMedicine(Long id, MedicineRequest medicineRequest);
    void deleteMedicine(Long id);
}
