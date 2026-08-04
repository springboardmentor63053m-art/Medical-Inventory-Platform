package com.medistock.medistock_backend.service.impl;

import com.medistock.medistock_backend.dto.InventoryRequest;
import com.medistock.medistock_backend.dto.InventoryResponse;
import com.medistock.medistock_backend.entity.Inventory;
import com.medistock.medistock_backend.entity.Medicine;
import com.medistock.medistock_backend.exception.BadRequestException;
import com.medistock.medistock_backend.exception.ResourceNotFoundException;
import com.medistock.medistock_backend.repository.InventoryRepository;
import com.medistock.medistock_backend.service.StockMovementService;
import com.medistock.medistock_backend.entity.MovementType;
import com.medistock.medistock_backend.repository.MedicineRepository;
import com.medistock.medistock_backend.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final MedicineRepository medicineRepository;
    private final StockMovementService stockMovementService;

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
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found with id: " + id));
        return mapToResponse(inventory);
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryResponse getInventoryByMedicineId(Long medicineId) {
        Inventory inventory = inventoryRepository.findByMedicineId(medicineId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for medicine id: " + medicineId));
        return mapToResponse(inventory);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryResponse> getLowStockInventory() {
        return inventoryRepository.findLowStockItems().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public InventoryResponse updateInventory(Long id, InventoryRequest request) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found with id: " + id));

        if (request.getQuantity() != null) {
            int oldQty = inventory.getQuantity();
            int newQty = request.getQuantity();
            int diff = newQty - oldQty;
            inventory.setQuantity(newQty);
            if (diff != 0) {
                MovementType type = diff > 0 ? MovementType.IN : MovementType.OUT;
                stockMovementService.logMovement(inventory.getMedicine().getId(), null, type, Math.abs(diff), null);
            }
        }
        if (request.getReorderLevel() != null) {
            inventory.setReorderLevel(request.getReorderLevel());
        }
        if (request.getMaxQuantity() != null) {
            inventory.setMaxQuantity(request.getMaxQuantity());
        }
        if (request.getLocationRack() != null) {
            inventory.setLocationRack(request.getLocationRack());
        }

        return mapToResponse(inventoryRepository.save(inventory));
    }

    @Override
    @Transactional
    public InventoryResponse updateStockQuantity(Long medicineId, Integer quantityDelta) {
        Inventory inventory = inventoryRepository.findByMedicineId(medicineId)
                .orElseGet(() -> {
                    Medicine medicine = medicineRepository.findById(medicineId)
                            .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + medicineId));
                    Inventory newInv = Inventory.builder()
                            .medicine(medicine)
                            .quantity(0)
                            .reorderLevel(10)
                            .build();
                    return inventoryRepository.save(newInv);
                });

        int newQty = inventory.getQuantity() + quantityDelta;
        if (newQty < 0) {
            throw new BadRequestException("Insufficient inventory quantity for medicine id: " + medicineId);
        }
        inventory.setQuantity(newQty);
        Inventory savedInventory = inventoryRepository.save(inventory);
        if (quantityDelta != 0) {
            MovementType type = quantityDelta > 0 ? MovementType.IN : MovementType.OUT;
            stockMovementService.logMovement(medicineId, null, type, Math.abs(quantityDelta), null);
        }
        return mapToResponse(savedInventory);
    }

    private InventoryResponse mapToResponse(Inventory inventory) {
        boolean isLowStock = inventory.getQuantity() <= inventory.getReorderLevel();
        return InventoryResponse.builder()
                .id(inventory.getId())
                .medicineId(inventory.getMedicine() != null ? inventory.getMedicine().getId() : null)
                .medicineName(inventory.getMedicine() != null ? inventory.getMedicine().getName() : null)
                .medicineCode(inventory.getMedicine() != null ? inventory.getMedicine().getCode() : null)
                .quantity(inventory.getQuantity())
                .reorderLevel(inventory.getReorderLevel())
                .maxQuantity(inventory.getMaxQuantity())
                .locationRack(inventory.getLocationRack())
                .lowStock(isLowStock)
                .lastUpdated(inventory.getLastUpdated())
                .build();
    }
}
