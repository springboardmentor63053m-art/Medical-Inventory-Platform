package com.medistock.service;

import com.medistock.dto.PageResponse;
import com.medistock.dto.SupplierDTO;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SupplierService {
    PageResponse<SupplierDTO> getAllSuppliers(String search, String status, Pageable pageable);
    List<SupplierDTO> getActiveSuppliers();
    SupplierDTO getSupplierById(Long id);
    SupplierDTO createSupplier(SupplierDTO dto);
    SupplierDTO updateSupplier(Long id, SupplierDTO dto);
    void deleteSupplier(Long id);
}
