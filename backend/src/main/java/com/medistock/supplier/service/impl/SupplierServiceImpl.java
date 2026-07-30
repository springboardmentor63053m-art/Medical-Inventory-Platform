package com.medistock.supplier.service.impl;

import com.medistock.common.exception.ResourceNotFoundException;
import com.medistock.common.exception.UserAlreadyExistsException;
import com.medistock.supplier.dto.request.SupplierRequest;
import com.medistock.supplier.dto.response.SupplierResponse;
import com.medistock.supplier.entity.Supplier;
import com.medistock.supplier.repository.SupplierRepository;
import com.medistock.supplier.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;

    @Override
    @Transactional
    public SupplierResponse createSupplier(SupplierRequest request) {
        if (supplierRepository.existsBySupplierCode(request.getSupplierCode())) {
            throw new UserAlreadyExistsException("Supplier code already exists: " + request.getSupplierCode());
        }

        Supplier supplier = Supplier.builder()
                .supplierCode(request.getSupplierCode())
                .supplierName(request.getSupplierName())
                .contactPerson(request.getContactPerson())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .country(request.getCountry())
                .build();

        Supplier saved = supplierRepository.save(supplier);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierResponse> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierResponse getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        return mapToResponse(supplier);
    }

    @Override
    @Transactional
    public SupplierResponse updateSupplier(Long id, SupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));

        if (!supplier.getSupplierCode().equalsIgnoreCase(request.getSupplierCode()) && supplierRepository.existsBySupplierCode(request.getSupplierCode())) {
            throw new UserAlreadyExistsException("Supplier code already exists: " + request.getSupplierCode());
        }

        supplier.setSupplierCode(request.getSupplierCode());
        supplier.setSupplierName(request.getSupplierName());
        supplier.setContactPerson(request.getContactPerson());
        supplier.setPhone(request.getPhone());
        supplier.setEmail(request.getEmail());
        supplier.setAddress(request.getAddress());
        supplier.setCity(request.getCity());
        supplier.setState(request.getState());
        supplier.setCountry(request.getCountry());

        Supplier updated = supplierRepository.save(supplier);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteSupplier(Long id) {
        if (!supplierRepository.existsById(id)) {
            throw new ResourceNotFoundException("Supplier not found with id: " + id);
        }
        supplierRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierResponse> searchSuppliers(String name) {
        return supplierRepository.findBySupplierNameContainingIgnoreCase(name).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private SupplierResponse mapToResponse(Supplier supplier) {
        return SupplierResponse.builder()
                .id(supplier.getId())
                .supplierCode(supplier.getSupplierCode())
                .supplierName(supplier.getSupplierName())
                .contactPerson(supplier.getContactPerson())
                .phone(supplier.getPhone())
                .email(supplier.getEmail())
                .address(supplier.getAddress())
                .city(supplier.getCity())
                .state(supplier.getState())
                .country(supplier.getCountry())
                .createdAt(supplier.getCreatedAt())
                .updatedAt(supplier.getUpdatedAt())
                .build();
    }
}
