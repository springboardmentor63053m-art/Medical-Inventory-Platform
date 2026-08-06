package com.medistock.service;

import com.medistock.dto.PurchaseRequest;
import com.medistock.dto.SupplyInsightResponse;
import com.medistock.model.*;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.PurchaseRepository;
import com.medistock.repository.SupplierRepository;
import com.medistock.security.CurrentUserProvider;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

/**
 * Recording a purchase is the single entry point that ties together:
 * stock increase -> stock movement audit log -> purchase-alert notification.
 */
@Service
@RequiredArgsConstructor
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final MedicineRepository medicineRepository;
    private final SupplierRepository supplierRepository;
    private final StockMovementService stockMovementService;
    private final NotificationService notificationService;
    private final CurrentUserProvider currentUserProvider;

    @Transactional
    public Purchase recordPurchase(PurchaseRequest request) {
        Medicine medicine = medicineRepository.findById(request.getMedicineId())
                .orElseThrow(() -> new EntityNotFoundException("Medicine not found"));

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new EntityNotFoundException("Supplier not found"));
        }

        User currentUser = currentUserProvider.getCurrentUser();

        int previousQty = medicine.getQuantity();
        int newQty = previousQty + request.getQuantity();
        medicine.setQuantity(newQty);
        medicineRepository.save(medicine);

        BigDecimal total = request.getUnitPrice().multiply(BigDecimal.valueOf(request.getQuantity()));

        Purchase purchase = Purchase.builder()
                .medicine(medicine)
                .supplier(supplier)
                .quantity(request.getQuantity())
                .unitPrice(request.getUnitPrice())
                .totalAmount(total)
                .purchasedBy(currentUser)
                .note(request.getNote())
                .build();
        purchase = purchaseRepository.save(purchase);

        stockMovementService.log(medicine, MovementType.PURCHASE_IN, request.getQuantity(),
                previousQty, newQty, currentUser, "Purchase #" + purchase.getId());

        notificationService.create(
                NotificationType.PURCHASE_ALERT,
                Severity.INFO,
                "New purchase recorded",
                request.getQuantity() + " units of " + medicine.getName() + " purchased"
                        + (supplier != null ? " from " + supplier.getName() : "") + ".",
                "ALL",
                medicine.getId()
        );

        return purchase;
    }

    public List<Purchase> getAll() {
        return purchaseRepository.findAllByOrderByPurchaseDateDesc();
    }

    public List<Purchase> getForUser(Long userId) {
        return purchaseRepository.findByPurchasedBy_IdOrderByPurchaseDateDesc(userId);
    }

    public long countThisMonth() {
        return purchaseRepository.findSince(startOfMonth()).size();
    }

    public BigDecimal spendThisMonth() {
        return purchaseRepository.totalSpendSince(startOfMonth());
    }

    public List<SupplyInsightResponse> supplyInsights() {
        return purchaseRepository.supplyInsightBySupplier().stream()
                .map(row -> SupplyInsightResponse.builder()
                        .supplierName((String) row[0])
                        .purchaseCount((Long) row[1])
                        .totalSpend((BigDecimal) row[2])
                        .build())
                .toList();
    }

    private LocalDateTime startOfMonth() {
        return YearMonth.now().atDay(1).atStartOfDay();
    }
}
