package com.medicalinventory.service;

import com.medicalinventory.entity.Supplier;
import com.medicalinventory.exception.ResourceNotFoundException;
import com.medicalinventory.repository.SupplierRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SupplierService {

    private static final Logger log = LoggerFactory.getLogger(SupplierService.class);

    private final SupplierRepository supplierRepository;

    public SupplierService(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    public List<Supplier> getAllSuppliers()             { return supplierRepository.findAll(); }
    public List<Supplier> getActiveSuppliers()          { return supplierRepository.findByIsActive(true); }

    public Supplier getSupplierById(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", id));
    }

    @Transactional
    public Supplier createSupplier(Supplier supplier) {
        supplier.setIsActive(true);
        Supplier saved = supplierRepository.save(supplier);
        log.info("Created supplier: {}", saved.getName());
        return saved;
    }

    @Transactional
    public Supplier updateSupplier(Long id, Supplier updated) {
        Supplier existing = getSupplierById(id);
        existing.setName(updated.getName());
        existing.setContactPerson(updated.getContactPerson());
        existing.setEmail(updated.getEmail());
        existing.setPhone(updated.getPhone());
        existing.setAddress(updated.getAddress());
        existing.setCity(updated.getCity());
        existing.setState(updated.getState());
        existing.setPincode(updated.getPincode());
        existing.setGstNumber(updated.getGstNumber());
        existing.setLicenseNumber(updated.getLicenseNumber());
        return supplierRepository.save(existing);
    }

    @Transactional
    public void deactivateSupplier(Long id) {
        Supplier supplier = getSupplierById(id);
        supplier.setIsActive(false);
        supplierRepository.save(supplier);
        log.info("Deactivated supplier id={}", id);
    }
}
