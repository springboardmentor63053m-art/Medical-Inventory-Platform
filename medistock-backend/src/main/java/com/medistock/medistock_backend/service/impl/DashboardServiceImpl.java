package com.medistock.medistock_backend.service.impl;

import com.medistock.medistock_backend.dto.DashboardSummaryDto;
import com.medistock.medistock_backend.dto.InventoryResponse;
import com.medistock.medistock_backend.dto.PurchaseOrderResponse;
import com.medistock.medistock_backend.entity.Inventory;
import com.medistock.medistock_backend.repository.*;
import com.medistock.medistock_backend.service.DashboardService;
import com.medistock.medistock_backend.service.InventoryService;
import com.medistock.medistock_backend.service.PurchaseOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final MedicineRepository medicineRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryService inventoryService;
    private final PurchaseOrderService purchaseOrderService;

    @Value("${inventory.near-expiry-days:30}")
    private int nearExpiryDays;

    @Override
    @Transactional(readOnly = true)
    public DashboardSummaryDto getDashboardSummary() {
        long totalUsers = userRepository.countNormalUsers();
        long totalMedicines = medicineRepository.count();
        long totalSuppliers = supplierRepository.count();
        long totalOrders = purchaseOrderRepository.count();

        LocalDate today = LocalDate.now();
        LocalDate nearExpiryDate = today.plusDays(nearExpiryDays);

        long availableCount = medicineRepository.countAvailableMedicines();
        long lowStockMedicinesCount = medicineRepository.countLowStockMedicines();
        long outOfStockCount = medicineRepository.countOutOfStockMedicines();
        long nearExpiryCount = medicineRepository.countNearExpiryMedicines(today, nearExpiryDate);
        long expiredCount = medicineRepository.countExpiredMedicines(today);

        List<InventoryResponse> lowStockItems = inventoryService.getLowStockInventory();

        // Calculate total inventory monetary value
        List<Inventory> allInventory = inventoryRepository.findAll();
        BigDecimal totalValue = BigDecimal.ZERO;
        for (Inventory inv : allInventory) {
            if (inv.getMedicine() != null && inv.getMedicine().getPrice() != null && inv.getQuantity() != null) {
                totalValue = totalValue.add(inv.getMedicine().getPrice().multiply(BigDecimal.valueOf(inv.getQuantity())));
            }
        }

        List<PurchaseOrderResponse> recentOrders = purchaseOrderService.getAllPurchaseOrders().stream()
                .limit(5)
                .collect(Collectors.toList());

        return DashboardSummaryDto.builder()
                .totalUsers(totalUsers)
                .totalMedicines(totalMedicines)
                .totalSuppliers(totalSuppliers)
                .totalPurchaseOrders(totalOrders)
                .lowStockCount(lowStockMedicinesCount) // Keep synced with low stock definition
                .totalInventoryValue(totalValue)
                .currency("INR")
                .lowStockItems(lowStockItems)
                .recentOrders(recentOrders)
                .availableMedicinesCount(availableCount)
                .lowStockMedicinesCount(lowStockMedicinesCount)
                .outOfStockMedicinesCount(outOfStockCount)
                .nearExpiryMedicinesCount(nearExpiryCount)
                .expiredMedicinesCount(expiredCount)
                .build();
    }
}
