package com.medicalinventory.repository;

import com.medicalinventory.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByMedicineId(Long medicineId);
    void deleteByMedicineId(Long medicineId);

    /** Find all inventory records where quantity <= minQuantity (low stock) */
    @Query("SELECT i FROM Inventory i WHERE i.quantity <= i.minQuantity")
    List<Inventory> findLowStockItems();

    /** Find inventory expiring within the given number of days */
    @Query("SELECT i FROM Inventory i WHERE i.expiryDate IS NOT NULL AND i.expiryDate <= :expiryBefore AND i.quantity > 0")
    List<Inventory> findExpiringBefore(@Param("expiryBefore") LocalDate expiryBefore);

    /** Total inventory value = sum of (quantity * medicine.unitPrice) */
    @Query("SELECT COALESCE(SUM(i.quantity * m.unitPrice), 0) FROM Inventory i JOIN i.medicine m")
    java.math.BigDecimal calculateTotalInventoryValue();

    /** Count of low stock medicines */
    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.quantity <= i.minQuantity")
    Long countLowStockItems();

    /** Count medicines expiring within N days */
    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.expiryDate IS NOT NULL AND i.expiryDate <= :expiryBefore AND i.quantity > 0")
    Long countExpiringBefore(@Param("expiryBefore") LocalDate expiryBefore);
}
