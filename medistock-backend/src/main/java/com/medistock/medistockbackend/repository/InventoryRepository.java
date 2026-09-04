package com.medistock.medistockbackend.repository;

import com.medistock.medistockbackend.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.Query;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    @Query("SELECT i FROM Inventory i WHERE i.expiryDate IS NOT NULL AND i.expiryDate <= :thresholdDate ORDER BY i.expiryDate ASC")
    List<Inventory> findUpcomingExpiries(@Param("thresholdDate") LocalDate thresholdDate);
}
