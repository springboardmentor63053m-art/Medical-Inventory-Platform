package com.medistock.medistockbackend.service.impl;

import com.medistock.medistockbackend.entity.Medicine;
import com.medistock.medistockbackend.repository.MedicineRepository;
import com.medistock.medistockbackend.service.MedicineService;
import com.medistock.medistockbackend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicineServiceImpl implements MedicineService {

    private final MedicineRepository repository;

    @Override
    public List<Medicine> findAll() { return repository.findAll(); }

    @Override
    public Medicine findById(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + id));
    }

    @Override
    public Medicine save(Medicine entity) { return repository.save(entity); }

    @Override
    public void deleteById(Long id) { repository.deleteById(id); }

    @Override
    public List<Medicine> searchByName(String name) {
        return repository.findByNameContainingIgnoreCase(name);
    }
}
