package com.medistock.service;

import com.medistock.dto.MedicineRequest;
import com.medistock.model.*;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.StockMovementRepository;
import com.medistock.repository.SupplierRepository;
import com.medistock.security.CurrentUserProvider;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final SupplierRepository supplierRepository;
    private final StockMovementRepository stockMovementRepository;
    private final StockMovementService stockMovementService;
    private final NotificationService notificationService;
    private final CurrentUserProvider currentUserProvider;

    /** Default "normal inventory" view — active medicines only (requirement 10). */
    public List<Medicine> getAll() {
        return medicineRepository.findByActiveTrue();
    }

    /** Admin-only "Show inactive medicines" toggle — includes soft-deleted medicines for historical review. */
    public List<Medicine> getAllIncludingInactive() {
        return medicineRepository.findAll();
    }

    public Medicine getById(Long id) {
        return medicineRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Medicine not found with id: " + id));
    }

    public List<Medicine> search(String name, String category) {
        List<Medicine> results;
        if (name != null && !name.isBlank()) {
            results = medicineRepository.findByNameContainingIgnoreCase(name);
        } else if (category != null && !category.isBlank()) {
            results = medicineRepository.findByCategoryIgnoreCase(category);
        } else {
            results = medicineRepository.findByActiveTrue();
            return results;
        }
        return results.stream().filter(m -> Boolean.TRUE.equals(m.getActive())).toList();
    }

    public List<Medicine> getLowStock() {
        return medicineRepository.findLowStock();
    }

    public List<Medicine> getOutOfStock() {
        return medicineRepository.findOutOfStock();
    }

    public List<Medicine> getNearExpiry(int daysAhead) {
        return medicineRepository.findNearExpiry(LocalDate.now().plusDays(daysAhead));
    }

    public List<Medicine> getExpired() {
        return medicineRepository.findExpired();
    }

    /** Creates a medicine and, if it starts with quantity &gt; 0, records the opening balance as an INITIAL_STOCK movement so it's never invisible to the audit trail (requirement 7). */
    @Transactional
    public Medicine create(MedicineRequest request) {
        Medicine medicine = Medicine.builder()
                .name(request.getName())
                .batchNumber(request.getBatchNumber())
                .category(request.getCategory())
                .supplier(resolveSupplier(request.getSupplierId()))
                .quantity(request.getQuantity())
                .reorderLevel(request.getReorderLevel() == null ? 20 : request.getReorderLevel())
                .manufacturingDate(request.getManufacturingDate())
                .expiryDate(request.getExpiryDate())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .sheetImageUrl(request.getSheetImageUrl())
                .active(true)
                .build();
        medicine = medicineRepository.save(medicine);

        int openingQty = request.getQuantity() == null ? 0 : request.getQuantity();
        if (openingQty > 0) {
            stockMovementService.log(medicine, MovementType.INITIAL_STOCK, openingQty, 0, openingQty,
                    currentUserProvider.getCurrentUser(), "Initial stock on medicine creation");
        }
        return medicine;
    }

    /**
     * Updates medicine master information (name, batch, category, supplier,
     * dates, price, reorder level). The quantity field is still accepted
     * here for backward compatibility with the existing Edit Medicine form,
     * but any change to it is never applied silently — it is routed through
     * the same audited stock-change path used by adjustStock/purchase/sale
     * (MANUAL_ADJUSTMENT movement, negative-stock guard, low/out-of-stock
     * notification), per requirement 9 ("never change medicine.quantity
     * without an appropriate audit record").
     */
    @Transactional
    public Medicine update(Long id, MedicineRequest request) {
        Medicine medicine = getById(id);
        medicine.setName(request.getName());
        medicine.setBatchNumber(request.getBatchNumber());
        medicine.setCategory(request.getCategory());
        medicine.setSupplier(resolveSupplier(request.getSupplierId()));
        if (request.getReorderLevel() != null) {
            medicine.setReorderLevel(request.getReorderLevel());
        }
        medicine.setManufacturingDate(request.getManufacturingDate());
        medicine.setExpiryDate(request.getExpiryDate());
        medicine.setPrice(request.getPrice());
        medicine.setImageUrl(request.getImageUrl());
        medicine.setSheetImageUrl(request.getSheetImageUrl());
        medicine = medicineRepository.save(medicine);

        if (request.getQuantity() != null && !request.getQuantity().equals(medicine.getQuantity())) {
            int delta = request.getQuantity() - medicine.getQuantity();
            medicine = applyStockChange(id, delta, MovementType.MANUAL_ADJUSTMENT,
                    "Quantity corrected via medicine update");
        }
        return medicine;
    }

    @Transactional
    public Medicine adjustStock(Long id, int delta, String reason) {
        return applyStockChange(id, delta, MovementType.MANUAL_ADJUSTMENT,
                reason == null || reason.isBlank() ? "Manual stock adjustment" : reason);
    }

    /** Decrements stock for a completed sale/bill. Throws IllegalArgumentException (not caught here) if stock is insufficient — callers should pre-validate before touching any other item in a multi-item sale. */
    @Transactional
    public Medicine dispenseForSale(Long id, int quantitySold, String note) {
        return applyStockChange(id, -quantitySold, MovementType.DISPENSE_OUT, note);
    }

    /**
     * Removes damaged or (manually-flagged) expired units from stock —
     * the workflow the near-expiry/expired dashboards point to but that
     * previously had no endpoint: MovementType already defined
     * DAMAGE_REMOVAL/EXPIRED_REMOVAL, they just weren't reachable.
     * Goes through the same guard/audit/notification path as every other
     * stock change (active-medicine check, negative-stock guard,
     * StockMovement log, low/out-of-stock notification).
     */
    @Transactional
    public Medicine removeStock(Long id, int quantity, MovementType type, String reason) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity to remove must be greater than zero.");
        }
        if (type != MovementType.DAMAGE_REMOVAL && type != MovementType.EXPIRED_REMOVAL) {
            throw new IllegalArgumentException("Removal type must be DAMAGE_REMOVAL or EXPIRED_REMOVAL.");
        }
        String note = (reason == null || reason.isBlank())
                ? (type == MovementType.DAMAGE_REMOVAL ? "Damaged stock removed" : "Expired stock removed")
                : reason;
        return applyStockChange(id, -quantity, type, note);
    }

    private Medicine applyStockChange(Long id, int delta, MovementType type, String note) {
        Medicine medicine = getById(id);
        if (!Boolean.TRUE.equals(medicine.getActive())) {
            throw new IllegalStateException(
                    medicine.getName() + " has been removed from active inventory and can't be adjusted or dispensed.");
        }
        int previousQuantity = medicine.getQuantity();
        int newQuantity = previousQuantity + delta;
        if (newQuantity < 0) {
            throw new IllegalArgumentException(
                    "Insufficient stock for " + medicine.getName() + ". Available quantity: " + previousQuantity);
        }
        medicine.setQuantity(newQuantity);
        medicineRepository.save(medicine);

        User currentUser = currentUserProvider.getCurrentUser();
        stockMovementService.log(medicine, type, delta, previousQuantity, newQuantity, currentUser, note);

        if (newQuantity == 0) {
            notificationService.create(NotificationType.OUT_OF_STOCK, Severity.CRITICAL,
                    "Out of stock", medicine.getName() + " is now out of stock.", "ALL", medicine.getId());
        } else if (newQuantity <= medicine.getReorderLevel()) {
            notificationService.create(NotificationType.LOW_STOCK, Severity.WARNING,
                    "Low stock warning",
                    medicine.getName() + " has dropped to " + newQuantity + " units (reorder level: "
                            + medicine.getReorderLevel() + ").", "ALL", medicine.getId());
        }

        return medicine;
    }

    /**
     * Soft-deletes a medicine that has historical activity (purchases,
     * sales, or stock movements) so audit history stays intact — it is
     * marked inactive rather than physically removed (requirement 10). A
     * medicine with no historical records at all is still hard-deleted,
     * since there's nothing to preserve.
     */
    @Transactional
    public void delete(Long id) {
        Medicine medicine = getById(id);
        // Every purchase and every sale line item creates a StockMovement (PURCHASE_IN /
        // DISPENSE_OUT respectively — see PurchaseService/MedicineService.dispenseForSale), so
        // checking stock movement history alone is sufficient to detect "has historical records".
        boolean hasHistory = stockMovementRepository.existsByMedicine_Id(id);
        if (hasHistory) {
            medicine.setActive(false);
            medicineRepository.save(medicine);
        } else {
            medicineRepository.delete(medicine);
        }
    }

    private Supplier resolveSupplier(Long supplierId) {
        if (supplierId == null) return null;
        return supplierRepository.findById(supplierId)
                .orElseThrow(() -> new EntityNotFoundException("Supplier not found with id: " + supplierId));
    }
}
