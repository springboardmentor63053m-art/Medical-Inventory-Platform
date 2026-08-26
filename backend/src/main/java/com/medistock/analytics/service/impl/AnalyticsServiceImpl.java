package com.medistock.analytics.service.impl;

import com.medistock.analytics.dto.response.InventoryAnalyticsResponse;
import com.medistock.analytics.service.AnalyticsService;
import com.medistock.category.repository.CategoryRepository;
import com.medistock.inventory.repository.InventoryRepository;
import com.medistock.medicine.repository.MedicineRepository;
import com.medistock.purchase.repository.PurchaseOrderRepository;
import com.medistock.supplier.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import com.medistock.inventory.entity.Inventory;
import com.medistock.medicine.entity.Medicine;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsServiceImpl implements AnalyticsService {

    private static final int EXPIRING_SOON_DAYS = 30;

    private final MedicineRepository medicineRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final InventoryRepository inventoryRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    @Override
        public InventoryAnalyticsResponse getInventoryAnalytics() {
        LocalDate today = LocalDate.now();
        LocalDate expiringThrough =
                today.plusDays(EXPIRING_SOON_DAYS);

        List<Inventory> inventoryItems =
                inventoryRepository.findAll();

        Map<Long, Long> usableQuantityByMedicine =
                new HashMap<>();

        for (Inventory item : inventoryItems) {
                if (item.getMedicine() == null ||
                        item.getMedicine().getId() == null ||
                        item.getExpiryDate() == null ||
                        item.getExpiryDate().isBefore(today)) {
                continue;
                }

                long quantity =
                        item.getQuantity() == null
                                ? 0L
                                : item.getQuantity();

                usableQuantityByMedicine.merge(
                        item.getMedicine().getId(),
                        quantity,
                        Long::sum
                );
        }

        long totalUsableStock =
                usableQuantityByMedicine.values()
                        .stream()
                        .mapToLong(Long::longValue)
                        .sum();

        long normalStockCount = 0L;
        long lowStockCount = 0L;
        long outOfStockCount = 0L;

        List<Medicine> medicines =
                medicineRepository.findAll();

        for (Medicine medicine : medicines) {
                long usableQuantity =
                        usableQuantityByMedicine.getOrDefault(
                                medicine.getId(),
                                0L
                        );

                int reorderLevel =
                        medicine.getReorderLevel() == null
                                ? 0
                                : medicine.getReorderLevel();

                if (usableQuantity == 0L) {
                outOfStockCount++;
                } else if (usableQuantity <= reorderLevel) {
                lowStockCount++;
                } else {
                normalStockCount++;
                }
        }

        return InventoryAnalyticsResponse.builder()
                .totalMedicines((long) medicines.size())
                .totalCategories(categoryRepository.count())
                .totalSuppliers(supplierRepository.count())
                .totalInventoryRecords(
                        (long) inventoryItems.size()
                )
                .totalStockQuantity(totalUsableStock)
                .normalStockCount(normalStockCount)
                .lowStockCount(lowStockCount)
                .outOfStockCount(outOfStockCount)
                .validCount(
                        inventoryRepository.countValidItemsAfter(
                                expiringThrough
                        )
                )
                .expiringSoonCount(
                        inventoryRepository.countExpiringItems(
                                expiringThrough
                        )
                )
                .expiredCount(
                        inventoryRepository.countExpiredItems()
                )
                .totalPurchaseOrders(
                        purchaseOrderRepository.count()
                )
                .totalPurchaseOrderValue(
                        purchaseOrderRepository.sumTotalAmount()
                )
                .build();
        }
}