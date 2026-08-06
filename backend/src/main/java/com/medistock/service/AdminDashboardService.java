package com.medistock.service;

import com.medistock.dto.AdminDashboardResponse;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.SupplierRepository;
import com.medistock.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final MedicineRepository medicineRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;
    private final PurchaseService purchaseService;
    private final NotificationService notificationService;

    public AdminDashboardResponse getStats() {
        return AdminDashboardResponse.builder()
                .totalMedicines(medicineRepository.count())
                .totalSuppliers(supplierRepository.count())
                .totalUsers(userRepository.count())
                .totalInventoryValue(medicineRepository.totalInventoryValue())
                .lowStockCount(medicineRepository.findLowStock().size())
                .outOfStockCount(medicineRepository.findOutOfStock().size())
                .nearExpiryCount(medicineRepository.findNearExpiry(LocalDate.now().plusDays(30)).size())
                .expiredCount(medicineRepository.findExpired().size())
                .totalSpendThisMonth(purchaseService.spendThisMonth())
                .purchasesThisMonth(purchaseService.countThisMonth())
                .supplierInsights(purchaseService.supplyInsights())
                .unreadNotifications(notificationService.unreadCountForRole("ADMIN"))
                .systemStatus("OPERATIONAL")
                .serverTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .build();
    }
}
