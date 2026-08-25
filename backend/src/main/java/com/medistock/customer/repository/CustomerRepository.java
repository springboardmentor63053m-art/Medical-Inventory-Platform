package com.medistock.customer.repository;

import com.medistock.customer.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByNormalizedPhone(String normalizedPhone);
    boolean existsByNormalizedPhone(String normalizedPhone);
    List<Customer> findAllByOrderByCreatedAtDesc();
    Page<Customer> findByNameContainingIgnoreCaseOrNormalizedPhoneContaining(String name, String phone, Pageable pageable);
    Page<Customer> findByStatus(String status, Pageable pageable);
    Page<Customer> findByStatusAndNameContainingIgnoreCaseOrStatusAndNormalizedPhoneContaining(String status1, String name, String status2, String phone, Pageable pageable);
}
