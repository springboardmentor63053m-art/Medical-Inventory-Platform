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
        LocalDate expiringThrough =
                LocalDate.now().plusDays(EXPIRING_SOON_DAYS);

        return InventoryAnalyticsResponse.builder()
                .totalMedicines(medicineRepository.count())
                .totalCategories(categoryRepository.count())
                .totalSuppliers(supplierRepository.count())
                .totalInventoryRecords(inventoryRepository.count())
                .totalStockQuantity(inventoryRepository.sumTotalQuantity())
                .normalStockCount(inventoryRepository.countNormalStockItems())
                .lowStockCount(
                        inventoryRepository.countLowStockItemsExcludingOutOfStock()
                )
                .outOfStockCount(inventoryRepository.countOutOfStockItems())
                .validCount(
                        inventoryRepository.countValidItemsAfter(expiringThrough)
                )
                .expiringSoonCount(
                        inventoryRepository.countExpiringItems(expiringThrough)
                )
                .expiredCount(inventoryRepository.countExpiredItems())
                .totalPurchaseOrders(purchaseOrderRepository.count())
                .totalPurchaseOrderValue(
                        purchaseOrderRepository.sumTotalAmount()
                )
                .build();
    }
}