package com.medistock.medistock_backend.repository;

import com.medistock.medistock_backend.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    Optional<Medicine> findByCode(String code);
    List<Medicine> findByNameContainingIgnoreCase(String name);
    List<Medicine> findByCategoryId(Long categoryId);
    List<Medicine> findBySupplierId(Long supplierId);
    List<Medicine> findByExpiryDateBefore(LocalDate date);
}
