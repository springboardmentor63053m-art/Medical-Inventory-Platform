package com.medistock.medistock_backend.repository;

import com.medistock.medistock_backend.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    Optional<Supplier> findByName(String name);
    List<Supplier> findByNameContainingIgnoreCase(String name);
    Optional<Supplier> findByEmail(String email);
    Optional<Supplier> findByUserId(Long userId);
}
