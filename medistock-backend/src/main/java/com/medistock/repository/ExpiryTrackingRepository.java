package com.medistock.repository;

import com.medistock.entity.ExpiryTracking;
import com.medistock.enums.ExpiryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpiryTrackingRepository extends JpaRepository<ExpiryTracking, Long> {
    Page<ExpiryTracking> findByStatus(ExpiryStatus status, Pageable pageable);
    List<ExpiryTracking> findByStatus(ExpiryStatus status);
    Page<ExpiryTracking> findByMedicineId(Long medicineId, Pageable pageable);

    @Query("SELECT e FROM ExpiryTracking e WHERE e.expiryDate BETWEEN :startDate AND :endDate")
    List<ExpiryTracking> findExpiringSoon(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT e FROM ExpiryTracking e WHERE e.expiryDate < :date")
    List<ExpiryTracking> findExpiredBefore(@Param("date") LocalDate date);

    long countByStatus(ExpiryStatus status);

    List<ExpiryTracking> findByMedicineId(Long medicineId);

    java.util.Optional<ExpiryTracking> findByMedicineIdAndBatchNumber(Long medicineId, String batchNumber);

    @Query("SELECT COALESCE(SUM(e.quantity), 0) FROM ExpiryTracking e WHERE e.status = :status")
    long sumQuantityByStatus(@Param("status") ExpiryStatus status);

}
