package com.medistock.medistock_backend.repository;

import com.medistock.medistock_backend.entity.PurchaseOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseOrderItemRepository extends JpaRepository<PurchaseOrderItem, Long> {
    List<PurchaseOrderItem> findByPurchaseOrderId(Long purchaseOrderId);
    List<PurchaseOrderItem> findByMedicineId(Long medicineId);
}
