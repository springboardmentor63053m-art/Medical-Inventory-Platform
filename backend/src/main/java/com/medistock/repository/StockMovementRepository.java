package com.medistock.repository;

import com.medistock.model.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    List<StockMovement> findAllByOrderByTimestampDesc();
    List<StockMovement> findByMedicine_IdOrderByTimestampDesc(Long medicineId);
}
