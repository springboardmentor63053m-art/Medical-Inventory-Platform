package com.medistock.medistock_backend.repository;

import com.medistock.medistock_backend.entity.Medicine;
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
public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    Optional<Medicine> findByCode(String code);
    List<Medicine> findByNameContainingIgnoreCase(String name);
    
    @Query("SELECT m FROM Medicine m WHERE " +
           "LOWER(m.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.code) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.genericName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Medicine> searchMedicines(@Param("query") String query);
    List<Medicine> findByCategoryId(Long categoryId);
    List<Medicine> findBySupplierId(Long supplierId);
    List<Medicine> findByExpiryDateBefore(LocalDate date);

    @Query("SELECT m FROM Medicine m " +
           "LEFT JOIN m.inventory i " +
           "WHERE (:search IS NULL OR :search = '' OR " +
           "       LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "       LOWER(m.code) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "       LOWER(m.genericName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "       LOWER(m.manufacturer) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:categoryId IS NULL OR m.category.id = :categoryId) AND " +
           "(:supplierId IS NULL OR m.supplier.id = :supplierId) AND " +
           "(:stockStatus IS NULL OR :stockStatus = '' OR :stockStatus = 'ALL' OR " +
           "   (:stockStatus = 'EXPIRED' AND m.expiryDate < :today) OR " +
           "   (:stockStatus = 'NEAR_EXPIRY' AND m.expiryDate >= :today AND m.expiryDate <= :nearExpiryDate) OR " +
           "   (:stockStatus = 'OUT_OF_STOCK' AND COALESCE(i.quantity, 0) = 0 AND (m.expiryDate IS NULL OR m.expiryDate >= :today)) OR " +
           "   (:stockStatus = 'LOW_STOCK' AND COALESCE(i.quantity, 0) <= COALESCE(i.reorderLevel, 0) AND COALESCE(i.quantity, 0) > 0 AND (m.expiryDate IS NULL OR m.expiryDate > :nearExpiryDate)) OR " +
           "   (:stockStatus = 'AVAILABLE' AND COALESCE(i.quantity, 0) > COALESCE(i.reorderLevel, 0) AND (m.expiryDate IS NULL OR m.expiryDate > :nearExpiryDate)))")
    Page<Medicine> filterMedicines(
        @Param("search") String search,
        @Param("categoryId") Long categoryId,
        @Param("supplierId") Long supplierId,
        @Param("stockStatus") String stockStatus,
        @Param("today") LocalDate today,
        @Param("nearExpiryDate") LocalDate nearExpiryDate,
        Pageable pageable
    );

    @Query("SELECT m FROM Medicine m " +
           "LEFT JOIN m.inventory i " +
           "WHERE (:search IS NULL OR :search = '' OR " +
           "       LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "       LOWER(m.code) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "       LOWER(m.genericName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "       LOWER(m.manufacturer) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:categoryId IS NULL OR m.category.id = :categoryId) AND " +
           "(:supplierId IS NULL OR m.supplier.id = :supplierId) AND " +
           "(:stockStatus IS NULL OR :stockStatus = '' OR :stockStatus = 'ALL' OR " +
           "   (:stockStatus = 'EXPIRED' AND m.expiryDate < :today) OR " +
           "   (:stockStatus = 'NEAR_EXPIRY' AND m.expiryDate >= :today AND m.expiryDate <= :nearExpiryDate) OR " +
           "   (:stockStatus = 'OUT_OF_STOCK' AND COALESCE(i.quantity, 0) = 0 AND (m.expiryDate IS NULL OR m.expiryDate >= :today)) OR " +
           "   (:stockStatus = 'LOW_STOCK' AND COALESCE(i.quantity, 0) <= COALESCE(i.reorderLevel, 0) AND COALESCE(i.quantity, 0) > 0 AND (m.expiryDate IS NULL OR m.expiryDate > :nearExpiryDate)) OR " +
           "   (:stockStatus = 'AVAILABLE' AND COALESCE(i.quantity, 0) > COALESCE(i.reorderLevel, 0) AND (m.expiryDate IS NULL OR m.expiryDate > :nearExpiryDate)))")
    List<Medicine> filterMedicinesList(
        @Param("search") String search,
        @Param("categoryId") Long categoryId,
        @Param("supplierId") Long supplierId,
        @Param("stockStatus") String stockStatus,
        @Param("today") LocalDate today,
        @Param("nearExpiryDate") LocalDate nearExpiryDate
    );

    @Query("SELECT COUNT(m) FROM Medicine m LEFT JOIN m.inventory i WHERE COALESCE(i.quantity, 0) > COALESCE(i.reorderLevel, 0) AND (m.expiryDate IS NULL OR m.expiryDate > :nearExpiryDate)")
    long countAvailableMedicines(@Param("nearExpiryDate") LocalDate nearExpiryDate);

    @Query("SELECT COUNT(m) FROM Medicine m LEFT JOIN m.inventory i WHERE COALESCE(i.quantity, 0) <= COALESCE(i.reorderLevel, 0) AND COALESCE(i.quantity, 0) > 0 AND (m.expiryDate IS NULL OR m.expiryDate > :nearExpiryDate)")
    long countLowStockMedicines(@Param("nearExpiryDate") LocalDate nearExpiryDate);

    @Query("SELECT COUNT(m) FROM Medicine m LEFT JOIN m.inventory i WHERE COALESCE(i.quantity, 0) = 0 AND (m.expiryDate IS NULL OR m.expiryDate >= :today)")
    long countOutOfStockMedicines(@Param("today") LocalDate today);

    @Query("SELECT COUNT(m) FROM Medicine m WHERE m.expiryDate >= :today AND m.expiryDate <= :nearExpiryDate")
    long countNearExpiryMedicines(@Param("today") LocalDate today, @Param("nearExpiryDate") LocalDate nearExpiryDate);

    @Query("SELECT COUNT(m) FROM Medicine m WHERE m.expiryDate < :today")
    long countExpiredMedicines(@Param("today") LocalDate today);
}
