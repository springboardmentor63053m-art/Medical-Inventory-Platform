package com.medistock.medistockbackend.repository;

import com.medistock.medistockbackend.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    List<Medicine> findByNameContainingIgnoreCase(String name);

    List<Medicine> findByCategoryIgnoreCase(String category);

    List<Medicine> findBySupplierId(Long supplierId);

    @Query("SELECT m FROM Medicine m LEFT JOIN m.inventories i GROUP BY m.id HAVING COALESCE(SUM(i.quantity), m.stockQuantity, 0) > COALESCE(MAX(i.minimumStock), 10)")
    List<Medicine> findAvailableMedicines();

    @Query("SELECT m FROM Medicine m LEFT JOIN m.inventories i GROUP BY m.id HAVING COALESCE(SUM(i.quantity), m.stockQuantity, 0) > 0 AND COALESCE(SUM(i.quantity), m.stockQuantity, 0) <= COALESCE(MAX(i.minimumStock), 10)")
    List<Medicine> findLowStockMedicines();

    @Query("SELECT m FROM Medicine m LEFT JOIN m.inventories i GROUP BY m.id HAVING COALESCE(SUM(i.quantity), m.stockQuantity, 0) <= 0")
    List<Medicine> findOutOfStockMedicines();
}
