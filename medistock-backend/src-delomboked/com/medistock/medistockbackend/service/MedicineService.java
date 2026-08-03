package com.medistock.medistockbackend.service;

import com.medistock.medistockbackend.entity.Medicine;
import java.util.List;

public interface MedicineService {
    List<Medicine> findAll();
    Medicine findById(Long id);
    Medicine save(Medicine entity);
    void deleteById(Long id);
    List<Medicine> searchByName(String name);
}
