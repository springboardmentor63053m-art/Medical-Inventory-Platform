package com.medistock.supplier.service;

import com.medistock.supplier.dto.request.SupplierRequest;
import com.medistock.supplier.dto.response.SupplierResponse;

import java.util.List;

public interface SupplierService {
    SupplierResponse createSupplier(SupplierRequest request);
    List<SupplierResponse> getAllSuppliers();
    SupplierResponse getSupplierById(Long id);
    SupplierResponse updateSupplier(Long id, SupplierRequest request);
    void deleteSupplier(Long id);
    List<SupplierResponse> searchSuppliers(String name);
    SupplierResponse linkMedicineToSupplier(Long supplierId, Long medicineId);
    SupplierResponse unlinkMedicineFromSupplier(Long supplierId, Long medicineId);
    List<SupplierResponse.SuppliedMedicineDto> getMedicinesBySupplier(Long supplierId);
    List<SupplierResponse.SuppliedMedicineDto> getMySupplierMedicines(String email);
    SupplierResponse addMedicineToSupplierByEmail(String email, Long medicineId);
    SupplierResponse removeMedicineFromSupplierByEmail(String email, Long medicineId);
}
