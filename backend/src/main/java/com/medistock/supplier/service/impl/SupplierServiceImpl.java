package com.medistock.supplier.service.impl;

import com.medistock.common.exception.ResourceNotFoundException;
import com.medistock.common.exception.UserAlreadyExistsException;
import com.medistock.medicine.entity.Medicine;
import com.medistock.medicine.repository.MedicineRepository;
import com.medistock.supplier.dto.request.SupplierRequest;
import com.medistock.supplier.dto.response.SupplierResponse;
import com.medistock.supplier.entity.Supplier;
import com.medistock.supplier.repository.SupplierRepository;
import com.medistock.supplier.service.SupplierService;
import com.medistock.user.entity.User;
import com.medistock.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final MedicineRepository medicineRepository;
    private final UserRepository userRepository;

    private Supplier resolveAuthenticatedSupplier() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        boolean isSupplier = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SUPPLIER") || a.getAuthority().equals("SUPPLIER"));
        if (!isSupplier) {
            return null;
        }
        String email = auth.getName();
        return supplierRepository.findByEmailIgnoreCase(email).orElse(null);
    }

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
        Supplier supplier = resolveAuthenticatedSupplier();
        if (supplier != null) {
            return Collections.singletonList(mapToResponse(supplier));
        }
        return supplierRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierResponse getSupplierById(Long id) {
        Supplier supplier = resolveAuthenticatedSupplier();
        if (supplier != null) {
            if (!supplier.getId().equals(id)) {
                throw new ResourceNotFoundException("Supplier profile not found with id: " + id);
            }
        }
        Supplier target = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        return mapToResponse(target);
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

    @Override
    @Transactional
    public SupplierResponse linkMedicineToSupplier(Long supplierId, Long medicineId) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + supplierId));
        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + medicineId));

        supplier.getMedicines().add(medicine);
        Supplier saved = supplierRepository.save(supplier);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public SupplierResponse unlinkMedicineFromSupplier(Long supplierId, Long medicineId) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + supplierId));
        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + medicineId));

        supplier.getMedicines().remove(medicine);
        Supplier saved = supplierRepository.save(supplier);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierResponse.SuppliedMedicineDto> getMedicinesBySupplier(Long supplierId) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + supplierId));

        if (supplier.getMedicines() == null) return Collections.emptyList();

        return supplier.getMedicines().stream()
                .map(m -> SupplierResponse.SuppliedMedicineDto.builder()
                        .id(m.getId())
                        .medicineCode(m.getMedicineCode())
                        .name(m.getName())
                        .genericName(m.getGenericName())
                        .manufacturer(m.getManufacturer())
                        .dosage(m.getDosage())
                        .categoryName(m.getCategory() != null ? m.getCategory().getName() : "General")
                        .unitPrice(m.getUnitPrice())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierResponse.SuppliedMedicineDto> getMySupplierMedicines(String email) {
        Supplier supplier = supplierRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier account not found for email: " + email));
        return getMedicinesBySupplier(supplier.getId());
    }

    @Override
    @Transactional
    public SupplierResponse addMedicineToSupplierByEmail(String email, Long medicineId) {
        Supplier supplier = supplierRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier account not found for email: " + email));
        return linkMedicineToSupplier(supplier.getId(), medicineId);
    }

    @Override
    @Transactional
    public SupplierResponse removeMedicineFromSupplierByEmail(String email, Long medicineId) {
        Supplier supplier = supplierRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier account not found for email: " + email));
        return unlinkMedicineFromSupplier(supplier.getId(), medicineId);
    }

    private SupplierResponse mapToResponse(Supplier supplier) {
        List<SupplierResponse.SuppliedMedicineDto> suppliedMedicines = null;
        if (supplier.getMedicines() != null && !supplier.getMedicines().isEmpty()) {
            suppliedMedicines = supplier.getMedicines().stream()
                    .map(m -> SupplierResponse.SuppliedMedicineDto.builder()
                            .id(m.getId())
                            .medicineCode(m.getMedicineCode())
                            .name(m.getName())
                            .genericName(m.getGenericName())
                            .manufacturer(m.getManufacturer())
                            .dosage(m.getDosage())
                            .categoryName(m.getCategory() != null ? m.getCategory().getName() : "General")
                            .unitPrice(m.getUnitPrice())
                            .build())
                    .collect(Collectors.toList());
        }

        String employeeId = null;
        String accountEmail = supplier.getEmail();
        Boolean accountEnabled = supplier.getActive();

        if (supplier.getEmail() != null) {
            User user = userRepository.findByEmailIgnoreCase(supplier.getEmail()).orElse(null);
            if (user != null) {
                employeeId = user.getEmployeeId();
                accountEmail = user.getEmail();
                accountEnabled = user.getEnabled();
            }
        }

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
                .active(supplier.getActive())
                .employeeId(employeeId)
                .accountEmail(accountEmail)
                .accountEnabled(accountEnabled)
                .medicines(suppliedMedicines)
                .createdAt(supplier.getCreatedAt())
                .updatedAt(supplier.getUpdatedAt())
                .build();
    }
}
