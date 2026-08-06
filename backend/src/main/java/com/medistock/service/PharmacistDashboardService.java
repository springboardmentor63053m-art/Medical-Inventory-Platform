package com.medistock.service;

import com.medistock.dto.PharmacistDashboardResponse;
import com.medistock.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class PharmacistDashboardService {

    private final MedicineRepository medicineRepository;
    private final PurchaseService purchaseService;

    public PharmacistDashboardResponse getStats() {
        return PharmacistDashboardResponse.builder()
                .purchasesThisMonth(purchaseService.countThisMonth())
                .spendThisMonth(purchaseService.spendThisMonth())
                .nearExpiryCount(medicineRepository.findNearExpiry(LocalDate.now().plusDays(30)).size())
                .expiredCount(medicineRepository.findExpired().size())
                .lowStockCount(medicineRepository.findLowStock().size())
                .topSuppliers(purchaseService.supplyInsights())
                .expiringMedicines(medicineRepository.findNearExpiry(LocalDate.now().plusDays(30)))
                .build();
    }
}
