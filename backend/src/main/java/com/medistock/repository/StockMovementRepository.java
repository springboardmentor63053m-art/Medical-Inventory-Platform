package com.medistock.repository;

import com.medistock.model.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    List<StockMovement> findAllByOrderByTimestampDesc();

    @Query("""
    SELECT sm
    FROM StockMovement sm
    LEFT JOIN FETCH sm.medicine
    LEFT JOIN FETCH sm.performedBy
    ORDER BY sm.timestamp DESC
    """)
List<StockMovement> findRecentStockMovementsWithDetails(
        org.springframework.data.domain.Pageable pageable);

    List<StockMovement> findByMedicine_IdOrderByTimestampDesc(Long medicineId);

    /** Used by the soft-delete check (requirement 10) — true once a medicine has any recorded movement. */
    boolean existsByMedicine_Id(Long medicineId);
}