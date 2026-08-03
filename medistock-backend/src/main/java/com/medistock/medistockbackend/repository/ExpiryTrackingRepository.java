package com.medistock.medistockbackend.repository;

import com.medistock.medistockbackend.entity.ExpiryTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpiryTrackingRepository extends JpaRepository<ExpiryTracking, Long> {
    List<ExpiryTracking> findByStatus(String status);
}
