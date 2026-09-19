package com.medistock.repository;

import com.medistock.entity.Sale;
import com.medistock.enums.SaleType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {
    Page<Sale> findBySaleType(SaleType saleType, Pageable pageable);
    List<Sale> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    Page<Sale> findAllByOrderByCreatedAtDesc(Pageable pageable);
    boolean existsBySaleNumber(String saleNumber);
}
