package com.medistock.medistock_backend.service;

import com.medistock.medistock_backend.dto.InventoryRequest;
import com.medistock.medistock_backend.dto.InventoryResponse;

import java.util.List;

public interface InventoryService {
    List<InventoryResponse> getAllInventory();
    InventoryResponse getInventoryById(Long id);
    InventoryResponse getInventoryByMedicineId(Long medicineId);
    List<InventoryResponse> getLowStockInventory();
    InventoryResponse updateInventory(Long id, InventoryRequest inventoryRequest);
    InventoryResponse updateStockQuantity(Long medicineId, Integer quantityDelta);
}
