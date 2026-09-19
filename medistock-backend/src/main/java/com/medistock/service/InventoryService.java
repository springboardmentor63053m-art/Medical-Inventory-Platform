package com.medistock.service;

import com.medistock.dto.InventoryDTO;
import com.medistock.dto.PageResponse;
import com.medistock.enums.ActionType;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface InventoryService {
    PageResponse<InventoryDTO> getAllInventory(String search, Pageable pageable);
    PageResponse<InventoryDTO> getLowStockInventory(Pageable pageable);
    PageResponse<InventoryDTO> getOutOfStockInventory(Pageable pageable);
    InventoryDTO getInventoryByMedicineId(Long medicineId);
    InventoryDTO adjustStock(Long medicineId, Integer quantity, ActionType actionType, String performedBy, String remarks);
    InventoryDTO updateInventoryThresholds(Long medicineId, Integer minimumStock, Integer maximumStock, String location);
    Double getTotalInventoryValue();
    long countLowStockItems();
    long countOutOfStockItems();

}
