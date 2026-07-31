package com.medicalinventory.repository;

import com.medicalinventory.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    List<Supplier> findByIsActive(Boolean isActive);
    Long countByIsActive(Boolean isActive);
}
