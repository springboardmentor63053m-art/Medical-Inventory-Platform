package com.medistock.repository;

import com.medistock.model.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    List<StockMovement> findAllByOrderByTimestampDesc();

    List<StockMovement> findTop12ByOrderByTimestampDesc();

    List<StockMovement> findByMedicine_IdOrderByTimestampDesc(Long medicineId);

    /** Used by the soft-delete check (requirement 10) — true once a medicine has any recorded movement. */
    boolean existsByMedicine_Id(Long medicineId);
}