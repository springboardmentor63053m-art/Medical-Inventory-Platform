package com.medistock.medistock_backend.service;

import com.medistock.medistock_backend.dto.MedicineRequest;
import com.medistock.medistock_backend.dto.MedicineResponse;
import com.medistock.medistock_backend.dto.SupplierDashboardDto;
import com.medistock.medistock_backend.dto.SupplierDto;

public interface SupplierPortalService {
    SupplierDashboardDto getSupplierDashboard(String username);
    MedicineResponse updateSupplierMedicineAvailability(String username, Long medicineId, Integer availableQuantity);
    void removeSupplierMedicine(String username, Long medicineId);
    MedicineResponse addSupplierMedicine(String username, MedicineRequest request);
    SupplierDto getSupplierProfile(String username);
    SupplierDto updateSupplierProfile(String username, SupplierDto request);
}
