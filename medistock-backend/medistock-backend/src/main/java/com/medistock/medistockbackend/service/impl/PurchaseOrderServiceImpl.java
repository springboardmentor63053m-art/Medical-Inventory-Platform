package com.medistock.medistockbackend.service.impl;

import com.medistock.medistockbackend.entity.PurchaseOrder;
import com.medistock.medistockbackend.repository.PurchaseOrderRepository;
import com.medistock.medistockbackend.service.PurchaseOrderService;
import com.medistock.medistockbackend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

    private final PurchaseOrderRepository repository;

    @Override
    public List<PurchaseOrder> findAll() { return repository.findAll(); }

    @Override
    public PurchaseOrder findById(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder not found with id: " + id));
    }

    @Override
    public PurchaseOrder save(PurchaseOrder entity) { return repository.save(entity); }

    @Override
    public void deleteById(Long id) { repository.deleteById(id); }
}
