package com.medistock.service;

import com.medistock.dto.MedicineDTO;
import com.medistock.dto.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MedicineService {
    PageResponse<MedicineDTO> getAllMedicines(String search, String category, Pageable pageable);
    PageResponse<MedicineDTO> searchAndFilter(String search, String category, Long supplierId, String stockStatus, String batchNumber, Pageable pageable);
    MedicineDTO getMedicineById(Long id);
    MedicineDTO getMedicineByCode(String code);
    MedicineDTO createMedicine(MedicineDTO dto);
    MedicineDTO updateMedicine(Long id, MedicineDTO dto);
    void deleteMedicine(Long id);
    List<String> getAllCategories();
}
