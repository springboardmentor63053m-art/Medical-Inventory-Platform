package com.medistock.prescription.repository;

import com.medistock.prescription.entity.PrescriptionOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PrescriptionOrderRepository extends JpaRepository<PrescriptionOrder, Long> {
    List<PrescriptionOrder> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<PrescriptionOrder> findAllByOrderByCreatedAtDesc();
    List<PrescriptionOrder> findByStatusOrderByCreatedAtDesc(String status);
    List<PrescriptionOrder> findByStatusInOrderByCreatedAtDesc(List<String> statuses);
    Optional<PrescriptionOrder> findByOrderNumber(String orderNumber);
}
