package com.medistock.medicine.service.impl;

import com.medistock.category.dto.response.CategoryResponse;
import com.medistock.category.entity.Category;
import com.medistock.category.repository.CategoryRepository;
import com.medistock.common.exception.ResourceNotFoundException;
import com.medistock.common.exception.UserAlreadyExistsException;
import com.medistock.medicine.dto.request.MedicineRequest;
import com.medistock.medicine.dto.response.MedicineResponse;
import com.medistock.medicine.entity.Medicine;
import com.medistock.medicine.repository.MedicineRepository;
import com.medistock.medicine.service.MedicineService;
import com.medistock.supplier.entity.Supplier;
import com.medistock.supplier.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class MedicineServiceImpl implements MedicineService {

    private final MedicineRepository medicineRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;

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
        return supplierRepository.findByEmailIgnoreCase(email)
                .orElseGet(() -> supplierRepository.findBySupplierCode("SUP-101").orElse(null));
    }

    @Override
    @Transactional
    public MedicineResponse createMedicine(MedicineRequest request) {
        if (medicineRepository.existsByMedicineCode(request.getMedicineCode())) {
            throw new UserAlreadyExistsException("Medicine code already exists: " + request.getMedicineCode());
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        BigDecimal costPrice = resolveCostPrice(request);
        BigDecimal sellingPrice = resolveSellingPrice(request);
        validatePrices(costPrice, sellingPrice);

        Medicine medicine = Medicine.builder()
                .category(category)
                .medicineCode(request.getMedicineCode())
                .name(request.getName())
                .genericName(request.getGenericName())
                .manufacturer(request.getManufacturer())
                .dosage(request.getDosage())
                .unitPrice(sellingPrice)
                .costPrice(costPrice)
                .sellingPrice(sellingPrice)
                .reorderLevel(request.getReorderLevel() != null ? request.getReorderLevel() : 10)
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .storageLocation(request.getStorageLocation())
                .build();

        Medicine saved = medicineRepository.save(medicine);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MedicineResponse> getAllMedicines(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Supplier supplier = resolveAuthenticatedSupplier();
        if (supplier != null) {
            return medicineRepository.findBySupplierId(supplier.getId(), pageable).map(this::mapToResponse);
        }
        return medicineRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public MedicineResponse getMedicineById(Long id) {
        Supplier supplier = resolveAuthenticatedSupplier();
        if (supplier != null) {
            boolean authorized = supplierRepository.existsApprovedMedicineRelationship(supplier.getId(), id);
            if (!authorized) {
                throw new ResourceNotFoundException("Medicine not associated with your supplier account (id: " + id + ")");
            }
        }
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + id));
        return mapToResponse(medicine);
    }

    @Override
    @Transactional
    public MedicineResponse updateMedicine(Long id, MedicineRequest request) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + id));

        if (!medicine.getMedicineCode().equalsIgnoreCase(request.getMedicineCode()) && medicineRepository.existsByMedicineCode(request.getMedicineCode())) {
            throw new UserAlreadyExistsException("Medicine code already exists: " + request.getMedicineCode());
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        BigDecimal costPrice = resolveCostPrice(request);
        BigDecimal sellingPrice = resolveSellingPrice(request);
        validatePrices(costPrice, sellingPrice);
        medicine.setCategory(category);
        medicine.setMedicineCode(request.getMedicineCode());
        medicine.setName(request.getName());
        medicine.setGenericName(request.getGenericName());
        medicine.setManufacturer(request.getManufacturer());
        medicine.setDosage(request.getDosage());
        medicine.setUnitPrice(sellingPrice);
        medicine.setCostPrice(costPrice);
        medicine.setSellingPrice(sellingPrice);
        medicine.setReorderLevel(request.getReorderLevel());
        medicine.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            medicine.setStatus(request.getStatus());
        }
        if (request.getStorageLocation() != null) {
            medicine.setStorageLocation(request.getStorageLocation());
        }

        Medicine updated = medicineRepository.save(medicine);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteMedicine(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + id));
        medicineRepository.delete(medicine);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicineResponse> searchMedicines(String name) {
        if (name == null || name.trim().isEmpty()) {
            return getAllMedicines(0, 250, "id", "asc").getContent();
        }
        String query = name.trim();
        Supplier supplier = resolveAuthenticatedSupplier();
        if (supplier != null) {
            return medicineRepository.searchBySupplierId(supplier.getId(), query, PageRequest.of(0, 250))
                    .getContent().stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }
        return medicineRepository.searchMasterCatalog(query, PageRequest.of(0, 250)).getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicineResponse> getMedicinesByCategory(Long categoryId) {
        Supplier supplier = resolveAuthenticatedSupplier();
        if (supplier != null) {
            return medicineRepository.findBySupplierIdAndCategoryId(supplier.getId(), categoryId).stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }
        return medicineRepository.findByCategoryId(categoryId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MedicineResponse> getMasterMedicineCatalog(int page, int size, String search, Long categoryId, Long supplierId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        if (supplierId != null) {
            if (search != null && !search.trim().isEmpty()) {
                return medicineRepository.searchBySupplierId(supplierId, search.trim(), pageable).map(this::mapToResponse);
            } else if (categoryId != null) {
                List<MedicineResponse> list = medicineRepository.findBySupplierIdAndCategoryId(supplierId, categoryId)
                        .stream().map(this::mapToResponse).collect(Collectors.toList());
                return new PageImpl<>(list, pageable, list.size());
            }
            return medicineRepository.findBySupplierId(supplierId, pageable).map(this::mapToResponse);
        } else if (search != null && !search.trim().isEmpty()) {
            return medicineRepository.searchMasterCatalog(search.trim(), pageable).map(this::mapToResponse);
        } else if (categoryId != null) {
            return medicineRepository.findByCategoryIdMaster(categoryId, pageable).map(this::mapToResponse);
        }
        return medicineRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicineResponse.LinkedSupplierDto> getSuppliersByMedicine(Long medicineId) {
        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + medicineId));

        if (medicine.getSuppliers() == null) return Collections.emptyList();

        return medicine.getSuppliers().stream()
            .filter(s -> Boolean.TRUE.equals(s.getActive()))
                .map(s -> MedicineResponse.LinkedSupplierDto.builder()
                        .id(s.getId())
                        .supplierCode(s.getSupplierCode())
                        .supplierName(s.getSupplierName())
                        .contactPerson(s.getContactPerson())
                        .phone(s.getPhone())
                        .email(s.getEmail())
                        .city(s.getCity())
                        .country(s.getCountry())
                        .build())
                .collect(Collectors.toList());
    }

    private MedicineResponse mapToResponse(Medicine medicine) {
        CategoryResponse categoryResp = null;
        if (medicine.getCategory() != null) {
            categoryResp = CategoryResponse.builder()
                    .id(medicine.getCategory().getId())
                    .name(medicine.getCategory().getName())
                    .description(medicine.getCategory().getDescription())
                    .createdAt(medicine.getCategory().getCreatedAt())
                    .updatedAt(medicine.getCategory().getUpdatedAt())
                    .build();
        }

        List<MedicineResponse.LinkedSupplierDto> linkedSuppliers = null;
        try {
            List<Supplier> sups = supplierRepository.findSuppliersByMedicineId(medicine.getId());
            if (sups != null && !sups.isEmpty()) {
                linkedSuppliers = sups.stream()
                        .filter(s -> Boolean.TRUE.equals(s.getActive()))
                        .map(s -> MedicineResponse.LinkedSupplierDto.builder()
                                .id(s.getId())
                                .supplierCode(s.getSupplierCode())
                                .supplierName(s.getSupplierName())
                                .contactPerson(s.getContactPerson())
                                .phone(s.getPhone())
                                .email(s.getEmail())
                                .city(s.getCity())
                                .country(s.getCountry())
                                .build())
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            // Log warning fallback if query fails
        }

        boolean isAdmin = hasRole("ADMIN");
        boolean isPharmacist = hasRole("PHARMACIST");
        boolean isSupplier = hasRole("SUPPLIER");

        boolean canViewCostPrice = isAdmin || isPharmacist || isSupplier;
        boolean canViewSellingPrice = !isSupplier || isAdmin || isPharmacist;

        BigDecimal costPrice = medicine.getCostPrice() != null
                ? medicine.getCostPrice()
                : medicine.getUnitPrice();

        BigDecimal sellingPrice = medicine.getSellingPrice() != null
                ? medicine.getSellingPrice()
                : medicine.getUnitPrice();

        BigDecimal profitPerUnit = isAdmin
                ? sellingPrice.subtract(costPrice)
                : null;

        BigDecimal legacyDisplayPrice =
                isSupplier && !isAdmin && !isPharmacist
                        ? costPrice
                        : sellingPrice;

        return MedicineResponse.builder()
                .id(medicine.getId())
                .category(categoryResp)
                .medicineCode(medicine.getMedicineCode())
                .name(medicine.getName())
                .genericName(medicine.getGenericName())
                .manufacturer(medicine.getManufacturer())
                .dosage(medicine.getDosage())
                .unitPrice(legacyDisplayPrice)
                .costPrice(canViewCostPrice ? costPrice : null)
                .sellingPrice(canViewSellingPrice ? sellingPrice : null)
                .profitPerUnit(profitPerUnit)
                .reorderLevel(medicine.getReorderLevel())
                .description(medicine.getDescription())
                .status(medicine.getStatus())
                .storageLocation(medicine.getStorageLocation())
                .prescriptionRequired(medicine.getPrescriptionRequired() != null ? medicine.getPrescriptionRequired() : true)
                .suppliers(linkedSuppliers)
                .createdAt(medicine.getCreatedAt())
                .updatedAt(medicine.getUpdatedAt())
                .build();
    }

    private boolean hasRole(String role) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }

        return auth.getAuthorities().stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_" + role)
                                || authority.getAuthority().equals(role));
    }

    private BigDecimal resolveCostPrice(MedicineRequest request) {
        return request.getCostPrice() != null
                ? request.getCostPrice()
                : request.getUnitPrice();
    }

    private BigDecimal resolveSellingPrice(MedicineRequest request) {
        return request.getSellingPrice() != null
                ? request.getSellingPrice()
                : request.getUnitPrice();
    }

    private void validatePrices(BigDecimal costPrice, BigDecimal sellingPrice) {
        if (costPrice == null) {
            throw new IllegalArgumentException("Cost price is required");
        }
        if (sellingPrice == null) {
            throw new IllegalArgumentException("Selling price is required");
        }
        if (costPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Cost price must be zero or positive");
        }
        if (sellingPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Selling price must be positive");
        }
        if (sellingPrice.compareTo(costPrice) < 0) {
            throw new IllegalArgumentException(
                    "Selling price cannot be lower than cost price"
            );
        }
    }
}
