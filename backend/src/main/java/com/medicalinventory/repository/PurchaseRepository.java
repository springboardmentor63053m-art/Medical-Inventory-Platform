package com.medicalinventory.repository;

import com.medicalinventory.entity.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    List<Purchase> findByStatusOrderByCreatedAtDesc(Purchase.PurchaseStatus status);

    List<Purchase> findBySupplierId(Long supplierId);

    @Query("SELECT p FROM Purchase p WHERE p.purchaseDate BETWEEN :from AND :to ORDER BY p.purchaseDate DESC")
    List<Purchase> findByDateRange(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT COALESCE(SUM(p.netAmount), 0) FROM Purchase p WHERE p.status = 'RECEIVED' AND p.purchaseDate BETWEEN :from AND :to")
    BigDecimal sumNetAmountByDateRange(@Param("from") LocalDate from, @Param("to") LocalDate to);

    List<Purchase> findTop10ByOrderByCreatedAtDesc();
}
