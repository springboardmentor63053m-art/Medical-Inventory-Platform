package com.medistock.medistock_backend.service.impl;

import java.util.Optional;
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
import com.medistock.medistock_backend.entity.ERole;
import com.medistock.medistock_backend.entity.User;
import com.medistock.medistock_backend.entity.SupplierMedicine;
import com.medistock.medistock_backend.repository.CategoryRepository;
import com.medistock.medistock_backend.repository.InventoryRepository;
import com.medistock.medistock_backend.repository.MedicineRepository;
import com.medistock.medistock_backend.repository.SupplierMedicineRepository;
import com.medistock.medistock_backend.repository.UserRepository;
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
    private final UserRepository userRepository;
    private final SupplierMedicineRepository supplierMedicineRepository;

    @Value("${inventory.near-expiry-days:30}")
    private int nearExpiryDays;

    @Override
    @Transactional(readOnly = true)
    public Page<MedicineResponse> getAllMedicines(MedicineFilterRequest filter) {
        Long currentSupplierId = getCurrentSupplierId();
        Long supplierId = currentSupplierId != null ? currentSupplierId : filter.getSupplierId();

        int pageNum = filter.getPage() != null ? filter.getPage() : 0;
        int pageSize = filter.getSize() != null ? filter.getSize() : 10;

        Sort sort = Sort.unsorted();
        if (filter.getSortBy() != null) {
            String sortByProperty = "name";
            switch (filter.getSortBy()) {
                case NAME:
                    sortByProperty = "name";
                    break;
                case QUANTITY:
                    sortByProperty = "availableQuantity";
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

        Page<SupplierMedicine> page = supplierMedicineRepository.filterSupplierMedicines(
            supplierId,
            filter.getSearch(),
            filter.getCategoryId(),
            statusStr,
            today,
            nearExpiryDate,
            pageable
        );

        return page.map(this::mapSupplierMedicineToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicineResponse> getAllMedicinesList(MedicineFilterRequest filter) {
        Long currentSupplierId = getCurrentSupplierId();
        Long supplierId = currentSupplierId != null ? currentSupplierId : filter.getSupplierId();
        LocalDate today = LocalDate.now();
        LocalDate nearExpiryDate = today.plusDays(nearExpiryDays);
        String statusStr = filter.getStockStatus() != null ? filter.getStockStatus().name() : "ALL";

        List<SupplierMedicine> list = supplierMedicineRepository.filterSupplierMedicinesList(
            supplierId,
            filter.getSearch(),
            filter.getCategoryId(),
            statusStr,
            today,
            nearExpiryDate
        );

        return list.stream()
                .map(this::mapSupplierMedicineToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MedicineResponse getMedicineById(Long id) {
        Long currentSupplierId = getCurrentSupplierId();
        if (currentSupplierId != null) {
            SupplierMedicine sm = supplierMedicineRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier medicine not found with id: " + id));
            return mapSupplierMedicineToResponse(sm);
        }
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + id));
        return mapToResponse(medicine);
    }

    @Override
    @Transactional(readOnly = true)
    public MedicineResponse getMedicineByCode(String code) {
        Long currentSupplierId = getCurrentSupplierId();
        if (currentSupplierId != null) {
            SupplierMedicine sm = supplierMedicineRepository.findBySupplierIdAndCode(currentSupplierId, code)
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier medicine not found with code: " + code));
            return mapSupplierMedicineToResponse(sm);
        }
        Medicine medicine = medicineRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with code: " + code));
        return mapToResponse(medicine);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicineResponse> searchMedicines(String query) {
        Long currentSupplierId = getCurrentSupplierId();
        if (currentSupplierId != null) {
            List<SupplierMedicine> list = supplierMedicineRepository.findBySupplierId(currentSupplierId);
            return list.stream()
                    .filter(sm -> sm.getName().toLowerCase().contains(query.toLowerCase())
                            || sm.getCode().toLowerCase().contains(query.toLowerCase())
                            || (sm.getGenericName() != null && sm.getGenericName().toLowerCase().contains(query.toLowerCase())))
                    .map(this::mapSupplierMedicineToResponse)
                    .collect(Collectors.toList());
        }
        return medicineRepository.searchMedicines(query).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicineResponse> getMedicinesByCategory(Long categoryId) {
        Long currentSupplierId = getCurrentSupplierId();
        if (currentSupplierId != null) {
            List<SupplierMedicine> list = supplierMedicineRepository.findBySupplierId(currentSupplierId);
            return list.stream()
                    .filter(sm -> sm.getCategory() != null && sm.getCategory().getId().equals(categoryId))
                    .map(this::mapSupplierMedicineToResponse)
                    .collect(Collectors.toList());
        }
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
                if (quantity != null && quantity > 0) {
                    statuses.add(StockStatus.NEAR_EXPIRY);
                }
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

        Integer supplierQty = 0;
        if (medicine.getSupplier() != null && medicine.getCode() != null) {
            supplierQty = supplierMedicineRepository
                    .findBySupplierIdAndCode(medicine.getSupplier().getId(), medicine.getCode())
                    .map(sm -> sm.getAvailableQuantity() != null ? sm.getAvailableQuantity() : 0)
                    .orElse(0);
        }

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
                .supplierAvailableQuantity(supplierQty)
                .stockStatus(calculateStockStatus(medicine))
                .build();
    }

    private List<StockStatus> calculateSupplierStockStatus(SupplierMedicine sm, Integer quantity) {
        List<StockStatus> statuses = new ArrayList<>();
        Integer reorderLevel = 10;
        LocalDate expiryDate = sm.getExpiryDate();
        LocalDate today = LocalDate.now();
        LocalDate nearExpiryLimit = today.plusDays(nearExpiryDays);

        if (expiryDate != null) {
            if (expiryDate.isBefore(today)) {
                statuses.add(StockStatus.EXPIRED);
            } else if (!expiryDate.isAfter(nearExpiryLimit)) {
                if (quantity != null && quantity > 0) {
                    statuses.add(StockStatus.NEAR_EXPIRY);
                }
            }
        }
        if (quantity == null || quantity == 0) {
            statuses.add(StockStatus.OUT_OF_STOCK);
        }
        if (quantity != null && quantity <= reorderLevel) {
            statuses.add(StockStatus.LOW_STOCK);
        } else {
            statuses.add(StockStatus.AVAILABLE);
        }

        if (statuses.isEmpty()) {
            statuses.add(StockStatus.AVAILABLE);
        }
        return statuses;
    }

    private MedicineResponse mapSupplierMedicineToResponse(SupplierMedicine sm) {
        CategoryDto categoryDto = sm.getCategory() != null ?
                CategoryDto.builder()
                        .id(sm.getCategory().getId())
                        .name(sm.getCategory().getName())
                        .description(sm.getCategory().getDescription())
                        .build() : null;

        SupplierDto supplierDto = sm.getSupplier() != null ?
                SupplierDto.builder()
                        .id(sm.getSupplier().getId())
                        .name(sm.getSupplier().getName())
                        .contactPerson(sm.getSupplier().getContactPerson())
                        .email(sm.getSupplier().getEmail())
                        .phone(sm.getSupplier().getPhone())
                        .address(sm.getSupplier().getAddress())
                        .build() : null;

        Integer supplierQty = sm.getAvailableQuantity() != null ? sm.getAvailableQuantity() : 0;

        Integer adminStock = 0;
        Integer reorderLevel = 10;
        if (sm.getCode() != null) {
            Optional<Medicine> medOpt = medicineRepository.findByCode(sm.getCode());
            if (!medOpt.isPresent() && sm.getName() != null) {
                List<Medicine> matches = medicineRepository.findByNameIgnoreCaseAndGenericNameIgnoreCaseAndManufacturerIgnoreCase(
                        sm.getName().trim(),
                        sm.getGenericName() != null ? sm.getGenericName().trim() : "",
                        sm.getManufacturer() != null ? sm.getManufacturer().trim() : ""
                );
                if (!matches.isEmpty()) {
                    medOpt = Optional.of(matches.get(0));
                }
            }
            if (medOpt.isPresent()) {
                Medicine med = medOpt.get();
                if (med.getInventory() != null) {
                    adminStock = med.getInventory().getQuantity() != null ? med.getInventory().getQuantity() : 0;
                    reorderLevel = med.getInventory().getReorderLevel() != null ? med.getInventory().getReorderLevel() : 10;
                }
                if (categoryDto == null && med.getCategory() != null) {
                    categoryDto = CategoryDto.builder()
                            .id(med.getCategory().getId())
                            .name(med.getCategory().getName())
                            .description(med.getCategory().getDescription())
                            .build();
                }
            }
        }

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
                .currentStock(adminStock)
                .reorderLevel(reorderLevel)
                .supplierAvailableQuantity(supplierQty)
                .stockStatus(calculateStockStatusValues(adminStock, reorderLevel, sm.getExpiryDate()))
                .build();
    }

    private List<StockStatus> calculateStockStatusValues(Integer quantity, Integer reorderLevel, LocalDate expiryDate) {
        List<StockStatus> statuses = new ArrayList<>();
        LocalDate today = LocalDate.now();
        LocalDate nearExpiryLimit = today.plusDays(nearExpiryDays);

        if (expiryDate != null) {
            if (expiryDate.isBefore(today)) {
                statuses.add(StockStatus.EXPIRED);
            } else if (!expiryDate.isAfter(nearExpiryLimit)) {
                if (quantity != null && quantity > 0) {
                    statuses.add(StockStatus.NEAR_EXPIRY);
                }
            }
        }
        if (quantity == null || quantity == 0) {
            statuses.add(StockStatus.OUT_OF_STOCK);
        } else if (quantity <= reorderLevel) {
            statuses.add(StockStatus.LOW_STOCK);
        } else {
            statuses.add(StockStatus.AVAILABLE);
        }

        if (statuses.isEmpty()) {
            statuses.add(StockStatus.AVAILABLE);
        }
        return statuses;
    }

    private Long getCurrentSupplierId() {
        org.springframework.security.core.Authentication authentication = 
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            java.util.Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                if (user.getRoles().stream().anyMatch(r -> r.getName() == ERole.ROLE_SUPPLIER)) {
                    Supplier supplier = resolveSupplierForUser(user);
                    if (supplier != null) {
                        return supplier.getId();
                    }
                }
            }
        }
        return null;
    }

    private Supplier resolveSupplierForUser(User user) {
        Optional<Supplier> supplierOpt = supplierRepository.findByUserId(user.getId());
        if (supplierOpt.isPresent()) {
            return supplierOpt.get();
        }

        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            Optional<Supplier> byEmail = supplierRepository.findByEmail(user.getEmail());
            if (byEmail.isPresent()) {
                Supplier s = byEmail.get();
                s.setUser(user);
                return supplierRepository.save(s);
            }
        }

        String name = user.getFullName() != null && !user.getFullName().isBlank() ? user.getFullName() : user.getUsername();
        List<Supplier> byName = supplierRepository.findByNameContainingIgnoreCase(name);
        if (!byName.isEmpty()) {
            Supplier s = byName.get(0);
            s.setUser(user);
            return supplierRepository.save(s);
        }

        Supplier newSupplier = Supplier.builder()
                .name(name)
                .contactPerson(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .user(user)
                .build();
        return supplierRepository.save(newSupplier);
    }
}
