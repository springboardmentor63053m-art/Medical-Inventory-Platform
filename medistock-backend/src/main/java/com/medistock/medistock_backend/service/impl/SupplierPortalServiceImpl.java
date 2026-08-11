package com.medistock.medistock_backend.service.impl;

import com.medistock.medistock_backend.dto.*;
import com.medistock.medistock_backend.entity.Medicine;
import com.medistock.medistock_backend.entity.OrderStatus;
import com.medistock.medistock_backend.entity.PurchaseOrder;
import com.medistock.medistock_backend.entity.Supplier;
import com.medistock.medistock_backend.entity.User;
import com.medistock.medistock_backend.exception.BadRequestException;
import com.medistock.medistock_backend.exception.ResourceNotFoundException;
import com.medistock.medistock_backend.repository.MedicineRepository;
import com.medistock.medistock_backend.repository.PurchaseOrderRepository;
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
    private final MedicineRepository medicineRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    @Override
    @Transactional
    public SupplierDashboardDto getSupplierDashboard(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        Supplier supplier = resolveSupplierForUser(user);

        SupplierDto supplierProfile = mapSupplierToDto(supplier);

        List<Medicine> medicines = medicineRepository.findBySupplierId(supplier.getId());
        List<MedicineResponse> suppliedMedicines = medicines.stream()
                .map(this::mapMedicineToResponse)
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

        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + medicineId));

        if (medicine.getSupplier() != null && !medicine.getSupplier().getId().equals(supplier.getId())) {
            throw new BadRequestException("Cannot update availability for medicine supplied by another supplier");
        }

        medicine.setSupplier(supplier);
        medicine.setSupplierAvailableQuantity(availableQuantity != null ? availableQuantity : 0);

        Medicine saved = medicineRepository.save(medicine);
        return mapMedicineToResponse(saved);
    }

    @Override
    @Transactional
    public void removeSupplierMedicine(String username, Long medicineId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        Supplier supplier = resolveSupplierForUser(user);

        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + medicineId));

        if (medicine.getSupplier() == null || !medicine.getSupplier().getId().equals(supplier.getId())) {
            throw new BadRequestException("Cannot remove medicine supplied by another supplier");
        }

        medicine.setSupplier(null);
        medicine.setSupplierAvailableQuantity(0);
        medicineRepository.save(medicine);
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

    private MedicineResponse mapMedicineToResponse(Medicine medicine) {
        CategoryDto categoryDto = medicine.getCategory() != null ?
                CategoryDto.builder()
                        .id(medicine.getCategory().getId())
                        .name(medicine.getCategory().getName())
                        .description(medicine.getCategory().getDescription())
                        .build() : null;

        SupplierDto supplierDto = medicine.getSupplier() != null ?
                mapSupplierToDto(medicine.getSupplier()) : null;

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
                .build();
    }

    private PurchaseOrderResponse mapOrderToResponse(PurchaseOrder order) {
        SupplierDto supplierDto = order.getSupplier() != null ? mapSupplierToDto(order.getSupplier()) : null;

        List<PurchaseOrderResponse.ItemDto> items = order.getItems() != null ? order.getItems().stream()
                .map(item -> PurchaseOrderResponse.ItemDto.builder()
                        .id(item.getId())
                        .medicineId(item.getMedicine() != null ? item.getMedicine().getId() : null)
                        .medicineName(item.getMedicine() != null ? item.getMedicine().getName() : null)
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
}
