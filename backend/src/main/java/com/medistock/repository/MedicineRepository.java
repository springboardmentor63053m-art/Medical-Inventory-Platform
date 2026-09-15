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

    /** Active (non-soft-deleted) medicines — the default "normal inventory" view (requirement 10). */
    List<Medicine> findByActiveTrue();

    /** Medicines supplied by a single supplier — powers the Supplier dashboard's "Supplied Medicines" section. */
    List<Medicine> findBySupplier_Id(Long supplierId);

    // active = true on every operational query below: a soft-deleted medicine
    // must never trigger a low-stock/out-of-stock/expiry alert or count toward
    // live inventory value — it only remains visible in historical reports,
    // which query the repository directly rather than through these methods.
    @Query("SELECT m FROM Medicine m WHERE m.active = true AND m.quantity <= m.reorderLevel")
    List<Medicine> findLowStock();

    @Query("SELECT m FROM Medicine m WHERE m.active = true AND m.quantity = 0")
    List<Medicine> findOutOfStock();

    @Query("SELECT m FROM Medicine m WHERE m.active = true AND m.expiryDate <= :date AND m.expiryDate >= CURRENT_DATE")
    List<Medicine> findNearExpiry(@Param("date") LocalDate date);

    @Query("SELECT m FROM Medicine m WHERE m.active = true AND m.expiryDate < CURRENT_DATE")
    List<Medicine> findExpired();

    @Query("SELECT COALESCE(SUM(m.quantity * m.price), 0) FROM Medicine m WHERE m.active = true")
    java.math.BigDecimal totalInventoryValue();
}
