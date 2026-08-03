package com.medistock.medistockbackend.service;

import com.medistock.medistockbackend.entity.PurchaseOrder;
import java.util.List;

public interface PurchaseOrderService {
    List<PurchaseOrder> findAll();
    PurchaseOrder findById(Long id);
    PurchaseOrder save(PurchaseOrder entity);
    void deleteById(Long id);
}
