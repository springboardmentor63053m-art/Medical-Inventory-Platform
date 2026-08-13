package com.medistock.medicine.service;

import com.medistock.medicine.dto.request.MedicineRequest;
import com.medistock.medicine.dto.response.MedicineResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface MedicineService {
    MedicineResponse createMedicine(MedicineRequest request);
    Page<MedicineResponse> getAllMedicines(int page, int size, String sortBy, String sortDir);
    MedicineResponse getMedicineById(Long id);
    MedicineResponse updateMedicine(Long id, MedicineRequest request);
    void deleteMedicine(Long id);
    List<MedicineResponse> searchMedicines(String name);
    List<MedicineResponse> getMedicinesByCategory(Long categoryId);
    List<MedicineResponse.LinkedSupplierDto> getSuppliersByMedicine(Long medicineId);
    Page<MedicineResponse> getMasterMedicineCatalog(int page, int size, String search, Long categoryId, Long supplierId);
}
