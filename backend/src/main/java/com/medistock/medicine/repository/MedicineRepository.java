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
}
