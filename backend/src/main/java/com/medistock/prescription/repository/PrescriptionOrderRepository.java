package com.medistock.prescription.repository;

import com.medistock.prescription.entity.PrescriptionOrder;
import com.medistock.prescription.entity.PrescriptionOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface PrescriptionOrderRepository extends JpaRepository<PrescriptionOrder, Long> {
    List<PrescriptionOrder> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<PrescriptionOrder> findAllByOrderByCreatedAtDesc();
    List<PrescriptionOrder> findByStatusOrderByCreatedAtDesc(PrescriptionOrderStatus status);
    List<PrescriptionOrder> findByStatusInOrderByCreatedAtDesc(Collection<PrescriptionOrderStatus> statuses);
    Optional<PrescriptionOrder> findByOrderNumber(String orderNumber);
}
