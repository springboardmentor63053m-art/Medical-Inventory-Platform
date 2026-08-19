package com.medistock.medistock_backend.service.impl;

import com.medistock.medistock_backend.dto.*;
import com.medistock.medistock_backend.entity.OrderStatus;
import com.medistock.medistock_backend.entity.PurchaseOrder;
import com.medistock.medistock_backend.entity.Supplier;
import com.medistock.medistock_backend.entity.SupplierMedicine;
import com.medistock.medistock_backend.entity.User;
import com.medistock.medistock_backend.exception.BadRequestException;
import com.medistock.medistock_backend.exception.ResourceNotFoundException;
import com.medistock.medistock_backend.entity.Category;
import com.medistock.medistock_backend.repository.CategoryRepository;
import com.medistock.medistock_backend.repository.PurchaseOrderRepository;
import com.medistock.medistock_backend.repository.SupplierMedicineRepository;
import com.medistock.medistock_backend.repository.SupplierRepository;
import com.medistock.medistock_backend.repository.UserRepository;
import com.medistock.medistock_backend.service.SupplierPortalService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierPortalServiceImpl implements SupplierPortalService {

    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierMedicineRepository supplierMedicineRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public SupplierDashboardDto getSupplierDashboard(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        Supplier supplier = resolveSupplierForUser(user);

        SupplierDto supplierProfile = mapSupplierToDto(supplier);

        List<SupplierMedicine> medicines = supplierMedicineRepository.findBySupplierId(supplier.getId());
        List<MedicineResponse> suppliedMedicines = medicines.stream()
                .map(this::mapSupplierMedicineToResponse)
                .collect(Collectors.toList());

        List<PurchaseOrder> orders = purchaseOrderRepository.findBySupplierId(supplier.getId());
        List<PurchaseOrderResponse> purchaseOrders = orders.stream()
                .map(this::mapOrderToResponse)
                .collect(Collectors.toList());

        long pendingOrdersCount = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.PENDING)
                .count();

        long completedOrdersCount = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.APPROVED || o.getStatus() == OrderStatus.RECEIVED)
                .count();

        long totalOrdersCount = orders.size();

        BigDecimal totalOrderAmount = orders.stream()
                .map(o -> o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<PurchaseOrderResponse> recentActivity = purchaseOrders.stream()
                .sorted((a, b) -> {
                    if (a.getOrderDate() != null && b.getOrderDate() != null) {
                        return b.getOrderDate().compareTo(a.getOrderDate());
                    }
                    return 0;
                })
                .limit(5)
                .collect(Collectors.toList());

        return SupplierDashboardDto.builder()
                .supplierProfile(supplierProfile)
                .suppliedMedicines(suppliedMedicines)
                .purchaseOrders(purchaseOrders)
                .pendingOrdersCount(pendingOrdersCount)
                .completedOrdersCount(completedOrdersCount)
                .totalOrdersCount(totalOrdersCount)
                .totalOrderAmount(totalOrderAmount)
                .recentActivity(recentActivity)
                .build();
    }

    @Override
    @Transactional
    public MedicineResponse updateSupplierMedicineAvailability(String username, Long medicineId, Integer availableQuantity) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        Supplier supplier = resolveSupplierForUser(user);

        SupplierMedicine sm = supplierMedicineRepository.findById(medicineId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier medicine not found with id: " + medicineId));

        if (!sm.getSupplier().getId().equals(supplier.getId())) {
            throw new BadRequestException("Access denied: You do not own this medicine catalog record");
        }

        sm.setAvailableQuantity(availableQuantity != null ? availableQuantity : 0);
        SupplierMedicine saved = supplierMedicineRepository.save(sm);
        return mapSupplierMedicineToResponse(saved);
    }

    @Override
    @Transactional
    public void removeSupplierMedicine(String username, Long medicineId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        Supplier supplier = resolveSupplierForUser(user);

        SupplierMedicine sm = supplierMedicineRepository.findById(medicineId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier medicine not found with id: " + medicineId));

        if (!sm.getSupplier().getId().equals(supplier.getId())) {
            throw new BadRequestException("Access denied: You do not own this medicine catalog record");
        }

        supplierMedicineRepository.delete(sm);
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

    private SupplierDto mapSupplierToDto(Supplier supplier) {
        return SupplierDto.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .contactPerson(supplier.getContactPerson())
                .email(supplier.getEmail())
                .phone(supplier.getPhone())
                .address(supplier.getAddress())
                .build();
    }

    private PurchaseOrderResponse mapOrderToResponse(PurchaseOrder order) {
        SupplierDto supplierDto = order.getSupplier() != null ? mapSupplierToDto(order.getSupplier()) : null;

        List<PurchaseOrderResponse.ItemDto> items = order.getItems() != null ? order.getItems().stream()
                .map(item -> PurchaseOrderResponse.ItemDto.builder()
                        .id(item.getId())
                        .supplierMedicineId(item.getSupplierMedicine() != null ? item.getSupplierMedicine().getId() : null)
                        .medicineName(item.getSupplierMedicine() != null ? item.getSupplierMedicine().getName() : null)
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(item.getTotalPrice())
                        .build())
                .collect(Collectors.toList()) : new ArrayList<>();

        return PurchaseOrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .supplier(supplierDto)
                .createdByUsername(order.getCreatedBy() != null ? order.getCreatedBy().getUsername() : "System")
                .status(order.getStatus() != null ? order.getStatus().name() : null)
                .totalAmount(order.getTotalAmount())
                .orderDate(order.getOrderDate())
                .items(items)
                .build();
    }

    private MedicineResponse mapSupplierMedicineToResponse(SupplierMedicine sm) {
        CategoryDto categoryDto = sm.getCategory() != null ?
                CategoryDto.builder()
                        .id(sm.getCategory().getId())
                        .name(sm.getCategory().getName())
                        .description(sm.getCategory().getDescription())
                        .build() : null;

        SupplierDto supplierDto = mapSupplierToDto(sm.getSupplier());

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

    @Override
    @Transactional
    public MedicineResponse addSupplierMedicine(String username, MedicineRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        Supplier supplier = resolveSupplierForUser(user);

        // Check if medicine code already exists in this supplier's catalogue
        Optional<SupplierMedicine> existingSMOpt = supplierMedicineRepository
                .findBySupplierIdAndCode(supplier.getId(), request.getCode());
        if (existingSMOpt.isPresent()) {
            throw new BadRequestException("Medicine code already exists in your catalogue: " + request.getCode());
        }

        Category category = null;
        if (request.getCategoryName() != null && !request.getCategoryName().isBlank()) {
            Optional<Category> catOpt = categoryRepository.findByName(request.getCategoryName().strip());
            if (catOpt.isPresent()) {
                category = catOpt.get();
            } else {
                category = Category.builder()
                        .name(request.getCategoryName().strip())
                        .description("Supplier Added Category")
                        .build();
                category = categoryRepository.save(category);
            }
        } else if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
        }

        SupplierMedicine sm = SupplierMedicine.builder()
                .supplier(supplier)
                .name(request.getName())
                .code(request.getCode())
                .genericName(request.getGenericName())
                .manufacturer(request.getManufacturer())
                .price(request.getPrice())
                .expiryDate(request.getExpiryDate())
                .batchNumber(request.getBatchNumber())
                .category(category)
                .availableQuantity(request.getInitialQuantity() != null ? request.getInitialQuantity() : 0)
                .build();

        SupplierMedicine savedSM = supplierMedicineRepository.save(sm);
        return mapSupplierMedicineToResponse(savedSM);
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierDto getSupplierProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        Supplier supplier = resolveSupplierForUser(user);
        return mapSupplierToDto(supplier);
    }

    @Override
    @Transactional
    public SupplierDto updateSupplierProfile(String username, SupplierDto request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        Supplier supplier = resolveSupplierForUser(user);

        supplier.setContactPerson(request.getContactPerson());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());
        if (request.getName() != null && !request.getName().isBlank()) {
            supplier.setName(request.getName());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            supplier.setEmail(request.getEmail());
        }

        return mapSupplierToDto(supplierRepository.save(supplier));
    }
}
