package com.medistock.medistockbackend.service;

import com.medistock.medistockbackend.entity.Inventory;
import java.util.List;

public interface InventoryService {
    List<Inventory> findAll();
    Inventory findById(Long id);
    Inventory save(Inventory entity);
    void deleteById(Long id);
    Inventory updateStock(Long id, Integer quantity);
}
