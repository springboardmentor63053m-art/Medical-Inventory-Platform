package com.medistock.medistock_backend.service.impl;

import com.medistock.medistock_backend.dto.CategoryDto;
import com.medistock.medistock_backend.dto.MedicineResponse;
import com.medistock.medistock_backend.dto.SupplierDto;
import com.medistock.medistock_backend.entity.Supplier;
import com.medistock.medistock_backend.entity.SupplierMedicine;
import com.medistock.medistock_backend.exception.BadRequestException;
import com.medistock.medistock_backend.exception.ResourceNotFoundException;
import com.medistock.medistock_backend.repository.SupplierRepository;
import com.medistock.medistock_backend.repository.MedicineRepository;
import com.medistock.medistock_backend.repository.SupplierMedicineRepository;
import com.medistock.medistock_backend.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final MedicineRepository medicineRepository;
    private final SupplierMedicineRepository supplierMedicineRepository;

    @Override
    @Transactional(readOnly = true)
    public List<SupplierDto> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierDto getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        return mapToDto(supplier);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicineResponse> getSupplierMedicines(Long supplierId) {
        if (!supplierRepository.existsById(supplierId)) {
            throw new ResourceNotFoundException("Supplier not found with id: " + supplierId);
        }
        List<SupplierMedicine> list = supplierMedicineRepository.findBySupplierId(supplierId);
        return list.stream()
                .map(this::mapSupplierMedicineToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SupplierDto createSupplier(SupplierDto supplierDto) {
        Supplier supplier = Supplier.builder()
                .name(supplierDto.getName())
                .contactPerson(supplierDto.getContactPerson())
                .email(supplierDto.getEmail())
                .phone(supplierDto.getPhone())
                .address(supplierDto.getAddress())
                .build();

        return mapToDto(supplierRepository.save(supplier));
    }

    @Override
    @Transactional
    public SupplierDto updateSupplier(Long id, SupplierDto supplierDto) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));

        supplier.setName(supplierDto.getName());
        supplier.setContactPerson(supplierDto.getContactPerson());
        supplier.setEmail(supplierDto.getEmail());
        supplier.setPhone(supplierDto.getPhone());
        supplier.setAddress(supplierDto.getAddress());

        return mapToDto(supplierRepository.save(supplier));
    }

    @Override
    @Transactional
    public void deleteSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        if (!medicineRepository.findBySupplierId(id).isEmpty()) {
            throw new BadRequestException("Cannot delete supplier because they have associated medicines.");
        }
        if (supplier.getPurchaseOrders() != null && !supplier.getPurchaseOrders().isEmpty()) {
            throw new BadRequestException("Cannot delete supplier because they have associated purchase orders.");
        }
        if (supplier.getSupplierMedicines() != null && !supplier.getSupplierMedicines().isEmpty()) {
            supplierMedicineRepository.deleteAll(supplier.getSupplierMedicines());
        }
        supplierRepository.delete(supplier);
    }

    private SupplierDto mapToDto(Supplier supplier) {
        return SupplierDto.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .contactPerson(supplier.getContactPerson())
                .email(supplier.getEmail())
                .phone(supplier.getPhone())
                .address(supplier.getAddress())
                .build();
    }

    private MedicineResponse mapSupplierMedicineToResponse(SupplierMedicine sm) {
        CategoryDto categoryDto = sm.getCategory() != null ?
                CategoryDto.builder()
                        .id(sm.getCategory().getId())
                        .name(sm.getCategory().getName())
                        .description(sm.getCategory().getDescription())
                        .build() : null;

        SupplierDto supplierDto = sm.getSupplier() != null ? mapToDto(sm.getSupplier()) : null;
        Integer supplierQty = sm.getAvailableQuantity() != null ? sm.getAvailableQuantity() : 0;

        return MedicineResponse.builder()
                .id(sm.getId())
                .name(sm.getName())
                .code(sm.getCode())
                .genericName(sm.getGenericName())
                .manufacturer(sm.getManufacturer())
                .price(sm.getPrice())
                .expiryDate(sm.getExpiryDate())
                .batchNumber(sm.getBatchNumber())
                .category(categoryDto)
                .supplier(supplierDto)
                .currentStock(supplierQty)
                .reorderLevel(10)
                .supplierAvailableQuantity(supplierQty)
                .build();
    }
}
