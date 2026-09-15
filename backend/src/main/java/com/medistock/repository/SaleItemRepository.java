package com.medistock.repository;

import com.medistock.model.SaleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {

    /** Most recent sale date per medicine that has ever been sold — used for dead-stock detection. */
    @Query("SELECT si.medicine.id, MAX(si.sale.saleDate) FROM SaleItem si GROUP BY si.medicine.id")
    List<Object[]> findLastSaleDatePerMedicine();
}
