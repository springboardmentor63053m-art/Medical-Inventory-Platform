package com.medistock.inventory.service.impl;

import com.medistock.category.dto.response.CategoryResponse;
import com.medistock.common.exception.ResourceNotFoundException;
import com.medistock.inventory.dto.request.InventoryRequest;
import com.medistock.inventory.dto.response.InventoryResponse;
import com.medistock.inventory.entity.Inventory;
import com.medistock.inventory.repository.InventoryRepository;
import com.medistock.inventory.service.InventoryService;
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

    @Override
    @Transactional
    public InventoryResponse createInventory(InventoryRequest request) {
        Medicine medicine = medicineRepository.findById(request.getMedicineId())
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + request.getMedicineId()));

        Inventory inventory = Inventory.builder()
                .medicine(medicine)
                .quantity(request.getQuantity())
                .minimumStock(request.getMinimumStock())
                .batchNumber(request.getBatchNumber())
                .expiryDate(request.getExpiryDate())
                .storageLocation(request.getStorageLocation())
                .build();

        Inventory saved = inventoryRepository.save(inventory);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
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

        inventory.setMedicine(medicine);
        inventory.setQuantity(request.getQuantity());
        inventory.setMinimumStock(request.getMinimumStock());
        inventory.setBatchNumber(request.getBatchNumber());
        inventory.setExpiryDate(request.getExpiryDate());
        inventory.setStorageLocation(request.getStorageLocation());

        Inventory updated = inventoryRepository.save(inventory);
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

        boolean isLowStock = inventory.getQuantity() <= inventory.getMinimumStock();
        boolean isExpired = inventory.getExpiryDate() != null && inventory.getExpiryDate().isBefore(LocalDate.now());

        return InventoryResponse.builder()
                .id(inventory.getId())
                .medicine(medicineResp)
                .quantity(inventory.getQuantity())
                .minimumStock(inventory.getMinimumStock())
                .batchNumber(inventory.getBatchNumber())
                .expiryDate(inventory.getExpiryDate())
                .storageLocation(inventory.getStorageLocation())
                .isLowStock(isLowStock)
                .isOutOfStock(inventory.getQuantity() == 0)
                .isExpired(isExpired)
                .createdAt(inventory.getCreatedAt())
                .updatedAt(inventory.getUpdatedAt())
                .build();
    }
}
