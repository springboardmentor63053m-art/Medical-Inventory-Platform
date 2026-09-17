package com.medistock.repository;

import com.medistock.model.SaleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {

    /** Most recent sale date per medicine that has ever been sold — used for dead-stock detection. */
    @Query("SELECT si.medicine.id, MAX(si.sale.saleDate) FROM SaleItem si GROUP BY si.medicine.id")
    List<Object[]> findLastSaleDatePerMedicine();

    /** Total quantity of medicines sold during a date range. */
    @Query("""
            SELECT COALESCE(SUM(si.quantity), 0)
            FROM SaleItem si
            WHERE si.sale.saleDate >= :start
              AND si.sale.saleDate < :end
            """)
    long sumQuantitySoldBetween(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    /** Top-selling medicines by quantity and revenue. */
    @Query("""
            SELECT si.medicine.name,
                   SUM(si.quantity),
                   COALESCE(SUM(si.subtotal), 0)
            FROM SaleItem si
            GROUP BY si.medicine.id, si.medicine.name
            ORDER BY SUM(si.quantity) DESC
            """)
    List<Object[]> findTopSellingMedicines();
}