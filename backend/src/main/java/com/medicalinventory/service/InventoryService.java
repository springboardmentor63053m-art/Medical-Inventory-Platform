package com.medicalinventory.service;

import com.medicalinventory.entity.*;
import com.medicalinventory.exception.*;
import com.medicalinventory.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class InventoryService {

    private static final Logger log = LoggerFactory.getLogger(InventoryService.class);

    private final InventoryRepository     inventoryRepository;
    private final StockMovementRepository stockMovementRepository;
    private final AlertService            alertService;

    public InventoryService(InventoryRepository inventoryRepository, StockMovementRepository stockMovementRepository, AlertService alertService) {
        this.inventoryRepository = inventoryRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.alertService = alertService;
    }

    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    public Inventory getInventoryByMedicineId(Long medicineId) {
        return inventoryRepository.findByMedicineId(medicineId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory for medicine id " + medicineId + " not found"));
    }

    public List<Inventory> getLowStockItems() {
        return inventoryRepository.findLowStockItems();
    }

    public List<Inventory> getExpiringItems(int days) {
        return inventoryRepository.findExpiringBefore(LocalDate.now().plusDays(days));
    }

    @Transactional
    public Inventory adjustStock(Long medicineId, int adjustment, String reason, User user) {
        Inventory inventory = getInventoryByMedicineId(medicineId);
        int quantityBefore = inventory.getQuantity();
        int quantityAfter  = quantityBefore + adjustment;

        if (quantityAfter < 0) {
            throw new BadRequestException("Stock adjustment would result in negative quantity. Current: " + quantityBefore);
        }

        inventory.setQuantity(quantityAfter);
        Inventory saved = inventoryRepository.save(inventory);

        StockMovement movement = StockMovement.builder()
                .medicine(inventory.getMedicine())
                .movementType(adjustment >= 0 ? StockMovement.MovementType.ADJUSTMENT_IN : StockMovement.MovementType.ADJUSTMENT_OUT)
                .quantity(Math.abs(adjustment))
                .quantityBefore(quantityBefore)
                .quantityAfter(quantityAfter)
                .reason(reason)
                .performedBy(user)
                .build();
        stockMovementRepository.save(movement);

        alertService.checkAndGenerateAlerts(inventory.getMedicine(), saved);

        log.info("Stock adjusted for medicine id={}: {} -> {}", medicineId, quantityBefore, quantityAfter);
        return saved;
    }

    @Transactional
    public void increaseStock(Medicine medicine, int quantity, Long referenceId, User user, String batchNumber, LocalDate expiryDate) {
        Inventory inventory = inventoryRepository.findByMedicineId(medicine.getId())
                .orElseGet(() -> Inventory.builder()
                        .medicine(medicine)
                        .quantity(0)
                        .minQuantity(medicine.getReorderLevel())
                        .build());

        int before = inventory.getQuantity();
        int after  = before + quantity;
        inventory.setQuantity(after);
        if (batchNumber != null) inventory.setBatchNumber(batchNumber);
        if (expiryDate  != null) inventory.setExpiryDate(expiryDate);

        inventoryRepository.save(inventory);

        StockMovement movement = StockMovement.builder()
                .medicine(medicine)
                .movementType(StockMovement.MovementType.PURCHASE_IN)
                .quantity(quantity)
                .quantityBefore(before)
                .quantityAfter(after)
                .referenceType("PURCHASE")
                .referenceId(referenceId)
                .reason("Stock received from purchase")
                .performedBy(user)
                .build();
        stockMovementRepository.save(movement);
    }

    @Transactional
    public void decreaseStock(Medicine medicine, int quantity, Long referenceId, User user) {
        Inventory inventory = inventoryRepository.findByMedicineId(medicine.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory for " + medicine.getName() + " not found"));

        if (inventory.getQuantity() < quantity) {
            throw new InsufficientStockException(medicine.getName(), inventory.getQuantity(), quantity);
        }

        int before = inventory.getQuantity();
        int after  = before - quantity;
        inventory.setQuantity(after);
        inventoryRepository.save(inventory);

        StockMovement movement = StockMovement.builder()
                .medicine(medicine)
                .movementType(StockMovement.MovementType.SALE_OUT)
                .quantity(quantity)
                .quantityBefore(before)
                .quantityAfter(after)
                .referenceType("SALE")
                .referenceId(referenceId)
                .reason("Stock deducted for sale")
                .performedBy(user)
                .build();
        stockMovementRepository.save(movement);

        alertService.checkAndGenerateAlerts(medicine, inventory);
    }
}
