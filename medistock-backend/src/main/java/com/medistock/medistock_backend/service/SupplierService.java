package com.medistock.medistock_backend.service;

import com.medistock.medistock_backend.dto.SupplierDto;

import java.util.List;

public interface SupplierService {
    List<SupplierDto> getAllSuppliers();
    SupplierDto getSupplierById(Long id);
    SupplierDto createSupplier(SupplierDto supplierDto);
    SupplierDto updateSupplier(Long id, SupplierDto supplierDto);
    void deleteSupplier(Long id);
}
