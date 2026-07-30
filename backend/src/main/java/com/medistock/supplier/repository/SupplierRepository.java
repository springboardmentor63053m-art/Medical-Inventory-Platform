package com.medistock.supplier.repository;

import com.medistock.supplier.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    Optional<Supplier> findBySupplierCode(String supplierCode);
    Boolean existsBySupplierCode(String supplierCode);
    List<Supplier> findBySupplierNameContainingIgnoreCase(String name);
}
