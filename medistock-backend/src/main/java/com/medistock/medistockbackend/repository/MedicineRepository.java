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

    @Query("SELECT m FROM Medicine m JOIN m.inventories i GROUP BY m.id HAVING SUM(i.quantity) >= MAX(i.minimumStock)")
    List<Medicine> findAvailableMedicines();

    @Query("SELECT m FROM Medicine m JOIN m.inventories i GROUP BY m.id HAVING SUM(i.quantity) > 0 AND SUM(i.quantity) < MAX(i.minimumStock)")
    List<Medicine> findLowStockMedicines();
}
