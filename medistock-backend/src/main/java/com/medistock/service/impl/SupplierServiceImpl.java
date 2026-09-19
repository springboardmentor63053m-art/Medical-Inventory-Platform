package com.medistock.service.impl;

import com.medistock.dto.PageResponse;
import com.medistock.dto.SupplierDTO;
import com.medistock.entity.Supplier;
import com.medistock.exception.BadRequestException;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.SupplierRepository;
import com.medistock.service.SupplierService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.medistock.repository.MedicineRepository;

import java.util.List;

@Service
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final MedicineRepository medicineRepository;

    public SupplierServiceImpl(SupplierRepository supplierRepository, MedicineRepository medicineRepository) {
        this.supplierRepository = supplierRepository;
        this.medicineRepository = medicineRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SupplierDTO> getAllSuppliers(String search, String status, Pageable pageable) {
        Page<Supplier> page;
        if (StringUtils.hasText(search)) {
            page = supplierRepository.searchSuppliers(search, pageable);
        } else if (StringUtils.hasText(status)) {
            page = supplierRepository.findByStatus(status, pageable);
        } else {
            page = supplierRepository.findAll(pageable);
        }

        List<SupplierDTO> dtos = page.getContent().stream()
                .map(this::mapToDTO)
                .toList();

        return PageResponse.<SupplierDTO>builder()
                .content(dtos)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierDTO> getActiveSuppliers() {
        return supplierRepository.findByStatus("ACTIVE").stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierDTO getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));
        return mapToDTO(supplier);
    }

    @Override
    @Transactional
    public SupplierDTO createSupplier(SupplierDTO dto) {
        if (StringUtils.hasText(dto.getEmail()) && supplierRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Supplier with email '" + dto.getEmail() + "' already exists");
        }
        if (StringUtils.hasText(dto.getPhone()) && supplierRepository.existsByPhone(dto.getPhone())) {
            throw new BadRequestException("Supplier with phone '" + dto.getPhone() + "' already exists");
        }

        Supplier supplier = Supplier.builder()
                .supplierName(dto.getSupplierName())
                .contactPerson(dto.getContactPerson())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .address(dto.getAddress())
                .city(dto.getCity())
                .state(dto.getState())
                .country(dto.getCountry())
                .status(StringUtils.hasText(dto.getStatus()) ? dto.getStatus() : "ACTIVE")
                .build();

        Supplier savedSupplier = supplierRepository.save(supplier);
        return mapToDTO(savedSupplier);
    }

    @Override
    @Transactional
    public SupplierDTO updateSupplier(Long id, SupplierDTO dto) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));

        if (StringUtils.hasText(dto.getEmail()) &&
                supplierRepository.existsByEmailAndIdNot(dto.getEmail(), id)) {
            throw new BadRequestException("Supplier with email '" + dto.getEmail() + "' already exists");
        }

        if (StringUtils.hasText(dto.getPhone()) &&
                supplierRepository.existsByPhoneAndIdNot(dto.getPhone(), id)) {
            throw new BadRequestException("Supplier with phone '" + dto.getPhone() + "' already exists");
        }

        supplier.setSupplierName(dto.getSupplierName());
        supplier.setContactPerson(dto.getContactPerson());
        supplier.setEmail(dto.getEmail());
        supplier.setPhone(dto.getPhone());
        supplier.setAddress(dto.getAddress());
        supplier.setCity(dto.getCity());
        supplier.setState(dto.getState());
        supplier.setCountry(dto.getCountry());
        if (StringUtils.hasText(dto.getStatus())) {
            supplier.setStatus(dto.getStatus());
        }

        Supplier updatedSupplier = supplierRepository.save(supplier);
        return mapToDTO(updatedSupplier);
    }

    @Override
    @Transactional
    public void deleteSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));

        if (medicineRepository.existsBySupplierId(id)) {
            throw new BadRequestException("Cannot delete supplier '" + supplier.getSupplierName() + "' because it has associated medicines in inventory.");
        }

        supplierRepository.delete(supplier);
    }

    private SupplierDTO mapToDTO(Supplier supplier) {
        return SupplierDTO.builder()
                .id(supplier.getId())
                .supplierName(supplier.getSupplierName())
                .contactPerson(supplier.getContactPerson())
                .email(supplier.getEmail())
                .phone(supplier.getPhone())
                .address(supplier.getAddress())
                .city(supplier.getCity())
                .state(supplier.getState())
                .country(supplier.getCountry())
                .status(supplier.getStatus())
                .createdAt(supplier.getCreatedAt())
                .build();
    }
}
