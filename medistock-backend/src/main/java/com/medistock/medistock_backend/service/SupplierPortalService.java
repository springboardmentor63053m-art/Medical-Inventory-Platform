package com.medistock.medistock_backend.service;

import com.medistock.medistock_backend.dto.MedicineResponse;
import com.medistock.medistock_backend.dto.SupplierDashboardDto;

public interface SupplierPortalService {
    SupplierDashboardDto getSupplierDashboard(String username);
    MedicineResponse updateSupplierMedicineAvailability(String username, Long medicineId, Integer availableQuantity);
    void removeSupplierMedicine(String username, Long medicineId);
}
