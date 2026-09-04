package com.medistock.medistockbackend.service;

import com.medistock.medistockbackend.entity.Supplier;
import java.util.List;

public interface SupplierService {
    List<Supplier> findAll();
    Supplier findById(Long id);
    Supplier save(Supplier entity);
    void deleteById(Long id);
}
