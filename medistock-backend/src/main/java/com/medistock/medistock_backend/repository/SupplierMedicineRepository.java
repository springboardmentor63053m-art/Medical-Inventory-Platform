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
    Optional<SupplierMedicine> findBySupplierIdAndMedicineId(Long supplierId, Long medicineId);
    List<SupplierMedicine> findBySupplierId(Long supplierId);

    @Query("SELECT sm FROM SupplierMedicine sm JOIN sm.medicine m LEFT JOIN m.inventory i WHERE " +
           "sm.supplier.id = :supplierId AND " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(m.code) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(m.genericName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(m.manufacturer) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:categoryId IS NULL OR m.category.id = :categoryId) AND " +
           "(:stockStatus IS NULL OR :stockStatus = '' OR :stockStatus = 'ALL' OR " +
           "   (:stockStatus = 'EXPIRED' AND m.expiryDate < :today) OR " +
           "   (:stockStatus = 'NEAR_EXPIRY' AND m.expiryDate >= :today AND m.expiryDate <= :nearExpiryDate) OR " +
           "   (:stockStatus = 'OUT_OF_STOCK' AND COALESCE(i.quantity, 0) = 0) OR " +
           "   (:stockStatus = 'LOW_STOCK' AND COALESCE(i.quantity, 0) <= COALESCE(i.reorderLevel, 0)) OR " +
           "   (:stockStatus = 'AVAILABLE' AND COALESCE(i.quantity, 0) > COALESCE(i.reorderLevel, 0)))")
    Page<SupplierMedicine> filterSupplierMedicines(
        @Param("supplierId") Long supplierId,
        @Param("search") String search,
        @Param("categoryId") Long categoryId,
        @Param("stockStatus") String stockStatus,
        @Param("today") LocalDate today,
        @Param("nearExpiryDate") LocalDate nearExpiryDate,
        Pageable pageable
    );

    @Query("SELECT sm FROM SupplierMedicine sm JOIN sm.medicine m LEFT JOIN m.inventory i WHERE " +
           "sm.supplier.id = :supplierId AND " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(m.code) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(m.genericName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(m.manufacturer) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:categoryId IS NULL OR m.category.id = :categoryId) AND " +
           "(:stockStatus IS NULL OR :stockStatus = '' OR :stockStatus = 'ALL' OR " +
           "   (:stockStatus = 'EXPIRED' AND m.expiryDate < :today) OR " +
           "   (:stockStatus = 'NEAR_EXPIRY' AND m.expiryDate >= :today AND m.expiryDate <= :nearExpiryDate) OR " +
           "   (:stockStatus = 'OUT_OF_STOCK' AND COALESCE(i.quantity, 0) = 0) OR " +
           "   (:stockStatus = 'LOW_STOCK' AND COALESCE(i.quantity, 0) <= COALESCE(i.reorderLevel, 0)) OR " +
           "   (:stockStatus = 'AVAILABLE' AND COALESCE(i.quantity, 0) > COALESCE(i.reorderLevel, 0)))")
    List<SupplierMedicine> filterSupplierMedicinesList(
        @Param("supplierId") Long supplierId,
        @Param("search") String search,
        @Param("categoryId") Long categoryId,
        @Param("stockStatus") String stockStatus,
        @Param("today") LocalDate today,
        @Param("nearExpiryDate") LocalDate nearExpiryDate
    );
}
