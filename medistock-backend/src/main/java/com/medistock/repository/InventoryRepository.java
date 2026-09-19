package com.medistock.repository;

import com.medistock.entity.Inventory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByMedicineId(Long medicineId);

    @Query("SELECT i FROM Inventory i WHERE i.quantity < i.minimumStock")
    List<Inventory> findLowStockItems();

    @Query("SELECT i FROM Inventory i WHERE i.quantity < i.minimumStock")
    Page<Inventory> findLowStockItems(Pageable pageable);

    @Query("SELECT i FROM Inventory i WHERE " +
           "LOWER(i.medicine.medicineName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(i.location) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Inventory> searchInventory(@Param("search") String search, Pageable pageable);

    @Query("SELECT SUM(i.quantity * i.medicine.unitPrice) FROM Inventory i")
    Double getTotalInventoryValue();

    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.quantity > 0 AND i.quantity < i.minimumStock")
    long countLowStockItems();

    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.quantity >= i.minimumStock AND i.quantity > 0")
    long countAvailableStockItems();

    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.quantity = 0")
    long countOutOfStockItems();

    @Query("SELECT COALESCE(SUM(i.quantity), 0) FROM Inventory i")
    long sumTotalQuantity();

    @Query("SELECT i FROM Inventory i WHERE i.quantity = 0")
    Page<Inventory> findOutOfStockItems(Pageable pageable);

    @Query("SELECT i FROM Inventory i WHERE i.quantity = 0")
    List<Inventory> findOutOfStockItems();

}
