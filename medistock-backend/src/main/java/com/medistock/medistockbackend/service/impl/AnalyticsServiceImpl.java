package com.medistock.medistockbackend.service.impl;

import com.medistock.medistockbackend.dto.AnalyticsResponseDto;
import com.medistock.medistockbackend.entity.Medicine;
import com.medistock.medistockbackend.entity.Inventory;
import com.medistock.medistockbackend.entity.ExpiryTracking;
import com.medistock.medistockbackend.repository.MedicineRepository;
import com.medistock.medistockbackend.repository.SupplierRepository;
import com.medistock.medistockbackend.service.AnalyticsService;
import com.medistock.medistockbackend.service.ExpiryTrackingService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private final MedicineRepository medicineRepository;
    private final SupplierRepository supplierRepository;
    private final ExpiryTrackingService expiryTrackingService;

    public AnalyticsServiceImpl(MedicineRepository medicineRepository,
                                SupplierRepository supplierRepository,
                                ExpiryTrackingService expiryTrackingService) {
        this.medicineRepository = medicineRepository;
        this.supplierRepository = supplierRepository;
        this.expiryTrackingService = expiryTrackingService;
    }

    private static class StockInfo {
        final int quantity;
        final int minimumStock;

        StockInfo(int quantity, int minimumStock) {
            this.quantity = quantity;
            this.minimumStock = minimumStock;
        }
    }

    /**
     * Calculates the true current stock quantity and minimum stock threshold
     * for a given Medicine. Grouping by batchNumber avoids double-counting
     * duplicate database inventory entries.
     */
    private StockInfo calculateStockInfo(Medicine medicine) {
        int qty = 0;
        int minStock = 10;

        if (medicine.getInventories() != null && !medicine.getInventories().isEmpty()) {
            Map<String, Inventory> distinctBatches = new LinkedHashMap<>();
            for (Inventory inv : medicine.getInventories()) {
                if (inv != null) {
                    String batchKey = inv.getBatchNumber() != null && !inv.getBatchNumber().trim().isEmpty()
                            ? inv.getBatchNumber().trim()
                            : ("inv_" + inv.getId());

                    if (!distinctBatches.containsKey(batchKey)) {
                        distinctBatches.put(batchKey, inv);
                    }
                }
            }

            qty = distinctBatches.values().stream()
                    .mapToInt(inv -> inv.getQuantity() != null ? inv.getQuantity() : 0)
                    .sum();

            minStock = distinctBatches.values().stream()
                    .map(Inventory::getMinimumStock)
                    .filter(Objects::nonNull)
                    .findFirst()
                    .orElse(10);
        } else if (medicine.getStockQuantity() != null) {
            qty = medicine.getStockQuantity();
        }

        return new StockInfo(qty, minStock);
    }

    @Override
    public AnalyticsResponseDto getAnalyticsSummary() {
        List<Medicine> allMedicines = medicineRepository.findAll();
        long totalMedicines = allMedicines.size();
        long totalSuppliers = supplierRepository.count();

        long totalStock = 0;
        double inventoryValue = 0;

        List<Medicine> lowStockItems = new ArrayList<>();
        List<Medicine> outOfStockItems = new ArrayList<>();

        for (Medicine medicine : allMedicines) {
            StockInfo info = calculateStockInfo(medicine);
            int qty = info.quantity;
            int minStock = info.minimumStock;

            // Set current stock quantity on Medicine so serialized JSON outputs match
            medicine.setStockQuantity(qty);

            double price = medicine.getPrice() != null ? medicine.getPrice() : 0.0;
            totalStock += qty;
            inventoryValue += (qty * price);

            if (qty <= 0) {
                outOfStockItems.add(medicine);
            } else if (qty <= minStock) {
                lowStockItems.add(medicine);
            }
        }

        List<ExpiryTracking> expiringItems = expiryTrackingService.getUpcomingExpirys();

        return new AnalyticsResponseDto(
                totalMedicines,
                totalStock,
                lowStockItems.size(),
                outOfStockItems.size(),
                expiringItems.size(),
                inventoryValue,
                totalSuppliers,
                lowStockItems,
                outOfStockItems,
                expiringItems
        );
    }
}
