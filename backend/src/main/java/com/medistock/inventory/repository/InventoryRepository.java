package com.medistock.inventory.repository;

import com.medistock.inventory.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    List<Inventory> findByMedicineId(Long medicineId);

    @Query("SELECT i FROM Inventory i WHERE i.quantity <= i.minimumStock")
    List<Inventory> findLowStockItems();

    @Query("SELECT i FROM Inventory i WHERE i.expiryDate < CURRENT_DATE")
    List<Inventory> findExpiredItems();

    @Query("SELECT i FROM Inventory i WHERE i.expiryDate BETWEEN CURRENT_DATE AND :targetDate")
    List<Inventory> findExpiringItems(@Param("targetDate") LocalDate targetDate);
}
