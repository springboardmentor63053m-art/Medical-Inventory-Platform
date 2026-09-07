package com.medicalinventory.repository;

import com.medicalinventory.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

    List<Sale> findByStatusOrderByCreatedAtDesc(Sale.SaleStatus status);

    @Query("SELECT s FROM Sale s WHERE s.saleDate BETWEEN :from AND :to ORDER BY s.saleDate DESC")
    List<Sale> findByDateRange(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT COALESCE(SUM(s.netAmount), 0) FROM Sale s WHERE s.status = 'COMPLETED' AND s.saleDate BETWEEN :from AND :to")
    BigDecimal sumNetAmountByDateRange(@Param("from") LocalDate from, @Param("to") LocalDate to);

    List<Sale> findTop10ByOrderByCreatedAtDesc();

    @Query("SELECT MONTH(s.saleDate) as month, COALESCE(SUM(s.netAmount), 0) as revenue " +
           "FROM Sale s WHERE s.status = 'COMPLETED' AND YEAR(s.saleDate) = :year GROUP BY MONTH(s.saleDate)")
    List<Object[]> monthlySalesRevenue(@Param("year") int year);

    @Query("SELECT MONTH(s.saleDate) as month, COALESCE(SUM(s.netAmount), 0) as revenue " +
           "FROM Sale s WHERE s.status = 'COMPLETED' GROUP BY MONTH(s.saleDate) ORDER BY MONTH(s.saleDate)")
    List<Object[]> allMonthlySalesRevenue();
}

