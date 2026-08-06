package com.medistock.service;

import com.medistock.dto.DashboardStatsResponse;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final MedicineRepository medicineRepository;
    private final SupplierRepository supplierRepository;

    public DashboardStatsResponse getStats() {
        return DashboardStatsResponse.builder()
                .totalMedicines(medicineRepository.count())
                .totalSuppliers(supplierRepository.count())
                .lowStockCount(medicineRepository.findLowStock().size())
                .outOfStockCount(medicineRepository.findOutOfStock().size())
                .nearExpiryCount(medicineRepository.findNearExpiry(LocalDate.now().plusDays(30)).size())
                .expiredCount(medicineRepository.findExpired().size())
                .totalInventoryValue(medicineRepository.totalInventoryValue())
                .build();
    }
}
