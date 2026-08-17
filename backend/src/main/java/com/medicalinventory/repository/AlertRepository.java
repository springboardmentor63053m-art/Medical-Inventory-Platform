package com.medicalinventory.repository;

import com.medicalinventory.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByStatusOrderByCreatedAtDesc(Alert.AlertStatus status);
    List<Alert> findByMedicineIdAndAlertTypeAndStatus(Long medicineId, Alert.AlertType type, Alert.AlertStatus status);
    Long countByStatus(Alert.AlertStatus status);
    void deleteByMedicineId(Long medicineId);
}
