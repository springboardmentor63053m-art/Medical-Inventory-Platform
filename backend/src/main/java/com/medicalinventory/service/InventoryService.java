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
    private final MedicineRepository      medicineRepository;

    public InventoryService(InventoryRepository inventoryRepository, StockMovementRepository stockMovementRepository, AlertService alertService, MedicineRepository medicineRepository) {
        this.inventoryRepository = inventoryRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.alertService = alertService;
        this.medicineRepository = medicineRepository;
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

    public Inventory getInventoryById(Long id) {
        return inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory", id));
    }

    @Transactional
    public Inventory createOrUpdateInventory(Inventory request, User user) {
        if (request.getMedicine() == null || request.getMedicine().getId() == null) {
            throw new BadRequestException("Medicine selection is required to add inventory");
        }
        Medicine medicine = medicineRepository.findById(request.getMedicine().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", request.getMedicine().getId()));

        Inventory inventory = inventoryRepository.findByMedicineId(medicine.getId())
                .orElseGet(() -> Inventory.builder()
                        .medicine(medicine)
                        .quantity(0)
                        .minQuantity(medicine.getReorderLevel() != null ? medicine.getReorderLevel() : 10)
                        .build());

        int quantityBefore = inventory.getQuantity() != null ? inventory.getQuantity() : 0;
        int newQuantity = request.getQuantity() != null ? Math.max(0, request.getQuantity()) : 0;

        inventory.setMedicine(medicine);
        inventory.setQuantity(newQuantity);
        if (request.getMinQuantity() != null) inventory.setMinQuantity(Math.max(0, request.getMinQuantity()));
        if (request.getBatchNumber() != null) inventory.setBatchNumber(request.getBatchNumber());
        if (request.getExpiryDate() != null) inventory.setExpiryDate(request.getExpiryDate());
        if (request.getLocation() != null) inventory.setLocation(request.getLocation());

        Inventory saved = inventoryRepository.save(inventory);

        if (user != null && newQuantity != quantityBefore) {
            int diff = newQuantity - quantityBefore;
            StockMovement movement = StockMovement.builder()
                    .medicine(medicine)
                    .movementType(diff >= 0 ? StockMovement.MovementType.ADJUSTMENT_IN : StockMovement.MovementType.ADJUSTMENT_OUT)
                    .quantity(Math.abs(diff))
                    .quantityBefore(quantityBefore)
                    .quantityAfter(newQuantity)
                    .reason(diff >= 0 ? "Inventory added / initial stock set" : "Inventory stock reduced")
                    .performedBy(user)
                    .build();
            stockMovementRepository.save(movement);
        }

        alertService.checkAndGenerateAlerts(medicine, saved);
        log.info("Inventory created/updated for medicine id={}: quantity={}", medicine.getId(), newQuantity);
        return saved;
    }

    @Transactional
    public Inventory updateInventory(Long id, Inventory updated, User user) {
        Inventory inventory = getInventoryById(id);

        int quantityBefore = inventory.getQuantity() != null ? inventory.getQuantity() : 0;
        int newQuantity = updated.getQuantity() != null ? Math.max(0, updated.getQuantity()) : quantityBefore;

        inventory.setQuantity(newQuantity);
        if (updated.getMinQuantity() != null) inventory.setMinQuantity(Math.max(0, updated.getMinQuantity()));
        if (updated.getBatchNumber() != null) inventory.setBatchNumber(updated.getBatchNumber());
        if (updated.getExpiryDate() != null) inventory.setExpiryDate(updated.getExpiryDate());
        if (updated.getLocation() != null) inventory.setLocation(updated.getLocation());

        Inventory saved = inventoryRepository.save(inventory);

        if (user != null && newQuantity != quantityBefore) {
            int diff = newQuantity - quantityBefore;
            StockMovement movement = StockMovement.builder()
                    .medicine(inventory.getMedicine())
                    .movementType(diff >= 0 ? StockMovement.MovementType.ADJUSTMENT_IN : StockMovement.MovementType.ADJUSTMENT_OUT)
                    .quantity(Math.abs(diff))
                    .quantityBefore(quantityBefore)
                    .quantityAfter(newQuantity)
                    .reason("Inventory record updated")
                    .performedBy(user)
                    .build();
            stockMovementRepository.save(movement);
        }

        alertService.checkAndGenerateAlerts(inventory.getMedicine(), saved);
        log.info("Inventory updated id={}: quantity={}", id, newQuantity);
        return saved;
    }

    @Transactional
    public void deleteInventory(Long id) {
        Inventory inventory = getInventoryById(id);
        inventoryRepository.delete(inventory);
        log.info("Deleted inventory record id={}", id);
    }
}
