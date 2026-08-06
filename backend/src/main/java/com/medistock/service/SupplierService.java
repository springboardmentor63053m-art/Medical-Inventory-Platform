package com.medistock.service;

import com.medistock.dto.SupplierRequest;
import com.medistock.model.Supplier;
import com.medistock.repository.SupplierRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public List<Supplier> getAll() {
        return supplierRepository.findAll();
    }

    public Supplier getById(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Supplier not found with id: " + id));
    }

    @Transactional
    public Supplier create(SupplierRequest request) {
        Supplier supplier = Supplier.builder()
                .name(request.getName())
                .contactNumber(request.getContactNumber())
                .email(request.getEmail())
                .address(request.getAddress())
                .build();
        return supplierRepository.save(supplier);
    }

    @Transactional
    public Supplier update(Long id, SupplierRequest request) {
        Supplier supplier = getById(id);
        supplier.setName(request.getName());
        supplier.setContactNumber(request.getContactNumber());
        supplier.setEmail(request.getEmail());
        supplier.setAddress(request.getAddress());
        return supplierRepository.save(supplier);
    }

    @Transactional
    public void delete(Long id) {
        Supplier supplier = getById(id);
        supplierRepository.delete(supplier);
    }
}
