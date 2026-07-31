package com.medicalinventory.service;

import com.medicalinventory.entity.*;
import com.medicalinventory.exception.*;
import com.medicalinventory.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PurchaseService {

    private static final Logger log = LoggerFactory.getLogger(PurchaseService.class);

    private final PurchaseRepository  purchaseRepository;
    private final SupplierRepository  supplierRepository;
    private final MedicineRepository  medicineRepository;
    private final InventoryService    inventoryService;

    public PurchaseService(PurchaseRepository purchaseRepository, SupplierRepository supplierRepository, MedicineRepository medicineRepository, InventoryService inventoryService) {
        this.purchaseRepository = purchaseRepository;
        this.supplierRepository = supplierRepository;
        this.medicineRepository = medicineRepository;
        this.inventoryService = inventoryService;
    }

    public List<Purchase> getAllPurchases() {
        return purchaseRepository.findAll();
    }

    public Purchase getPurchaseById(Long id) {
        return purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase", id));
    }

    @Transactional
    public Purchase createPurchase(Purchase purchase, User creator) {
        Supplier supplier = supplierRepository.findById(purchase.getSupplier().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", purchase.getSupplier().getId()));
        purchase.setSupplier(supplier);
        purchase.setCreatedBy(creator);
        purchase.setStatus(Purchase.PurchaseStatus.PENDING);

        BigDecimal total = BigDecimal.ZERO;
        for (PurchaseItem item : purchase.getItems()) {
            Medicine med = medicineRepository.findById(item.getMedicine().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Medicine", item.getMedicine().getId()));
            item.setMedicine(med);
            item.setPurchase(purchase);
            item.setTotalCost(item.getUnitCost().multiply(BigDecimal.valueOf(item.getQuantity())));
            total = total.add(item.getTotalCost());
        }
        purchase.setTotalAmount(total);
        BigDecimal discount = purchase.getDiscount() != null ? purchase.getDiscount() : BigDecimal.ZERO;
        BigDecimal tax      = purchase.getTaxAmount() != null ? purchase.getTaxAmount() : BigDecimal.ZERO;
        purchase.setNetAmount(total.subtract(discount).add(tax));

        Purchase saved = purchaseRepository.save(purchase);
        log.info("Created purchase order: {}", saved.getInvoiceNumber());
        return saved;
    }

    @Transactional
    public Purchase receivePurchase(Long purchaseId, User user) {
        Purchase purchase = getPurchaseById(purchaseId);

        if (purchase.getStatus() != Purchase.PurchaseStatus.PENDING) {
            throw new BadRequestException("Only PENDING purchases can be marked as received. Current status: " + purchase.getStatus());
        }

        for (PurchaseItem item : purchase.getItems()) {
            inventoryService.increaseStock(
                    item.getMedicine(),
                    item.getQuantity(),
                    purchase.getId(),
                    user,
                    item.getBatchNumber(),
                    item.getExpiryDate()
            );
        }

        purchase.setStatus(Purchase.PurchaseStatus.RECEIVED);
        Purchase saved = purchaseRepository.save(purchase);
        log.info("Purchase received: {}", saved.getInvoiceNumber());
        return saved;
    }

    @Transactional
    public Purchase cancelPurchase(Long purchaseId) {
        Purchase purchase = getPurchaseById(purchaseId);
        if (purchase.getStatus() != Purchase.PurchaseStatus.PENDING) {
            throw new BadRequestException("Only PENDING purchases can be cancelled.");
        }
        purchase.setStatus(Purchase.PurchaseStatus.CANCELLED);
        return purchaseRepository.save(purchase);
    }
}
