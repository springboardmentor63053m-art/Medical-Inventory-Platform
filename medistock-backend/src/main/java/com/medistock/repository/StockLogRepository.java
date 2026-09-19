package com.medistock.repository;

import com.medistock.entity.StockLog;
import com.medistock.enums.ActionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockLogRepository extends JpaRepository<StockLog, Long> {
    Page<StockLog> findByMedicineId(Long medicineId, Pageable pageable);
    Page<StockLog> findByActionType(ActionType actionType, Pageable pageable);
    List<StockLog> findByMedicineIdOrderByCreatedAtDesc(Long medicineId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(s) FROM StockLog s WHERE s.actionType IN :actionTypes")
    long countByActionTypeIn(@org.springframework.data.repository.query.Param("actionTypes") List<ActionType> actionTypes);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(s.quantity), 0) FROM StockLog s WHERE s.actionType IN :actionTypes")
    long sumQuantityByActionTypeIn(@org.springframework.data.repository.query.Param("actionTypes") List<ActionType> actionTypes);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(s.quantity), 0) FROM StockLog s WHERE s.actionType IN :actionTypes AND s.createdAt BETWEEN :from AND :to")
    long sumQuantityByActionTypeInAndCreatedAtBetween(
            @org.springframework.data.repository.query.Param("actionTypes") List<ActionType> actionTypes,
            @org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from,
            @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);

    @org.springframework.data.jpa.repository.Query("SELECT s FROM StockLog s WHERE " +
           "(:from IS NULL OR s.createdAt >= :from) AND " +
           "(:to IS NULL OR s.createdAt <= :to) AND " +
           "(:medicineId IS NULL OR s.medicine.id = :medicineId) AND " +
           "(:actionType IS NULL OR s.actionType = :actionType)")
    List<StockLog> findStockLogsForReport(
            @org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from,
            @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to,
            @org.springframework.data.repository.query.Param("medicineId") Long medicineId,
            @org.springframework.data.repository.query.Param("actionType") ActionType actionType);

}
