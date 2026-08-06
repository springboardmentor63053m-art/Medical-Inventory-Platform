package com.medistock.repository;

import com.medistock.model.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    List<Medicine> findByNameContainingIgnoreCase(String name);

    List<Medicine> findByCategoryIgnoreCase(String category);

    @Query("SELECT m FROM Medicine m WHERE m.quantity <= m.reorderLevel")
    List<Medicine> findLowStock();

    @Query("SELECT m FROM Medicine m WHERE m.quantity = 0")
    List<Medicine> findOutOfStock();

    @Query("SELECT m FROM Medicine m WHERE m.expiryDate <= :date AND m.expiryDate >= CURRENT_DATE")
    List<Medicine> findNearExpiry(@Param("date") LocalDate date);

    @Query("SELECT m FROM Medicine m WHERE m.expiryDate < CURRENT_DATE")
    List<Medicine> findExpired();

    @Query("SELECT COALESCE(SUM(m.quantity * m.price), 0) FROM Medicine m")
    java.math.BigDecimal totalInventoryValue();
}
