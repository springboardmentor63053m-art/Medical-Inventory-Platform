package com.medistock.medistockbackend.service;

import com.medistock.medistockbackend.entity.PurchaseOrderItem;
import java.util.List;

public interface PurchaseOrderItemService {
    List<PurchaseOrderItem> findAll();
    PurchaseOrderItem findById(Long id);
    PurchaseOrderItem save(PurchaseOrderItem entity);
    void deleteById(Long id);
}
