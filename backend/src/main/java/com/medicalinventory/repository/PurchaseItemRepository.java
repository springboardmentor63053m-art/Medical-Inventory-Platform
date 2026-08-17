package com.medicalinventory.repository;

import com.medicalinventory.entity.PurchaseItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseItemRepository extends JpaRepository<PurchaseItem, Long> {
    List<PurchaseItem> findByMedicineId(Long medicineId);

    @Modifying
    @Query("DELETE FROM PurchaseItem p WHERE p.medicine.id = :medicineId")
    void deleteByMedicineId(@Param("medicineId") Long medicineId);
}
