package com.medicalinventory.repository;

import com.medicalinventory.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    List<Medicine> findByStatus(Medicine.MedicineStatus status);

    long countByStatus(Medicine.MedicineStatus status);

    List<Medicine> findByCategoryId(Long categoryId);

    List<Medicine> findBySupplierId(Long supplierId);

    @Query("SELECT m FROM Medicine m WHERE " +
           "LOWER(m.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(m.genericName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(m.brandName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Medicine> searchByKeyword(@Param("keyword") String keyword);

    boolean existsByCategoryId(Long categoryId);
}

