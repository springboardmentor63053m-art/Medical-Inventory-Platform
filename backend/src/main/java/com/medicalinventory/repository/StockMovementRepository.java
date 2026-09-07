package com.medicalinventory.repository;

import com.medicalinventory.entity.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    List<StockMovement> findByMedicineIdOrderByCreatedAtDesc(Long medicineId);

    List<StockMovement> findByMovementTypeOrderByCreatedAtDesc(StockMovement.MovementType type);

    @Query("SELECT sm FROM StockMovement sm WHERE sm.createdAt BETWEEN :from AND :to ORDER BY sm.createdAt DESC")
    List<StockMovement> findByDateRange(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    List<StockMovement> findTop20ByOrderByCreatedAtDesc();

    void deleteByMedicineId(Long medicineId);
}
