package com.medistock.medistock_backend.repository;

import com.medistock.medistock_backend.entity.SupplierMedicine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierMedicineRepository extends JpaRepository<SupplierMedicine, Long> {
    Optional<SupplierMedicine> findBySupplierIdAndCode(Long supplierId, String code);
    List<SupplierMedicine> findBySupplierId(Long supplierId);

    @Query("SELECT sm FROM SupplierMedicine sm " +
           "LEFT JOIN Medicine m ON sm.code = m.code " +
           "LEFT JOIN m.inventory i WHERE " +
           "(:supplierId IS NULL OR sm.supplier.id = :supplierId) AND " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(sm.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(sm.code) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(sm.genericName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(sm.manufacturer) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:categoryId IS NULL OR sm.category.id = :categoryId) AND " +
           "(:stockStatus IS NULL OR :stockStatus = '' OR :stockStatus = 'ALL' OR " +
           "   (:stockStatus = 'EXPIRED' AND sm.expiryDate < :today) OR " +
           "   (:stockStatus = 'NEAR_EXPIRY' AND COALESCE(i.quantity, 0) > 0 AND sm.expiryDate >= :today AND sm.expiryDate <= :nearExpiryDate) OR " +
           "   (:stockStatus = 'OUT_OF_STOCK' AND COALESCE(i.quantity, 0) = 0) OR " +
           "   (:stockStatus = 'LOW_STOCK' AND COALESCE(i.quantity, 0) > 0 AND COALESCE(i.quantity, 0) <= COALESCE(i.reorderLevel, 10)) OR " +
           "   (:stockStatus = 'AVAILABLE' AND COALESCE(i.quantity, 0) > COALESCE(i.reorderLevel, 10)))")
    Page<SupplierMedicine> filterSupplierMedicines(
        @Param("supplierId") Long supplierId,
        @Param("search") String search,
        @Param("categoryId") Long categoryId,
        @Param("stockStatus") String stockStatus,
        @Param("today") LocalDate today,
        @Param("nearExpiryDate") LocalDate nearExpiryDate,
        Pageable pageable
    );

    @Query("SELECT sm FROM SupplierMedicine sm " +
           "LEFT JOIN Medicine m ON sm.code = m.code " +
           "LEFT JOIN m.inventory i WHERE " +
           "(:supplierId IS NULL OR sm.supplier.id = :supplierId) AND " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(sm.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(sm.code) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(sm.genericName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(sm.manufacturer) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:categoryId IS NULL OR sm.category.id = :categoryId) AND " +
           "(:stockStatus IS NULL OR :stockStatus = '' OR :stockStatus = 'ALL' OR " +
           "   (:stockStatus = 'EXPIRED' AND sm.expiryDate < :today) OR " +
           "   (:stockStatus = 'NEAR_EXPIRY' AND COALESCE(i.quantity, 0) > 0 AND sm.expiryDate >= :today AND sm.expiryDate <= :nearExpiryDate) OR " +
           "   (:stockStatus = 'OUT_OF_STOCK' AND COALESCE(i.quantity, 0) = 0) OR " +
           "   (:stockStatus = 'LOW_STOCK' AND COALESCE(i.quantity, 0) > 0 AND COALESCE(i.quantity, 0) <= COALESCE(i.reorderLevel, 10)) OR " +
           "   (:stockStatus = 'AVAILABLE' AND COALESCE(i.quantity, 0) > COALESCE(i.reorderLevel, 10)))")
    List<SupplierMedicine> filterSupplierMedicinesList(
        @Param("supplierId") Long supplierId,
        @Param("search") String search,
        @Param("categoryId") Long categoryId,
        @Param("stockStatus") String stockStatus,
        @Param("today") LocalDate today,
        @Param("nearExpiryDate") LocalDate nearExpiryDate
    );

    @Query("SELECT COUNT(sm) FROM SupplierMedicine sm " +
           "LEFT JOIN Medicine m ON sm.code = m.code " +
           "LEFT JOIN m.inventory i " +
           "WHERE COALESCE(i.quantity, 0) > COALESCE(i.reorderLevel, 10)")
    long countAvailableSupplierMedicines();

    @Query("SELECT COUNT(sm) FROM SupplierMedicine sm " +
           "LEFT JOIN Medicine m ON sm.code = m.code " +
           "LEFT JOIN m.inventory i " +
           "WHERE COALESCE(i.quantity, 0) > 0 AND COALESCE(i.quantity, 0) <= COALESCE(i.reorderLevel, 10)")
    long countLowStockSupplierMedicines();

    @Query("SELECT COUNT(sm) FROM SupplierMedicine sm " +
           "LEFT JOIN Medicine m ON sm.code = m.code " +
           "LEFT JOIN m.inventory i " +
           "WHERE COALESCE(i.quantity, 0) = 0")
    long countOutOfStockSupplierMedicines();

    @Query("SELECT COUNT(sm) FROM SupplierMedicine sm " +
           "LEFT JOIN Medicine m ON sm.code = m.code " +
           "LEFT JOIN m.inventory i " +
           "WHERE COALESCE(i.quantity, 0) > 0 AND sm.expiryDate >= :today AND sm.expiryDate <= :nearExpiryDate")
    long countNearExpirySupplierMedicines(@Param("today") LocalDate today, @Param("nearExpiryDate") LocalDate nearExpiryDate);
}
