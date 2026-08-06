package com.medistock.service;

import com.medistock.dto.StaffDashboardResponse;
import com.medistock.model.User;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.PurchaseRepository;
import com.medistock.security.CurrentUserProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StaffDashboardService {

    private final MedicineRepository medicineRepository;
    private final PurchaseRepository purchaseRepository;
    private final CurrentUserProvider currentUserProvider;

    public StaffDashboardResponse getStats() {
        User current = currentUserProvider.getCurrentUser();
        List<com.medistock.model.Purchase> myPurchases = current != null
                ? purchaseRepository.findByPurchasedBy_IdOrderByPurchaseDateDesc(current.getId())
                : Collections.emptyList();

        return StaffDashboardResponse.builder()
                .myPurchasesCount(myPurchases.size())
                .lowStockCount(medicineRepository.findLowStock().size())
                .totalMedicines(medicineRepository.count())
                .recentPurchases(myPurchases.stream().limit(10).toList())
                .build();
    }
}
