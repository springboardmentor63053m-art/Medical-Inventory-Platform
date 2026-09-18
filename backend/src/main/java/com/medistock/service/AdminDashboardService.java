package com.medistock.service;

import com.medistock.dto.AdminDashboardResponse;
import com.medistock.model.Purchase;
import com.medistock.model.StockMovement;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.PurchaseRepository;
import com.medistock.repository.SupplierRepository;
import com.medistock.repository.UserRepository;
import com.medistock.security.CurrentUserProvider;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private static final DateTimeFormatter FMT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final MedicineRepository medicineRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;
    private final PurchaseRepository purchaseRepository;
    private final PurchaseService purchaseService;
    private final NotificationService notificationService;
    private final StockMovementService stockMovementService;
    private final SalesAnalyticsService salesAnalyticsService;
    private final ActiveUserTrackingService activeUserTrackingService;
    private final DashboardMapper dashboardMapper;
    private final CurrentUserProvider currentUserProvider;

    public AdminDashboardResponse getStats() {

        var salesOverview = salesAnalyticsService.getSalesOverview();

        // Load only the latest 15 purchases for the recent purchases section.
        List<Purchase> recentPurchases =
        purchaseRepository.findRecentPurchasesWithDetails(
                PageRequest.of(0, 15));

        List<StockMovement> recentMovements =
                stockMovementService.getRecent();

        // These values must represent ALL purchases, not only the latest 15.
        BigDecimal totalPurchaseValueAllTime =
                purchaseRepository.totalPurchaseValueAllTime();

        long totalPurchasesAllTime =
                purchaseRepository.countAllPurchases();

        return AdminDashboardResponse.builder()
                .totalMedicines(medicineRepository.count())
                .totalSuppliers(supplierRepository.count())
                .totalUsers(userRepository.count())

                .totalInventoryValue(
                        medicineRepository.totalInventoryValue())

                .lowStockCount(
                        medicineRepository.findLowStock().size())

                .outOfStockCount(
                        medicineRepository.findOutOfStock().size())

                .nearExpiryCount(
                        medicineRepository
                                .findNearExpiry(LocalDate.now().plusDays(30))
                                .size())

                .expiredCount(
                        medicineRepository.findExpired().size())

                .totalSpendThisMonth(
                        purchaseService.spendThisMonth())

                .purchasesThisMonth(
                        purchaseService.countThisMonth())

                .totalPurchaseValueAllTime(
                        totalPurchaseValueAllTime)

                .totalPurchasesAllTime(
                        totalPurchasesAllTime)

                .ordersAwaitingAction(
                        recentPurchases.stream()
                                .filter(p ->
                                        p.getOrderStatus()
                                                == com.medistock.model.PurchaseOrderStatus.PENDING
                                        || p.getOrderStatus()
                                                == com.medistock.model.PurchaseOrderStatus.ACCEPTED
                                        || p.getOrderStatus()
                                                == com.medistock.model.PurchaseOrderStatus.DISPATCHED)
                                .count())

                .recentPurchases(
                        recentPurchases.stream()
                                .map(dashboardMapper::toPurchaseSummary)
                                .toList())

                .totalActiveSuppliers(
                        supplierRepository.count())

                .supplierInsights(
                        purchaseService.supplyInsights())

                .recentStockMovements(
                        recentMovements.stream()
                                .limit(12)
                                .map(dashboardMapper::toMovementSummary)
                                .toList())

                .salesToday(
                        salesOverview.getSalesToday())

                .salesThisMonth(
                        salesOverview.getSalesThisMonth())

                .billsGeneratedThisMonth(
                        salesOverview.getBillsGeneratedThisMonth())

                .medicinesSoldThisMonth(
                        salesOverview.getMedicinesSoldThisMonth())

                .recentSales(
                        salesOverview.getRecentSales())

                .topSellingMedicines(
                        salesOverview.getTopSellingMedicines())

                .quarterlySales(
                        salesOverview.getQuarterlySales())

                .quarterlyPurchaseValue(
                        salesAnalyticsService
                                .quarterlyPurchaseValue(
                                        LocalDate.now().getYear()))

                .activeUsers(
                        activeUserTrackingService.getSummary())

                .unreadNotifications(
                        notificationService.unreadCountForRole(
                                "ADMIN",
                                currentUserProvider.getCurrentUser() != null
                                        ? currentUserProvider
                                                .getCurrentUser()
                                                .getId()
                                        : null))

                .systemStatus("OPERATIONAL")

                .serverTime(
                        LocalDateTime.now().format(FMT))

                .build();
    }
}