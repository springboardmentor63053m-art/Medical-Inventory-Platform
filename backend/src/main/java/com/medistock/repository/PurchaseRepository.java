package com.medistock.repository;

import com.medistock.model.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    List<Purchase> findByPurchasedBy_IdOrderByPurchaseDateDesc(Long userId);

    List<Purchase> findAllByOrderByPurchaseDateDesc();

    List<Purchase> findTop15ByOrderByPurchaseDateDesc();

    /** This supplier's own purchase/order history — powers the Supplier dashboard. */
    List<Purchase> findBySupplier_IdOrderByPurchaseDateDesc(Long supplierId);

    @Query("SELECT COALESCE(SUM(p.totalAmount), 0) FROM Purchase p WHERE p.supplier.id = :supplierId")
    java.math.BigDecimal totalSpendForSupplier(@Param("supplierId") Long supplierId);

    @Query("SELECT p FROM Purchase p WHERE p.purchaseDate >= :from ORDER BY p.purchaseDate DESC")
    List<Purchase> findSince(@Param("from") LocalDateTime from);

    @Query("SELECT COALESCE(SUM(p.totalAmount), 0) FROM Purchase p WHERE p.purchaseDate >= :from")
    java.math.BigDecimal totalSpendSince(@Param("from") LocalDateTime from);

    @Query("SELECT p.supplier.name, COUNT(p), COALESCE(SUM(p.totalAmount), 0) FROM Purchase p GROUP BY p.supplier.name ORDER BY SUM(p.totalAmount) DESC")
    List<Object[]> supplyInsightBySupplier();

    @Query("""
        SELECT COALESCE(SUM(p.totalAmount), 0)
        FROM Purchase p
        """)
    java.math.BigDecimal totalPurchaseValueAllTime();

    @Query("SELECT COUNT(p) FROM Purchase p")
    long countAllPurchases();

    @Query("""
        SELECT p.purchaseDate, p.totalAmount
        FROM Purchase p
        WHERE p.purchaseDate >= :start
          AND p.purchaseDate < :end
        ORDER BY p.purchaseDate DESC
        """)
    List<Object[]> findPurchaseDatesAndAmountsBetween(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
}