package com.medistock.repository;

import com.medistock.model.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    List<Sale> findAllByOrderBySaleDateDesc();

    List<Sale> findTop10ByOrderBySaleDateDesc();

    List<Sale> findBySoldBy_IdOrderBySaleDateDesc(Long userId);

    List<Sale> findBySaleDateBetween(LocalDateTime start, LocalDateTime end);

    long countBySaleDateBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sale s " +
           "WHERE s.saleDate >= :start AND s.saleDate < :end")
    BigDecimal sumSalesBetween(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(s) FROM Sale s " +
           "WHERE s.saleDate >= :start AND s.saleDate < :end")
    long countSalesBetween(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sale s " +
           "WHERE s.saleDate >= :start AND s.saleDate < :end")
    BigDecimal totalSalesBetween(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("""
        SELECT s.saleDate, s.totalAmount
        FROM Sale s
        WHERE s.saleDate >= :start
          AND s.saleDate < :end
        ORDER BY s.saleDate DESC
        """)
List<Object[]> findSaleDatesAndAmountsBetween(
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end);
}