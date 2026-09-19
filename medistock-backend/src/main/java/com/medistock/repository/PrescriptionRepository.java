package com.medistock.repository;

import com.medistock.entity.Prescription;
import com.medistock.enums.PrescriptionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    Page<Prescription> findByStatus(PrescriptionStatus status, Pageable pageable);
    List<Prescription> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    Page<Prescription> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
