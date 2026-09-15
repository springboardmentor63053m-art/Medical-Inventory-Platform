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
 * Purchase-order workflow: Admin creates an order -> Supplier
 * accepts/rejects -> Supplier marks dispatched -> Admin marks received.
 * Stock only increases (and a stock-movement + notification is created)
 * at the final "received" step — never at order creation.
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

    /** Step 1 — Admin creates a purchase order. No stock change yet. */
    @Transactional
    public Purchase createOrder(PurchaseRequest request) {
        Medicine medicine = medicineRepository.findById(request.getMedicineId())
                .orElseThrow(() -> new EntityNotFoundException("Medicine not found"));

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new EntityNotFoundException("Supplier not found"));
        }

        User currentUser = currentUserProvider.getCurrentUser();
        BigDecimal total = request.getUnitPrice().multiply(BigDecimal.valueOf(request.getQuantity()));

        Purchase purchase = Purchase.builder()
                .medicine(medicine)
                .supplier(supplier)
                .quantity(request.getQuantity())
                .unitPrice(request.getUnitPrice())
                .totalAmount(total)
                .purchasedBy(currentUser)
                .note(request.getNote())
                .poNumber(request.getPoNumber())
                .invoiceNumber(request.getInvoiceNumber())
                .orderStatus(PurchaseOrderStatus.PENDING)
                .build();
        purchase = purchaseRepository.save(purchase);

        if (supplier != null) {
            notificationService.create(
                    NotificationType.PURCHASE_ALERT,
                    Severity.INFO,
                    "New purchase order",
                    "A new order for " + request.getQuantity() + " units of " + medicine.getName()
                            + " has been placed with " + supplier.getName() + ".",
                    "ALL",
                    medicine.getId()
            );
        }

        return purchase;
    }

    /** Step 2 — Supplier accepts or rejects the order. Supplier may only act on their own orders. */
    @Transactional
    public Purchase respondToOrder(Long purchaseId, boolean accept, String note, User supplierUser) {
        Purchase purchase = requireOwnedBySupplier(purchaseId, supplierUser);
        requireStatus(purchase, PurchaseOrderStatus.PENDING);

        purchase.setOrderStatus(accept ? PurchaseOrderStatus.ACCEPTED : PurchaseOrderStatus.REJECTED);
        purchase.setRespondedDate(LocalDateTime.now());
        if (note != null && !note.isBlank()) {
            purchase.setSupplierNote(note);
        }
        return purchaseRepository.save(purchase);
    }

    /** Step 3 — Supplier marks the order dispatched, once accepted. */
    @Transactional
    public Purchase markDispatched(Long purchaseId, String note, User supplierUser) {
        Purchase purchase = requireOwnedBySupplier(purchaseId, supplierUser);
        requireStatus(purchase, PurchaseOrderStatus.ACCEPTED);

        purchase.setOrderStatus(PurchaseOrderStatus.DISPATCHED);
        purchase.setDispatchedDate(LocalDateTime.now());
        if (note != null && !note.isBlank()) {
            purchase.setSupplierNote(note);
        }
        return purchaseRepository.save(purchase);
    }

    /**
     * Step 4 — Admin receives the medicines. This is the ONLY place stock
     * increases: quantity is bumped, a PURCHASE_IN stock movement is
     * logged, and a notification goes out — mirroring exactly what the
     * old recordPurchase() used to do at creation time.
     */
    @Transactional
    public Purchase receivePurchase(Long purchaseId) {
        Purchase purchase = purchaseRepository.findById(purchaseId)
                .orElseThrow(() -> new EntityNotFoundException("Purchase not found"));
        // Stock must only move in once the supplier has actually dispatched the
        // order — receiving from PENDING/ACCEPTED would let Admin skip the
        // supplier's accept/dispatch steps entirely and increase stock for
        // medicines that were never actually shipped.
        requireStatus(purchase, PurchaseOrderStatus.DISPATCHED);

        Medicine medicine = purchase.getMedicine();
        if (!Boolean.TRUE.equals(medicine.getActive())) {
            throw new IllegalStateException(
                    medicine.getName() + " has been removed from active inventory and can't receive new stock. "
                            + "Reactivate it first if this purchase should still be fulfilled.");
        }
        User currentUser = currentUserProvider.getCurrentUser();

        int previousQty = medicine.getQuantity();
        int newQty = previousQty + purchase.getQuantity();
        medicine.setQuantity(newQty);
        medicineRepository.save(medicine);

        purchase.setOrderStatus(PurchaseOrderStatus.RECEIVED);
        purchase.setReceivedDate(LocalDateTime.now());
        purchase = purchaseRepository.save(purchase);

        stockMovementService.log(medicine, MovementType.PURCHASE_IN, purchase.getQuantity(),
                previousQty, newQty, currentUser, "Purchase #" + purchase.getId() + " received");

        notificationService.create(
                NotificationType.PURCHASE_ALERT,
                Severity.INFO,
                "Purchase received",
                purchase.getQuantity() + " units of " + medicine.getName() + " received into stock"
                        + (purchase.getSupplier() != null ? " from " + purchase.getSupplier().getName() : "") + ".",
                "ALL",
                medicine.getId()
        );

        return purchase;
    }

    /** Admin cancels an order that hasn't been received yet. No stock change. */
    @Transactional
    public Purchase cancelOrder(Long purchaseId) {
        Purchase purchase = purchaseRepository.findById(purchaseId)
                .orElseThrow(() -> new EntityNotFoundException("Purchase not found"));
        if (purchase.getOrderStatus() == PurchaseOrderStatus.RECEIVED) {
            throw new IllegalStateException("Cannot cancel an order that has already been received.");
        }
        purchase.setOrderStatus(PurchaseOrderStatus.CANCELLED);
        return purchaseRepository.save(purchase);
    }

    private Purchase requireOwnedBySupplier(Long purchaseId, User supplierUser) {
        Purchase purchase = purchaseRepository.findById(purchaseId)
                .orElseThrow(() -> new EntityNotFoundException("Purchase not found"));
        if (supplierUser == null || supplierUser.getSupplierId() == null
                || purchase.getSupplier() == null
                || !purchase.getSupplier().getId().equals(supplierUser.getSupplierId())) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "This order does not belong to your supplier account.");
        }
        return purchase;
    }

    private void requireStatus(Purchase purchase, PurchaseOrderStatus expected) {
        if (purchase.getOrderStatus() != expected) {
            throw new IllegalStateException(
                    "Order must be " + expected + " for this action, but is " + purchase.getOrderStatus() + ".");
        }
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
