package com.medistock.prescription.repository;

import com.medistock.prescription.entity.StorePurchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StorePurchaseRepository extends JpaRepository<StorePurchase, Long> {
    List<StorePurchase> findAllByOrderByCreatedAtDesc();
}
