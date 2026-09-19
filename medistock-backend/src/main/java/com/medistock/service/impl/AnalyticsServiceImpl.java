package com.medistock.service.impl;

import com.medistock.dto.AnalyticsDTO;
import com.medistock.enums.ActionType;
import com.medistock.enums.ExpiryStatus;
import com.medistock.enums.OrderStatus;
import com.medistock.repository.*;
import com.medistock.service.AnalyticsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private final MedicineRepository medicineRepository;
    private final InventoryRepository inventoryRepository;
    private final ExpiryTrackingRepository expiryTrackingRepository;
    private final SupplierRepository supplierRepository;
    private final StockLogRepository stockLogRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    public AnalyticsServiceImpl(
            MedicineRepository medicineRepository,
            InventoryRepository inventoryRepository,
            ExpiryTrackingRepository expiryTrackingRepository,
            SupplierRepository supplierRepository,
            StockLogRepository stockLogRepository,
            PurchaseOrderRepository purchaseOrderRepository) {
        this.medicineRepository = medicineRepository;
        this.inventoryRepository = inventoryRepository;
        this.expiryTrackingRepository = expiryTrackingRepository;
        this.supplierRepository = supplierRepository;
        this.stockLogRepository = stockLogRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public AnalyticsDTO.DashboardAnalytics getDashboardAnalytics() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime monthStart = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);

        return new AnalyticsDTO.DashboardAnalytics(
                getInventoryAnalytics(),
                getExpiryAnalytics(),
                getSupplierAnalytics(),
                getStockMovementAnalytics(monthStart, now),
                getPurchaseAnalytics(monthStart, now)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public AnalyticsDTO.InventoryAnalytics getInventoryAnalytics() {
        long totalMedicines = medicineRepository.count();
        long totalStock = inventoryRepository.sumTotalQuantity();
        long availableStock = inventoryRepository.countAvailableStockItems();
        long lowStock = inventoryRepository.countLowStockItems();
        long outOfStock = inventoryRepository.countOutOfStockItems();
        Double value = inventoryRepository.getTotalInventoryValue();
        BigDecimal inventoryValue = value != null ? BigDecimal.valueOf(value) : BigDecimal.ZERO;

        return new AnalyticsDTO.InventoryAnalytics(
                totalMedicines,
                totalStock,
                availableStock,
                lowStock,
                outOfStock,
                inventoryValue
        );
    }

    @Override
    @Transactional(readOnly = true)
    public AnalyticsDTO.ExpiryAnalytics getExpiryAnalytics() {
        long expiredMeds = expiryTrackingRepository.countByStatus(ExpiryStatus.EXPIRED);
        long expiringSoonMeds = expiryTrackingRepository.countByStatus(ExpiryStatus.EXPIRING_SOON);
        long activeMeds = expiryTrackingRepository.countByStatus(ExpiryStatus.ACTIVE);

        long expiredQty = expiryTrackingRepository.sumQuantityByStatus(ExpiryStatus.EXPIRED);
        long expiringSoonQty = expiryTrackingRepository.sumQuantityByStatus(ExpiryStatus.EXPIRING_SOON);

        return new AnalyticsDTO.ExpiryAnalytics(
                expiredMeds,
                expiringSoonMeds,
                activeMeds,
                expiredQty,
                expiringSoonQty
        );
    }

    @Override
    @Transactional(readOnly = true)
    public AnalyticsDTO.SupplierAnalytics getSupplierAnalytics() {
        long totalSuppliers = supplierRepository.count();
        var suppliers = supplierRepository.findAll();

        List<AnalyticsDTO.SupplierStat> stats = new ArrayList<>();
        for (var s : suppliers) {
            long medCount = medicineRepository.countBySupplierId(s.getId());
            var meds = medicineRepository.findBySupplierId(s.getId());
            long totalStock = 0;
            for (var m : meds) {
                var invOpt = inventoryRepository.findByMedicineId(m.getId());
                if (invOpt.isPresent()) {
                    totalStock += invOpt.get().getQuantity();
                }
            }
            stats.add(new AnalyticsDTO.SupplierStat(s.getId(), s.getSupplierName(), medCount, totalStock));
        }

        return new AnalyticsDTO.SupplierAnalytics(totalSuppliers, stats);
    }

    @Override
    @Transactional(readOnly = true)
    public AnalyticsDTO.StockMovementAnalytics getStockMovementAnalytics(LocalDateTime from, LocalDateTime to) {
        long inQty = 0;
        long outQty = 0;
        long adjQty = 0;
        long retQty = 0;

        if (from != null && to != null) {
            inQty = stockLogRepository.sumQuantityByActionTypeInAndCreatedAtBetween(List.of(ActionType.IN, ActionType.STOCK_IN), from, to);
            outQty = stockLogRepository.sumQuantityByActionTypeInAndCreatedAtBetween(List.of(ActionType.OUT, ActionType.STOCK_OUT), from, to);
            adjQty = stockLogRepository.sumQuantityByActionTypeInAndCreatedAtBetween(List.of(ActionType.ADJUSTMENT), from, to);
            retQty = stockLogRepository.sumQuantityByActionTypeInAndCreatedAtBetween(List.of(ActionType.RETURN), from, to);
        } else {
            inQty = stockLogRepository.sumQuantityByActionTypeIn(List.of(ActionType.IN, ActionType.STOCK_IN));
            outQty = stockLogRepository.sumQuantityByActionTypeIn(List.of(ActionType.OUT, ActionType.STOCK_OUT));
            adjQty = stockLogRepository.sumQuantityByActionTypeIn(List.of(ActionType.ADJUSTMENT));
            retQty = stockLogRepository.sumQuantityByActionTypeIn(List.of(ActionType.RETURN));
        }

        return new AnalyticsDTO.StockMovementAnalytics(inQty, outQty, adjQty, retQty);
    }

    @Override
    @Transactional(readOnly = true)
    public AnalyticsDTO.PurchaseAnalytics getPurchaseAnalytics(LocalDateTime from, LocalDateTime to) {
        long totalPurchases = purchaseOrderRepository.count();

        LocalDateTime startOfMonth = (from != null) ? from : LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        long purchasesThisMonth = purchaseOrderRepository.countByCreatedAtAfter(startOfMonth);
        Double spend = purchaseOrderRepository.sumTotalAmountByCreatedAtAfter(startOfMonth);
        BigDecimal monthlySpending = spend != null ? BigDecimal.valueOf(spend) : BigDecimal.ZERO;

        return new AnalyticsDTO.PurchaseAnalytics(totalPurchases, purchasesThisMonth, monthlySpending);
    }
}
