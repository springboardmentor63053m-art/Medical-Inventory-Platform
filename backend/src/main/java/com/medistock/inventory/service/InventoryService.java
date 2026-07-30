package com.medistock.inventory.service;

import com.medistock.inventory.dto.request.InventoryRequest;
import com.medistock.inventory.dto.response.InventoryResponse;

import java.util.List;

public interface InventoryService {
    InventoryResponse createInventory(InventoryRequest request);
    List<InventoryResponse> getAllInventory();
    InventoryResponse getInventoryById(Long id);
    InventoryResponse updateInventory(Long id, InventoryRequest request);
    void deleteInventory(Long id);
    List<InventoryResponse> getLowStockInventory();
    List<InventoryResponse> getExpiredInventory();
    List<InventoryResponse> getExpiringInventory(int days);
    List<InventoryResponse> getInventoryByMedicineId(Long medicineId);
}
