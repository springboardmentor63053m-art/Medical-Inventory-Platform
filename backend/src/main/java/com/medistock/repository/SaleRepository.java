package com.medistock.repository;

import com.medistock.model.Sale;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    List<Sale> findAllByOrderBySaleDateDesc();

    List<Sale> findBySoldBy_IdOrderBySaleDateDesc(Long userId);

    List<Sale> findBySaleDateBetween(LocalDateTime start, LocalDateTime end);

    long countBySaleDateBetween(LocalDateTime start, LocalDateTime end);
}
