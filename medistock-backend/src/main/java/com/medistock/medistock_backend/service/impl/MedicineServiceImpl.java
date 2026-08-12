package com.medistock.medistock_backend.service.impl;

import com.medistock.medistock_backend.dto.CategoryDto;
import com.medistock.medistock_backend.dto.MedicineFilterRequest;
import com.medistock.medistock_backend.dto.MedicineRequest;
import com.medistock.medistock_backend.dto.MedicineResponse;
import com.medistock.medistock_backend.dto.SupplierDto;
import com.medistock.medistock_backend.entity.Category;
import com.medistock.medistock_backend.entity.Inventory;
import com.medistock.medistock_backend.entity.Medicine;
import com.medistock.medistock_backend.entity.Supplier;
import com.medistock.medistock_backend.entity.StockStatus;
import com.medistock.medistock_backend.exception.BadRequestException;
import com.medistock.medistock_backend.exception.ResourceNotFoundException;
import com.medistock.medistock_backend.repository.CategoryRepository;
import com.medistock.medistock_backend.repository.InventoryRepository;
import com.medistock.medistock_backend.repository.MedicineRepository;
import com.medistock.medistock_backend.service.StockMovementService;
import com.medistock.medistock_backend.entity.MovementType;
import com.medistock.medistock_backend.repository.SupplierRepository;
import com.medistock.medistock_backend.service.MedicineService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicineServiceImpl implements MedicineService {

    private final MedicineRepository medicineRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final InventoryRepository inventoryRepository;
    private final StockMovementService stockMovementService;

    @Value("${inventory.near-expiry-days:30}")
    private int nearExpiryDays;

    @Override
    @Transactional(readOnly = true)
    public Page<MedicineResponse> getAllMedicines(MedicineFilterRequest filter) {
        int pageNum = filter.getPage() != null ? filter.getPage() : 0;
        int pageSize = filter.getSize() != null ? filter.getSize() : 10;

        Sort sort = Sort.unsorted();
        if (filter.getSortBy() != null) {
            String sortByProperty = "name"; // Default sort property
            switch (filter.getSortBy()) {
                case NAME:
                    sortByProperty = "name";
                    break;
                case QUANTITY:
                    sortByProperty = "inventory.quantity";
                    break;
                case EXPIRY_DATE:
                    sortByProperty = "expiryDate";
                    break;
                case CATEGORY:
                    sortByProperty = "category.name";
                    break;
                case SUPPLIER:
                    sortByProperty = "supplier.name";
                    break;
            }

            Sort.Direction direction = Sort.Direction.ASC;
            if (filter.getSortDirection() != null && filter.getSortDirection() == com.medistock.medistock_backend.entity.SortDirection.DESC) {
                direction = Sort.Direction.DESC;
            }
            sort = Sort.by(direction, sortByProperty);
        }

        Pageable pageable = PageRequest.of(pageNum, pageSize, sort);
        LocalDate today = LocalDate.now();
        LocalDate nearExpiryDate = today.plusDays(nearExpiryDays);
        String statusStr = filter.getStockStatus() != null ? filter.getStockStatus().name() : "ALL";

        Page<Medicine> page = medicineRepository.filterMedicines(
            filter.getSearch(),
            filter.getCategoryId(),
            filter.getSupplierId(),
            statusStr,
            today,
            nearExpiryDate,
            pageable
        );

        return page.map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicineResponse> getAllMedicinesList(MedicineFilterRequest filter) {
        LocalDate today = LocalDate.now();
        LocalDate nearExpiryDate = today.plusDays(nearExpiryDays);
        String statusStr = filter.getStockStatus() != null ? filter.getStockStatus().name() : "ALL";

        List<Medicine> list = medicineRepository.filterMedicinesList(
            filter.getSearch(),
            filter.getCategoryId(),
            filter.getSupplierId(),
            statusStr,
            today,
            nearExpiryDate
        );

        return list.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MedicineResponse getMedicineById(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + id));
        return mapToResponse(medicine);
    }

    @Override
    @Transactional(readOnly = true)
    public MedicineResponse getMedicineByCode(String code) {
        Medicine medicine = medicineRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with code: " + code));
        return mapToResponse(medicine);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicineResponse> searchMedicines(String query) {
        return medicineRepository.searchMedicines(query).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicineResponse> getMedicinesByCategory(Long categoryId) {
        return medicineRepository.findByCategoryId(categoryId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MedicineResponse createMedicine(MedicineRequest request) {
        if (medicineRepository.findByCode(request.getCode()).isPresent()) {
            throw new BadRequestException("Medicine code already exists: " + request.getCode());
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
        }

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + request.getSupplierId()));
        }

        Medicine medicine = Medicine.builder()
                .name(request.getName())
                .code(request.getCode())
                .genericName(request.getGenericName())
                .manufacturer(request.getManufacturer())
                .price(request.getPrice())
                .expiryDate(request.getExpiryDate())
                .batchNumber(request.getBatchNumber())
                .category(category)
                .supplier(supplier)
                .build();

        Medicine savedMedicine = medicineRepository.save(medicine);

        Inventory inventory = Inventory.builder()
                .medicine(savedMedicine)
                .quantity(request.getInitialQuantity() != null ? request.getInitialQuantity() : 0)
                .reorderLevel(request.getReorderLevel() != null ? request.getReorderLevel() : 10)
                .maxQuantity(request.getMaxQuantity() != null ? request.getMaxQuantity() : 100)
                .locationRack(request.getLocationRack())
                .build();

        inventoryRepository.save(inventory);
        savedMedicine.setInventory(inventory);

        if (request.getInitialQuantity() != null && request.getInitialQuantity() > 0) {
            stockMovementService.logMovement(savedMedicine.getId(), request.getBatchNumber(), MovementType.IN, request.getInitialQuantity(), null);
        }

        return mapToResponse(savedMedicine);
    }

    @Override
    @Transactional
    public MedicineResponse updateMedicine(Long id, MedicineRequest request) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + id));

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
            medicine.setCategory(category);
        }

        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + request.getSupplierId()));
            medicine.setSupplier(supplier);
        }

        medicine.setName(request.getName());
        medicine.setGenericName(request.getGenericName());
        medicine.setManufacturer(request.getManufacturer());
        medicine.setPrice(request.getPrice());
        medicine.setExpiryDate(request.getExpiryDate());
        medicine.setBatchNumber(request.getBatchNumber());

        return mapToResponse(medicineRepository.save(medicine));
    }

    @Override
    @Transactional
    public void deleteMedicine(Long id) {
        if (!medicineRepository.existsById(id)) {
            throw new ResourceNotFoundException("Medicine not found with id: " + id);
        }
        medicineRepository.deleteById(id);
    }

    private List<StockStatus> calculateStockStatus(Medicine medicine) {
        List<StockStatus> statuses = new ArrayList<>();
        Integer quantity = medicine.getInventory() != null ? medicine.getInventory().getQuantity() : 0;
        Integer reorderLevel = medicine.getInventory() != null ? medicine.getInventory().getReorderLevel() : 0;
        LocalDate expiryDate = medicine.getExpiryDate();
        LocalDate today = LocalDate.now();
        LocalDate nearExpiryLimit = today.plusDays(nearExpiryDays);

        if (expiryDate != null) {
            if (expiryDate.isBefore(today)) {
                statuses.add(StockStatus.EXPIRED);
            } else if (!expiryDate.isAfter(nearExpiryLimit)) {
                statuses.add(StockStatus.NEAR_EXPIRY);
            }
        }
        if (quantity == 0) {
            statuses.add(StockStatus.OUT_OF_STOCK);
        }
        if (quantity <= reorderLevel) {
            statuses.add(StockStatus.LOW_STOCK);
        } else {
            statuses.add(StockStatus.AVAILABLE);
        }

        if (statuses.isEmpty()) {
            statuses.add(StockStatus.AVAILABLE);
        }
        return statuses;
    }

    private MedicineResponse mapToResponse(Medicine medicine) {
        CategoryDto categoryDto = medicine.getCategory() != null ?
                CategoryDto.builder()
                        .id(medicine.getCategory().getId())
                        .name(medicine.getCategory().getName())
                        .description(medicine.getCategory().getDescription())
                        .build() : null;

        SupplierDto supplierDto = medicine.getSupplier() != null ?
                SupplierDto.builder()
                        .id(medicine.getSupplier().getId())
                        .name(medicine.getSupplier().getName())
                        .contactPerson(medicine.getSupplier().getContactPerson())
                        .email(medicine.getSupplier().getEmail())
                        .phone(medicine.getSupplier().getPhone())
                        .address(medicine.getSupplier().getAddress())
                        .build() : null;

        Integer stock = medicine.getInventory() != null ? medicine.getInventory().getQuantity() : 0;
        Integer reorder = medicine.getInventory() != null ? medicine.getInventory().getReorderLevel() : 0;

        return MedicineResponse.builder()
                .id(medicine.getId())
                .name(medicine.getName())
                .code(medicine.getCode())
                .genericName(medicine.getGenericName())
                .manufacturer(medicine.getManufacturer())
                .price(medicine.getPrice())
                .expiryDate(medicine.getExpiryDate())
                .batchNumber(medicine.getBatchNumber())
                .category(categoryDto)
                .supplier(supplierDto)
                .currentStock(stock)
                .reorderLevel(reorder)
                .supplierAvailableQuantity(medicine.getSupplierAvailableQuantity() != null ? medicine.getSupplierAvailableQuantity() : 0)
                .stockStatus(calculateStockStatus(medicine))
                .build();
    }
}
