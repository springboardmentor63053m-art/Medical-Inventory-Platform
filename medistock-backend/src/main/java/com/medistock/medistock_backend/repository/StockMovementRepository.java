package com.medistock.medistock_backend.repository;

import com.medistock.medistock_backend.entity.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    List<StockMovement> findByBatchMedicineIdOrderByDateDesc(Long medicineId);
    List<StockMovement> findAllByOrderByDateDesc();
}
