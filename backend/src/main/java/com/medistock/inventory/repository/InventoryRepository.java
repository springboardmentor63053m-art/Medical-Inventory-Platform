package com.medistock.inventory.repository;

import com.medistock.inventory.entity.Inventory;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    @Override
    @EntityGraph(attributePaths = {"medicine", "medicine.category"})
    List<Inventory> findAll();

    @EntityGraph(attributePaths = {"medicine", "medicine.category"})
    List<Inventory> findByMedicineId(Long medicineId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = {"medicine", "medicine.category"})
    @Query("SELECT i FROM Inventory i WHERE i.medicine.id = :medicineId ORDER BY i.expiryDate ASC")
    List<Inventory> findByMedicineIdWithLock(@Param("medicineId") Long medicineId);

    @Query("SELECT COALESCE(SUM(i.quantity), 0) FROM Inventory i WHERE i.medicine.id = :medicineId")
    Long sumQuantityByMedicineId(@Param("medicineId") Long medicineId);

    @EntityGraph(attributePaths = {"medicine", "medicine.category"})
    @Query("SELECT i FROM Inventory i WHERE i.quantity < i.minimumStock")
    List<Inventory> findLowStockItems();

    @EntityGraph(attributePaths = {"medicine", "medicine.category"})
    @Query("SELECT i FROM Inventory i WHERE i.expiryDate < CURRENT_DATE")
    List<Inventory> findExpiredItems();

    @EntityGraph(attributePaths = {"medicine", "medicine.category"})
    @Query("SELECT i FROM Inventory i WHERE i.expiryDate BETWEEN CURRENT_DATE AND :targetDate")
    List<Inventory> findExpiringItems(@Param("targetDate") LocalDate targetDate);

    boolean existsByBatchNumber(String batchNumber);

    boolean existsByBatchNumberAndIdNot(String batchNumber, Long id);




    
    @Query("SELECT COALESCE(SUM(i.quantity), 0) FROM Inventory i")
    Long sumTotalQuantity();

    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.quantity >= i.minimumStock")
    Long countNormalStockItems();

    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.quantity > 0 AND i.quantity < i.minimumStock")
    Long countLowStockItemsExcludingOutOfStock();

    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.quantity = 0")
    Long countOutOfStockItems();

    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.expiryDate < CURRENT_DATE")
    Long countExpiredItems();

    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.expiryDate BETWEEN CURRENT_DATE AND :targetDate")
    Long countExpiringItems(@Param("targetDate") LocalDate targetDate);

    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.expiryDate > :targetDate")
    Long countValidItemsAfter(@Param("targetDate") LocalDate targetDate);
}
