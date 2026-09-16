package com.medistock.category.service.impl;

import com.medistock.category.dto.request.CategoryRequest;
import com.medistock.category.dto.response.CategoryDetailsResponse;
import com.medistock.category.dto.response.CategoryResponse;
import com.medistock.category.entity.Category;
import com.medistock.category.repository.CategoryRepository;
import com.medistock.category.service.CategoryService;
import com.medistock.common.exception.ResourceNotFoundException;
import com.medistock.common.exception.UserAlreadyExistsException;
import com.medistock.inventory.entity.Inventory;
import com.medistock.inventory.repository.InventoryRepository;
import com.medistock.medicine.entity.Medicine;
import com.medistock.medicine.repository.MedicineRepository;
import com.medistock.supplier.entity.Supplier;
import com.medistock.supplier.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final MedicineRepository medicineRepository;
    private final InventoryRepository inventoryRepository;
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
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new UserAlreadyExistsException("Category already exists with name: " + request.getName());
        }
        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
        Category saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        Supplier supplier = resolveAuthenticatedSupplier();
        if (supplier != null) {
            return categoryRepository.findCategoriesBySupplierId(supplier.getId()).stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }
        return categoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return mapToResponse(category);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryDetailsResponse getCategoryDetails(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        Supplier supplier = resolveAuthenticatedSupplier();
        List<Medicine> medicines;
        if (supplier != null) {
            medicines = medicineRepository.findBySupplierIdAndCategoryId(supplier.getId(), id);
        } else {
            medicines = medicineRepository.findByCategoryId(id);
        }

        List<Inventory> allInventory = inventoryRepository.findAll();
        Map<Long, List<Inventory>> inventoryByMedId = allInventory.stream()
                .filter(inv -> inv.getMedicine() != null && inv.getMedicine().getId() != null)
                .collect(Collectors.groupingBy(inv -> inv.getMedicine().getId()));

        List<CategoryDetailsResponse.CategoryMedicineDto> medicineDtos = new ArrayList<>();
        List<CategoryDetailsResponse.CategoryMedicineDto> lowStockDtos = new ArrayList<>();
        List<CategoryDetailsResponse.CategoryMedicineDto> outOfStockDtos = new ArrayList<>();
        List<CategoryDetailsResponse.ExpiringBatchDto> expiringBatches = new ArrayList<>();

        int inStockCount = 0;
        int lowStockCount = 0;
        int outOfStockCount = 0;
        int activeCount = 0;
        int inactiveCount = 0;

        LocalDate expiryThreshold = LocalDate.now().plusDays(90);

        for (Medicine med : medicines) {
            List<Inventory> medInvs = inventoryByMedId.getOrDefault(med.getId(), Collections.emptyList());
            long totalStock = medInvs.stream().mapToLong(Inventory::getQuantity).sum();
            int minStock = med.getReorderLevel() != null ? med.getReorderLevel() : 10;

            String status = med.getStatus() != null ? med.getStatus() : "ACTIVE";
            if ("ACTIVE".equalsIgnoreCase(status)) {
                activeCount++;
            } else {
                inactiveCount++;
            }

            String stockStatus;
            long shortage = 0;

            if (totalStock == 0) {
                stockStatus = "OUT_OF_STOCK";
                outOfStockCount++;
                shortage = minStock;
            } else if (totalStock <= minStock) {
                stockStatus = "LOW_STOCK";
                lowStockCount++;
                shortage = minStock - totalStock;
            } else {
                stockStatus = "IN_STOCK";
                inStockCount++;
            }

            CategoryDetailsResponse.CategoryMedicineDto dto = CategoryDetailsResponse.CategoryMedicineDto.builder()
                    .id(med.getId())
                    .medicineCode(med.getMedicineCode())
                    .name(med.getName())
                    .genericName(med.getGenericName())
                    .manufacturer(med.getManufacturer())
                    .dosage(med.getDosage())
                    .unitPrice(
                            supplier != null
                                    ? (med.getCostPrice() != null
                                            ? med.getCostPrice()
                                            : med.getUnitPrice())
                                    : (med.getSellingPrice() != null
                                            ? med.getSellingPrice()
                                            : med.getUnitPrice())
                    )
                    .reorderLevel(minStock)
                    .status(status)
                    .prescriptionRequired(med.getPrescriptionRequired() != null ? med.getPrescriptionRequired() : true)
                    .currentStock(totalStock)
                    .stockStatus(stockStatus)
                    .shortage(shortage)
                    .build();

            medicineDtos.add(dto);

            if ("LOW_STOCK".equals(stockStatus)) {
                lowStockDtos.add(dto);
            } else if ("OUT_OF_STOCK".equals(stockStatus)) {
                outOfStockDtos.add(dto);
            }

            for (Inventory inv : medInvs) {
                if (inv.getExpiryDate() != null && !inv.getExpiryDate().isBefore(LocalDate.now()) && !inv.getExpiryDate().isAfter(expiryThreshold)) {
                    expiringBatches.add(CategoryDetailsResponse.ExpiringBatchDto.builder()
                            .inventoryId(inv.getId())
                            .medicineId(med.getId())
                            .medicineName(med.getName())
                            .medicineCode(med.getMedicineCode())
                            .batchNumber(inv.getBatchNumber())
                            .quantity(inv.getQuantity())
                            .expiryDate(inv.getExpiryDate())
                            .storageLocation(inv.getStorageLocation())
                            .build());
                }
            }
        }

        return CategoryDetailsResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .totalMedicines(medicines.size())
                .inStockCount(inStockCount)
                .lowStockCount(lowStockCount)
                .outOfStockCount(outOfStockCount)
                .activeCount(activeCount)
                .inactiveCount(inactiveCount)
                .medicines(medicineDtos)
                .lowStockMedicines(lowStockDtos)
                .outOfStockMedicines(outOfStockDtos)
                .expiringBatches(expiringBatches)
                .build();
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (!category.getName().equalsIgnoreCase(request.getName()) && categoryRepository.existsByName(request.getName())) {
            throw new UserAlreadyExistsException("Category already exists with name: " + request.getName());
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        Category updated = categoryRepository.save(category);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        long count = medicineRepository.countByCategoryId(id);
        if (count > 0) {
            throw new IllegalArgumentException("Cannot delete category '" + category.getName() + "' because it is associated with " + count + " medicine(s). Please reassign or delete the medicines first.");
        }

        categoryRepository.deleteById(id);
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}
