package com.medistock.repository;

import com.medistock.entity.Medicine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    Optional<Medicine> findByMedicineCode(String medicineCode);
    boolean existsByMedicineCode(String medicineCode);
    boolean existsBySupplierId(Long supplierId);
    long countBySupplierId(Long supplierId);

    @Query("SELECT m FROM Medicine m WHERE " +
           "LOWER(m.medicineName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.medicineCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.genericName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.category) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.manufacturer) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.batchNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.supplier.supplierName) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Medicine> searchMedicines(@Param("search") String search, Pageable pageable);

    Page<Medicine> findByCategory(String category, Pageable pageable);

    Page<Medicine> findBySupplierId(Long supplierId, Pageable pageable);

    @Query("SELECT m FROM Medicine m WHERE " +
           "(:search = '' OR " +
           " LOWER(m.medicineName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(m.medicineCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(m.genericName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(m.manufacturer) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(m.batchNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " (m.supplier IS NOT NULL AND LOWER(m.supplier.supplierName) LIKE LOWER(CONCAT('%', :search, '%')))) " +
           "AND (:category = '' OR m.category = :category) " +
           "AND (:supplierId IS NULL OR m.supplier.id = :supplierId) " +
           "AND (:batchNumber = '' OR LOWER(m.batchNumber) LIKE LOWER(CONCAT('%', :batchNumber, '%')))")
    Page<Medicine> searchAndFilter(
            @Param("search") String search,
            @Param("category") String category,
            @Param("supplierId") Long supplierId,
            @Param("batchNumber") String batchNumber,
            Pageable pageable);

    @Query("SELECT DISTINCT m.category FROM Medicine m WHERE m.category IS NOT NULL ORDER BY m.category")
    List<String> findDistinctCategories();

    List<Medicine> findBySupplierId(Long supplierId);
}
