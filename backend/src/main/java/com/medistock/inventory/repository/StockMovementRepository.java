package com.medistock.inventory.repository;

import com.medistock.inventory.entity.StockMovement;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    @EntityGraph(attributePaths = {"medicine"})
    List<StockMovement> findAllByOrderByTimestampDesc();

    @EntityGraph(attributePaths = {"medicine"})
    List<StockMovement> findByMovementTypeOrderByTimestampDesc(String movementType);

    @EntityGraph(attributePaths = {"medicine"})
    List<StockMovement> findByMedicineIdOrderByTimestampDesc(Long medicineId);

    @EntityGraph(attributePaths = {"medicine"})
    @Query("SELECT sm FROM StockMovement sm WHERE " +
           "(:type IS NULL OR :type = '' OR :type = 'ALL' OR LOWER(sm.movementType) = LOWER(:type)) AND " +
           "(:query IS NULL OR :query = '' OR LOWER(sm.medicineName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(sm.medicineCode) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(sm.batchNumber) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY sm.timestamp DESC")
    List<StockMovement> searchMovements(@Param("type") String type, @Param("query") String query);
}
