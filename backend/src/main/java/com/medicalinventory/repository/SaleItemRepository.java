package com.medicalinventory.repository;

import com.medicalinventory.entity.SaleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {
    List<SaleItem> findByMedicineId(Long medicineId);

    @Modifying
    @Query("DELETE FROM SaleItem s WHERE s.medicine.id = :medicineId")
    void deleteByMedicineId(@Param("medicineId") Long medicineId);
}
