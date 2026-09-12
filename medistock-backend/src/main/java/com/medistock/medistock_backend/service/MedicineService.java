package com.medistock.medistock_backend.service;

import com.medistock.medistock_backend.dto.MedicineFilterRequest;
import com.medistock.medistock_backend.dto.MedicineRequest;
import com.medistock.medistock_backend.dto.MedicineResponse;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.util.List;

public interface MedicineService {
    Page<MedicineResponse> getAllMedicines(MedicineFilterRequest filter);
    List<MedicineResponse> getAllMedicinesList(MedicineFilterRequest filter);
    MedicineResponse getMedicineById(Long id);
    MedicineResponse getMedicineByCode(String code);
    List<MedicineResponse> searchMedicines(String query);
    List<MedicineResponse> getMedicinesByCategory(Long categoryId);
    MedicineResponse createMedicine(MedicineRequest medicineRequest);
    MedicineResponse updateMedicine(Long id, MedicineRequest medicineRequest);
    void deleteMedicine(Long id);
    void bulkUpdateSupplierSellingPrice(Long supplierId, BigDecimal markupPercentage, BigDecimal fixedSellingPrice);
}
