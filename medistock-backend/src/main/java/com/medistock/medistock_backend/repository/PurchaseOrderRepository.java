package com.medistock.medistock_backend.repository;

import com.medistock.medistock_backend.entity.OrderStatus;
import com.medistock.medistock_backend.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    Optional<PurchaseOrder> findByOrderNumber(String orderNumber);
    List<PurchaseOrder> findBySupplierId(Long supplierId);
    List<PurchaseOrder> findByStatus(OrderStatus status);
    List<PurchaseOrder> findByCreatedById(Long userId);
}
