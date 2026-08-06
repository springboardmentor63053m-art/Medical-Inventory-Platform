package com.medistock.service;

import com.medistock.dto.MedicineRequest;
import com.medistock.model.*;
import com.medistock.repository.MedicineRepository;
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
    private final StockMovementService stockMovementService;
    private final NotificationService notificationService;
    private final CurrentUserProvider currentUserProvider;

    public List<Medicine> getAll() {
        return medicineRepository.findAll();
    }

    public Medicine getById(Long id) {
        return medicineRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Medicine not found with id: " + id));
    }

    public List<Medicine> search(String name, String category) {
        if (name != null && !name.isBlank()) {
            return medicineRepository.findByNameContainingIgnoreCase(name);
        }
        if (category != null && !category.isBlank()) {
            return medicineRepository.findByCategoryIgnoreCase(category);
        }
        return medicineRepository.findAll();
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
                .build();
        return medicineRepository.save(medicine);
    }

    @Transactional
    public Medicine update(Long id, MedicineRequest request) {
        Medicine medicine = getById(id);
        medicine.setName(request.getName());
        medicine.setBatchNumber(request.getBatchNumber());
        medicine.setCategory(request.getCategory());
        medicine.setSupplier(resolveSupplier(request.getSupplierId()));
        medicine.setQuantity(request.getQuantity());
        if (request.getReorderLevel() != null) {
            medicine.setReorderLevel(request.getReorderLevel());
        }
        medicine.setManufacturingDate(request.getManufacturingDate());
        medicine.setExpiryDate(request.getExpiryDate());
        medicine.setPrice(request.getPrice());
        return medicineRepository.save(medicine);
    }

    @Transactional
    public Medicine adjustStock(Long id, int delta, String reason) {
        Medicine medicine = getById(id);
        int previousQuantity = medicine.getQuantity();
        int newQuantity = previousQuantity + delta;
        if (newQuantity < 0) {
            throw new IllegalArgumentException("Stock quantity cannot go below zero");
        }
        medicine.setQuantity(newQuantity);
        medicineRepository.save(medicine);

        User currentUser = currentUserProvider.getCurrentUser();
        stockMovementService.log(medicine, MovementType.MANUAL_ADJUSTMENT, delta,
                previousQuantity, newQuantity, currentUser,
                reason == null || reason.isBlank() ? "Manual stock adjustment" : reason);

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

    @Transactional
    public void delete(Long id) {
        Medicine medicine = getById(id);
        medicineRepository.delete(medicine);
    }

    private Supplier resolveSupplier(Long supplierId) {
        if (supplierId == null) return null;
        return supplierRepository.findById(supplierId)
                .orElseThrow(() -> new EntityNotFoundException("Supplier not found with id: " + supplierId));
    }
}
