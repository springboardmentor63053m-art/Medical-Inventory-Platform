package com.medistock.medistock_backend.repository;

import com.medistock.medistock_backend.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BatchRepository extends JpaRepository<Batch, Long> {
    List<Batch> findByMedicineId(Long medicineId);
    Optional<Batch> findByMedicineIdAndBatchNo(Long medicineId, String batchNo);
}
