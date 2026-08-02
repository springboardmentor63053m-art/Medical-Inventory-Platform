package com.medistock.medistockbackend.service.impl;

import com.medistock.medistockbackend.entity.PurchaseOrderItem;
import com.medistock.medistockbackend.repository.PurchaseOrderItemRepository;
import com.medistock.medistockbackend.service.PurchaseOrderItemService;
import com.medistock.medistockbackend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PurchaseOrderItemServiceImpl implements PurchaseOrderItemService {

    private final PurchaseOrderItemRepository repository;

    @Override
    public List<PurchaseOrderItem> findAll() { return repository.findAll(); }

    @Override
    public PurchaseOrderItem findById(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("PurchaseOrderItem not found with id: " + id));
    }

    @Override
    public PurchaseOrderItem save(PurchaseOrderItem entity) { return repository.save(entity); }

    @Override
    public void deleteById(Long id) { repository.deleteById(id); }
}
