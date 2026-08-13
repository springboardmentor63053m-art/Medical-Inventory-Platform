package com.medistock.medicine.repository;

import com.medistock.medicine.entity.Medicine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    Optional<Medicine> findByMedicineCode(String medicineCode);
    Boolean existsByMedicineCode(String medicineCode);
    List<Medicine> findByNameContainingIgnoreCase(String name);
    List<Medicine> findByCategoryId(Long categoryId);
    long countByCategoryId(Long categoryId);

    @org.springframework.data.jpa.repository.Query(
        value = "SELECT DISTINCT m.* FROM medicines m JOIN supplier_medicines sm ON m.id = sm.medicine_id WHERE sm.supplier_id = :supplierId",
        countQuery = "SELECT COUNT(DISTINCT m.id) FROM medicines m JOIN supplier_medicines sm ON m.id = sm.medicine_id WHERE sm.supplier_id = :supplierId",
        nativeQuery = true
    )
    Page<Medicine> findBySupplierId(@org.springframework.data.repository.query.Param("supplierId") Long supplierId, Pageable pageable);

    @org.springframework.data.jpa.repository.Query(
        value = "SELECT DISTINCT m.* FROM medicines m JOIN supplier_medicines sm ON m.id = sm.medicine_id WHERE sm.supplier_id = :supplierId AND (LOWER(m.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(m.generic_name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(m.medicine_code) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(m.manufacturer) LIKE LOWER(CONCAT('%', :query, '%')))",
        countQuery = "SELECT COUNT(DISTINCT m.id) FROM medicines m JOIN supplier_medicines sm ON m.id = sm.medicine_id WHERE sm.supplier_id = :supplierId AND (LOWER(m.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(m.generic_name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(m.medicine_code) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(m.manufacturer) LIKE LOWER(CONCAT('%', :query, '%')))",
        nativeQuery = true
    )
    Page<Medicine> searchBySupplierId(@org.springframework.data.repository.query.Param("supplierId") Long supplierId, @org.springframework.data.repository.query.Param("query") String query, Pageable pageable);

    @org.springframework.data.jpa.repository.Query(
        value = "SELECT DISTINCT m.* FROM medicines m JOIN supplier_medicines sm ON m.id = sm.medicine_id WHERE sm.supplier_id = :supplierId AND m.category_id = :categoryId",
        nativeQuery = true
    )
    List<Medicine> findBySupplierIdAndCategoryId(@org.springframework.data.repository.query.Param("supplierId") Long supplierId, @org.springframework.data.repository.query.Param("categoryId") Long categoryId);

    @org.springframework.data.jpa.repository.Query(
        value = "SELECT m.* FROM medicines m WHERE (LOWER(m.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(m.generic_name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(m.medicine_code) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(m.manufacturer) LIKE LOWER(CONCAT('%', :query, '%')))",
        countQuery = "SELECT COUNT(m.id) FROM medicines m WHERE (LOWER(m.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(m.generic_name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(m.medicine_code) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(m.manufacturer) LIKE LOWER(CONCAT('%', :query, '%')))",
        nativeQuery = true
    )
    Page<Medicine> searchMasterCatalog(@org.springframework.data.repository.query.Param("query") String query, Pageable pageable);

    @org.springframework.data.jpa.repository.Query(
        value = "SELECT m.* FROM medicines m WHERE m.category_id = :categoryId",
        countQuery = "SELECT COUNT(m.id) FROM medicines m WHERE m.category_id = :categoryId",
        nativeQuery = true
    )
    Page<Medicine> findByCategoryIdMaster(@org.springframework.data.repository.query.Param("categoryId") Long categoryId, Pageable pageable);
}
