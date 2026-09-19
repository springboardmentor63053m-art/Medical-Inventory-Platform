package com.medistock.service.impl;

import com.medistock.dto.InventoryDTO;
import com.medistock.dto.PageResponse;
import com.medistock.dto.StockLogDTO;
import com.medistock.entity.Inventory;
import com.medistock.entity.Medicine;
import com.medistock.enums.ActionType;
import com.medistock.enums.NotificationType;
import com.medistock.exception.BadRequestException;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.InventoryRepository;
import com.medistock.repository.MedicineRepository;
import com.medistock.service.InventoryService;
import com.medistock.service.NotificationService;
import com.medistock.service.StockLogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final MedicineRepository medicineRepository;
    private final StockLogService stockLogService;
    private final NotificationService notificationService;

    public InventoryServiceImpl(InventoryRepository inventoryRepository, MedicineRepository medicineRepository, StockLogService stockLogService, NotificationService notificationService) {
        this.inventoryRepository = inventoryRepository;
        this.medicineRepository = medicineRepository;
        this.stockLogService = stockLogService;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<InventoryDTO> getAllInventory(String search, Pageable pageable) {
        Page<Inventory> page;
        if (StringUtils.hasText(search)) {
            page = inventoryRepository.searchInventory(search, pageable);
        } else {
            page = inventoryRepository.findAll(pageable);
        }

        List<InventoryDTO> dtos = page.getContent().stream()
                .map(this::mapToDTO)
                .toList();

        return PageResponse.<InventoryDTO>builder()
                .content(dtos)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<InventoryDTO> getLowStockInventory(Pageable pageable) {
        Page<Inventory> page = inventoryRepository.findLowStockItems(pageable);

        List<InventoryDTO> dtos = page.getContent().stream()
                .map(this::mapToDTO)
                .toList();

        return PageResponse.<InventoryDTO>builder()
                .content(dtos)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryDTO getInventoryByMedicineId(Long medicineId) {
        Inventory inventory = inventoryRepository.findByMedicineId(medicineId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory", "medicineId", medicineId));
        return mapToDTO(inventory);
    }

    @Override
    @Transactional
    public InventoryDTO adjustStock(Long medicineId, Integer quantity, ActionType actionType, String performedBy, String remarks) {
        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", medicineId));

        Inventory inventory = inventoryRepository.findByMedicineId(medicineId)
                .orElseGet(() -> inventoryRepository.save(Inventory.builder()
                        .medicine(medicine)
                        .quantity(0)
                        .minimumStock(10)
                        .maximumStock(500)
                        .location("Main Pharmacy")
                        .build()));

        int currentQty = inventory.getQuantity() != null ? inventory.getQuantity() : 0;
        int newQty = currentQty;

        if (actionType == ActionType.IN) {
            newQty += quantity;
        } else if (actionType == ActionType.OUT) {
            if (currentQty < quantity) {
                throw new BadRequestException("Insufficient stock for medicine '" + medicine.getMedicineName() +
                        "'. Available: " + currentQty + ", Requested: " + quantity);
            }
            newQty -= quantity;
        } else if (actionType == ActionType.ADJUSTMENT) {
            newQty = quantity;
        }

        inventory.setQuantity(newQty);
        Inventory updatedInventory = inventoryRepository.save(inventory);

        // Record stock audit log
        stockLogService.createStockLog(StockLogDTO.builder()
                .medicineId(medicineId)
                .actionType(actionType)
                .quantity(quantity)
                .previousQuantity(currentQty)
                .newQuantity(newQty)
                .performedBy(performedBy != null ? performedBy : "System User")
                .remarks(remarks)
                .build());

        // Stock alert checks
        if (updatedInventory.getQuantity() <= 0) {
            notificationService.createNotification(
                    "Out of Stock Alert: " + medicine.getMedicineName(),
                    "Medicine " + medicine.getMedicineName() + " (" + medicine.getMedicineCode() +
                            ") is completely OUT OF STOCK (0 units remaining).",
                    NotificationType.OUT_OF_STOCK,
                    com.medistock.enums.NotificationSeverity.CRITICAL,
                    medicine.getId()
            );
        } else if (updatedInventory.getQuantity() <= updatedInventory.getMinimumStock()) {
            notificationService.createNotification(
                    "Low Stock Alert: " + medicine.getMedicineName(),
                    "Quantity for " + medicine.getMedicineName() + " (" + medicine.getMedicineCode() +
                            ") is below minimum threshold (" + updatedInventory.getQuantity() + " / " + updatedInventory.getMinimumStock() + ")",
                    NotificationType.LOW_STOCK,
                    com.medistock.enums.NotificationSeverity.WARNING,
                    medicine.getId()
            );
        }

        return mapToDTO(updatedInventory);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<InventoryDTO> getOutOfStockInventory(Pageable pageable) {
        Page<Inventory> page = inventoryRepository.findOutOfStockItems(pageable);

        List<InventoryDTO> dtos = page.getContent().stream()
                .map(this::mapToDTO)
                .toList();

        return PageResponse.<InventoryDTO>builder()
                .content(dtos)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    @Override
    @Transactional
    public InventoryDTO updateInventoryThresholds(Long medicineId, Integer minimumStock, Integer maximumStock, String location) {
        Inventory inventory = inventoryRepository.findByMedicineId(medicineId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory", "medicineId", medicineId));

        if (minimumStock != null) inventory.setMinimumStock(minimumStock);
        if (maximumStock != null) inventory.setMaximumStock(maximumStock);
        if (location != null) inventory.setLocation(location);

        Inventory updated = inventoryRepository.save(inventory);
        return mapToDTO(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public Double getTotalInventoryValue() {
        Double value = inventoryRepository.getTotalInventoryValue();
        return value != null ? value : 0.0;
    }

    @Override
    @Transactional(readOnly = true)
    public long countLowStockItems() {
        return inventoryRepository.countLowStockItems();
    }

    @Override
    @Transactional(readOnly = true)
    public long countOutOfStockItems() {
        return inventoryRepository.countOutOfStockItems();
    }


    private InventoryDTO mapToDTO(Inventory inventory) {
        boolean isLow = inventory.getQuantity() != null && inventory.getMinimumStock() != null &&
                inventory.getQuantity() <= inventory.getMinimumStock();

        Medicine med = inventory.getMedicine();
        return InventoryDTO.builder()
                .id(inventory.getId())
                .medicineId(med.getId())
                .medicineCode(med.getMedicineCode())
                .medicineName(med.getMedicineName())
                .category(med.getCategory())
                .manufacturer(med.getManufacturer())
                .supplierId(med.getSupplier() != null ? med.getSupplier().getId() : null)
                .supplierName(med.getSupplier() != null ? med.getSupplier().getSupplierName() : null)
                .batchNumber(med.getBatchNumber())
                .quantity(inventory.getQuantity())
                .minimumStock(inventory.getMinimumStock())
                .maximumStock(inventory.getMaximumStock())
                .location(inventory.getLocation())
                .lastUpdated(inventory.getLastUpdated())
                .isLowStock(isLow)
                .build();
    }
}
