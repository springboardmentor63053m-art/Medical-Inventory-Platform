package com.medistock.inventory.service.impl;

import com.medistock.category.dto.response.CategoryResponse;
import com.medistock.common.exception.ResourceNotFoundException;
import com.medistock.inventory.dto.request.InventoryRequest;
import com.medistock.inventory.dto.response.InventoryResponse;
import com.medistock.inventory.entity.Inventory;
import com.medistock.inventory.repository.InventoryRepository;
import com.medistock.inventory.service.InventoryService;
import com.medistock.inventory.service.StockMovementService;
import com.medistock.medicine.dto.response.MedicineResponse;
import com.medistock.medicine.entity.Medicine;
import com.medistock.medicine.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final MedicineRepository medicineRepository;
    private final StockMovementService stockMovementService;

    private synchronized String resolveUniqueBatchNumber(String requestedBatch, Long currentId) {
        String year = String.valueOf(LocalDate.now().getYear());
        String batchNo = (requestedBatch != null && !requestedBatch.trim().isEmpty())
                ? requestedBatch.trim()
                : "BATCH-" + year + "-001";

        boolean exists = (currentId == null)
                ? inventoryRepository.existsByBatchNumber(batchNo)
                : inventoryRepository.existsByBatchNumberAndIdNot(batchNo, currentId);

        if (!exists) {
            return batchNo;
        }

        List<Inventory> all = inventoryRepository.findAll();
        int maxSeq = 0;
        for (Inventory item : all) {
            if (item.getBatchNumber() != null) {
                java.util.regex.Matcher m = java.util.regex.Pattern.compile("(?:BATCH|BAT)-(?:20\\d\\d-)?(\\d+)", java.util.regex.Pattern.CASE_INSENSITIVE)
                        .matcher(item.getBatchNumber());
                if (m.find()) {
                    try {
                        int seq = Integer.parseInt(m.group(1));
                        if (seq > maxSeq) {
                            maxSeq = seq;
                        }
                    } catch (NumberFormatException ignored) {}
                }
            }
        }

        int nextSeq = maxSeq + 1;
        String candidate = "BATCH-" + year + "-" + String.format("%03d", nextSeq);
        while (inventoryRepository.existsByBatchNumber(candidate)) {
            nextSeq++;
            candidate = "BATCH-" + year + "-" + String.format("%03d", nextSeq);
        }
        return candidate;
    }

    @Override
    @Transactional
    public InventoryResponse createInventory(InventoryRequest request) {
        Medicine medicine = medicineRepository.findById(request.getMedicineId())
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + request.getMedicineId()));

        Integer minStock = request.getMinimumStock() != null ? request.getMinimumStock() : (medicine.getReorderLevel() != null ? medicine.getReorderLevel() : 10);
        String finalBatchNumber = resolveUniqueBatchNumber(request.getBatchNumber(), null);

        Long prevSum = inventoryRepository.sumQuantityByMedicineId(medicine.getId());
        int previousQty = prevSum != null ? prevSum.intValue() : 0;
        int addedQty = request.getQuantity() != null ? request.getQuantity() : 0;
        int newQty = previousQty + addedQty;

        Inventory inventory = Inventory.builder()
                .medicine(medicine)
                .quantity(addedQty)
                .minimumStock(minStock)
                .batchNumber(finalBatchNumber)
                .expiryDate(request.getExpiryDate())
                .storageLocation(request.getStorageLocation())
                .build();

        Inventory saved = inventoryRepository.save(inventory);

        stockMovementService.recordMovement(
                medicine,
                finalBatchNumber,
                "ADD",
                addedQty,
                previousQty,
                newQty,
                null,
                "Stock Added (New Batch)"
        );

        return mapToResponse(saved);
    }

    @Override
    @Transactional

    public InventoryResponse receivePurchaseOrderStock(
            Long medicineId,
            Integer quantity,
            Integer minimumStock,
            String batchNumber,
            LocalDate expiryDate,
            String storageLocation,
            String purchaseOrderNumber
    ) {
        Medicine medicine = medicineRepository
                .findById(medicineId)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Medicine not found with id: " +
                                medicineId
                        )
                );

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException(
                    "Received quantity must be greater than zero"
            );
        }

        if (batchNumber == null ||
                batchNumber.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Received batch number is required"
            );
        }

        if (expiryDate == null ||
                !expiryDate.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException(
                    "Received expiry date must be in the future"
            );
        }

        String finalBatchNumber = batchNumber.trim();

        if (inventoryRepository.existsByBatchNumber(
                finalBatchNumber
        )) {
            throw new IllegalArgumentException(
                    "Inventory batch already exists: " +
                    finalBatchNumber
            );
        }

        int finalMinimumStock =
                minimumStock != null
                        ? minimumStock
                        : medicine.getReorderLevel() != null
                            ? medicine.getReorderLevel()
                            : 10;

        Long currentTotal =
                inventoryRepository.sumQuantityByMedicineId(
                        medicineId
                );

        int previousQuantity =
                currentTotal == null
                        ? 0
                        : currentTotal.intValue();

        int newQuantity =
                previousQuantity + quantity;

        Inventory inventory = Inventory.builder()
                .medicine(medicine)
                .quantity(quantity)
                .minimumStock(finalMinimumStock)
                .batchNumber(finalBatchNumber)
                .expiryDate(expiryDate)
                .storageLocation(storageLocation)
                .build();

        Inventory saved =
                inventoryRepository.save(inventory);

        stockMovementService.recordMovement(
                medicine,
                finalBatchNumber,
                "RESTOCK",
                quantity,
                previousQuantity,
                newQuantity,
                null,
                "Purchase Order " +
                purchaseOrderNumber +
                " Received"
        );

        return mapToResponse(saved);
    }
    public List<InventoryResponse> getAllInventory() {
        return inventoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryResponse getInventoryById(Long id) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));
        return mapToResponse(inventory);
    }

    @Override
    @Transactional
    public InventoryResponse updateInventory(Long id, InventoryRequest request) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));

        Medicine medicine = medicineRepository.findById(request.getMedicineId())
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + request.getMedicineId()));

        Integer minStock = request.getMinimumStock() != null ? request.getMinimumStock() : (medicine.getReorderLevel() != null ? medicine.getReorderLevel() : 10);
        String finalBatchNumber = resolveUniqueBatchNumber(request.getBatchNumber(), id);

        int oldBatchQty = inventory.getQuantity() != null ? inventory.getQuantity() : 0;
        Long prevSum = inventoryRepository.sumQuantityByMedicineId(medicine.getId());
        int previousQty = prevSum != null ? prevSum.intValue() : 0;
        int newBatchQty = request.getQuantity() != null ? request.getQuantity() : 0;
        int diff = newBatchQty - oldBatchQty;
        int newQty = previousQty + diff;

        inventory.setMedicine(medicine);
        inventory.setQuantity(newBatchQty);
        inventory.setMinimumStock(minStock);
        inventory.setBatchNumber(finalBatchNumber);
        inventory.setExpiryDate(request.getExpiryDate());
        inventory.setStorageLocation(request.getStorageLocation());

        Inventory updated = inventoryRepository.save(inventory);

        if (diff != 0) {
            stockMovementService.recordMovement(
                    medicine,
                    finalBatchNumber,
                    diff > 0 ? "RESTOCK" : "ISSUE",
                    diff,
                    previousQty,
                    newQty,
                    null,
                    diff > 0 ? "Batch Quantity Restocked" : "Batch Stock Adjusted/Issued"
            );
        }

        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteInventory(Long id) {
        if (!inventoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Inventory item not found with id: " + id);
        }
        inventoryRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryResponse> getLowStockInventory() {
        return inventoryRepository.findLowStockItems().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryResponse> getExpiredInventory() {
        return inventoryRepository.findExpiredItems().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryResponse> getExpiringInventory(int days) {
        LocalDate targetDate = LocalDate.now().plusDays(days);
        return inventoryRepository.findExpiringItems(targetDate).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryResponse> getInventoryByMedicineId(Long medicineId) {
        return inventoryRepository.findByMedicineId(medicineId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private InventoryResponse mapToResponse(Inventory inventory) {
        Medicine med = inventory.getMedicine();
        MedicineResponse medicineResp = null;

        if (med != null) {
            CategoryResponse categoryResp = null;
            if (med.getCategory() != null) {
                categoryResp = CategoryResponse.builder()
                        .id(med.getCategory().getId())
                        .name(med.getCategory().getName())
                        .description(med.getCategory().getDescription())
                        .createdAt(med.getCategory().getCreatedAt())
                        .updatedAt(med.getCategory().getUpdatedAt())
                        .build();
            }

            medicineResp = MedicineResponse.builder()
                    .id(med.getId())
                    .category(categoryResp)
                    .medicineCode(med.getMedicineCode())
                    .name(med.getName())
                    .genericName(med.getGenericName())
                    .manufacturer(med.getManufacturer())
                    .dosage(med.getDosage())
                    .unitPrice(med.getUnitPrice())
                    .reorderLevel(med.getReorderLevel())
                    .description(med.getDescription())
                    .status(med.getStatus())
                    .createdAt(med.getCreatedAt())
                    .updatedAt(med.getUpdatedAt())
                    .build();
        }

        int quantity = inventory.getQuantity() != null
                ? inventory.getQuantity()
                : 0;

        int minimumStock = inventory.getMinimumStock() != null
                ? inventory.getMinimumStock()
                : 0;

        LocalDate today = LocalDate.now();
        LocalDate expiryDate = inventory.getExpiryDate();

        boolean isOutOfStock = quantity == 0;
        boolean isLowStock = quantity <= minimumStock;

        boolean isExpired =
                expiryDate != null &&
                expiryDate.isBefore(today);

        boolean isExpiringSoon =
            expiryDate != null &&
            !isExpired &&
            !expiryDate.isAfter(today.plusDays(30));

        String stockStatus;

        if (isOutOfStock) {
            stockStatus = "OUT_OF_STOCK";
        } else if (isLowStock) {
            stockStatus = "LOW_STOCK";
        } else {
            stockStatus = "NORMAL";
        }

        String expiryStatus;

        if (isExpired) {
            expiryStatus = "EXPIRED";
        } else if (isExpiringSoon) {
            expiryStatus = "EXPIRING_SOON";
        } else {
            expiryStatus = "VALID";
        }

        return InventoryResponse.builder()
                .id(inventory.getId())
                .medicine(medicineResp)
                .quantity(inventory.getQuantity())
                .minimumStock(inventory.getMinimumStock())
                .batchNumber(inventory.getBatchNumber())
                .expiryDate(inventory.getExpiryDate())
                .storageLocation(inventory.getStorageLocation())
                .isLowStock(isLowStock)
                .isOutOfStock(isOutOfStock)
                .isExpired(isExpired)
                .stockStatus(stockStatus)
                .expiryStatus(expiryStatus)
                .createdAt(inventory.getCreatedAt())
                .updatedAt(inventory.getUpdatedAt())
                .build();
    }
}
